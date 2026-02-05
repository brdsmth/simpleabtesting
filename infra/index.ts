import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const environment = pulumi.getStack();
const projectName = "simple-ab-testing";

const frontendDomain = config.get("frontendDomain"); // app.simpleabtesting.com
const certificateArn = config.get("certificateArn");

const tags = {
  Project: projectName,
  Environment: environment,
  ManagedBy: "Pulumi"
};

// VPC isolates our database and Lambda functions in a private network
const vpc = new aws.ec2.Vpc(`${projectName}-vpc`, {
  cidrBlock: "10.0.0.0/16",
  enableDnsHostnames: true,
  enableDnsSupport: true,
  tags: { ...tags, Name: `${projectName}-vpc` }
});

// Two subnets in different availability zones provide redundancy for RDS Aurora
const azs = aws.getAvailabilityZones({ state: "available" });
const publicSubnet1 = new aws.ec2.Subnet(`${projectName}-public-1`, {
  vpcId: vpc.id,
  cidrBlock: "10.0.1.0/24",
  availabilityZone: azs.then(azs => azs.names[0]),
  mapPublicIpOnLaunch: true,
  tags: { ...tags, Name: `${projectName}-public-1` }
});

const publicSubnet2 = new aws.ec2.Subnet(`${projectName}-public-2`, {
  vpcId: vpc.id,
  cidrBlock: "10.0.2.0/24",
  availabilityZone: azs.then(azs => azs.names[1]),
  mapPublicIpOnLaunch: true,
  tags: { ...tags, Name: `${projectName}-public-2` }
});

// Internet Gateway allows Lambda functions to make outbound requests (e.g., external APIs)
const igw = new aws.ec2.InternetGateway(`${projectName}-igw`, {
  vpcId: vpc.id,
  tags: { ...tags, Name: `${projectName}-igw` }
});

const routeTable = new aws.ec2.RouteTable(`${projectName}-rt`, {
  vpcId: vpc.id,
  routes: [{
    cidrBlock: "0.0.0.0/0",
    gatewayId: igw.id
  }],
  tags: { ...tags, Name: `${projectName}-rt` }
});

new aws.ec2.RouteTableAssociation(`${projectName}-rta-1`, {
  subnetId: publicSubnet1.id,
  routeTableId: routeTable.id
});

new aws.ec2.RouteTableAssociation(`${projectName}-rta-2`, {
  subnetId: publicSubnet2.id,
  routeTableId: routeTable.id
});

// Security group restricts database access to only Lambda functions within the VPC
const dbSecurityGroup = new aws.ec2.SecurityGroup(`${projectName}-db-sg`, {
  vpcId: vpc.id,
  description: "Allow PostgreSQL access from Lambda",
  ingress: [{
    protocol: "tcp",
    fromPort: 5432,
    toPort: 5432,
    cidrBlocks: ["10.0.0.0/16"]
  }],
  egress: [{
    protocol: "-1",
    fromPort: 0,
    toPort: 0,
    cidrBlocks: ["0.0.0.0/0"]
  }],
  tags: { ...tags, Name: `${projectName}-db-sg` }
});

// RDS requires a subnet group spanning multiple AZs for high availability
const dbSubnetGroup = new aws.rds.SubnetGroup(`${projectName}-db-subnet`, {
  subnetIds: [publicSubnet1.id, publicSubnet2.id],
  tags: { ...tags, Name: `${projectName}-db-subnet` }
});

// Aurora Serverless v2 for scaling
const dbCluster = new aws.rds.Cluster(`${projectName}-db`, {
  engine: "aurora-postgresql",
  engineMode: "provisioned",
  engineVersion: "15.8",
  databaseName: "simple_ab_testing",
  masterUsername: "simple_ab_testing_user",
  masterPassword: config.requireSecret("dbPassword"),
  dbSubnetGroupName: dbSubnetGroup.name,
  vpcSecurityGroupIds: [dbSecurityGroup.id],
  serverlessv2ScalingConfiguration: {
    minCapacity: 0.5,
    maxCapacity: 1
  },
  skipFinalSnapshot: true,
  tags
});

const dbInstance = new aws.rds.ClusterInstance(`${projectName}-db-instance`, {
  clusterIdentifier: dbCluster.id,
  instanceClass: "db.serverless",
  engine: "aurora-postgresql",
  engineVersion: "15.8",
  tags
});

// Helper to create S3 + CloudFront for static sites (lander, frontend, demo)
// CloudFront provides global CDN caching and HTTPS, S3 hosts the static files
function createStaticSite(name: string, buildDir: string, customDomain?: string, certArn?: string) {
  const bucket = new aws.s3.Bucket(`${projectName}-${name}`, {
    website: {
      indexDocument: "index.html",
      errorDocument: "index.html"
    },
    tags: { ...tags, Name: `${projectName}-${name}` }
  });

  new aws.s3.BucketPublicAccessBlock(`${projectName}-${name}-pab`, {
    bucket: bucket.id,
    blockPublicAcls: false,
    blockPublicPolicy: false,
    ignorePublicAcls: false,
    restrictPublicBuckets: false
  });

  // OAI ensures only CloudFront can access S3, not public internet directly
  const oai = new aws.cloudfront.OriginAccessIdentity(`${projectName}-${name}-oai`, {
    comment: `OAI for ${name}`
  });

  new aws.s3.BucketPolicy(`${projectName}-${name}-policy`, {
    bucket: bucket.id,
    policy: pulumi.all([bucket.arn, oai.iamArn]).apply(([bucketArn, oaiArn]) => 
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
          Sid: "AllowCloudFrontOAI",
          Effect: "Allow",
          Principal: {
            AWS: oaiArn
          },
          Action: "s3:GetObject",
          Resource: `${bucketArn}/*`
        }]
      })
    )
  });

  // CloudFront provides global edge caching, automatic HTTPS, and handles SPA routing
  const cdn = new aws.cloudfront.Distribution(`${projectName}-${name}-cdn`, {
    enabled: true,
    comment: `Simple A/B Testing - ${name.charAt(0).toUpperCase() + name.slice(1)}`,
    aliases: customDomain ? [customDomain] : undefined,
    origins: [{
      originId: bucket.bucket,
      domainName: bucket.bucketRegionalDomainName,
      s3OriginConfig: {
        originAccessIdentity: oai.cloudfrontAccessIdentityPath
      }
    }],
    defaultRootObject: "index.html",
    defaultCacheBehavior: {
      targetOriginId: bucket.bucket,
      viewerProtocolPolicy: "redirect-to-https",
      allowedMethods: ["GET", "HEAD", "OPTIONS"],
      cachedMethods: ["GET", "HEAD"],
      forwardedValues: {
        queryString: true,
        cookies: { forward: "none" }
      },
      minTtl: 0,
      defaultTtl: 3600,
      maxTtl: 86400,
      compress: true
    },
    customErrorResponses: [
      {
        errorCode: 404,
        responseCode: 200,
        responsePagePath: "/index.html"
      },
      {
        errorCode: 403,
        responseCode: 200,
        responsePagePath: "/index.html"
      }
    ],
    restrictions: {
      geoRestriction: {
        restrictionType: "none"
      }
    },
    viewerCertificate: customDomain && certArn ? {
      acmCertificateArn: certArn,
      sslSupportMethod: "sni-only",
      minimumProtocolVersion: "TLSv1.2_2021"
    } : {
      cloudfrontDefaultCertificate: true
    },
    tags
  });

  return { bucket, cdn };
}

const lander = createStaticSite("lander", "../lander/dist");
const frontend = createStaticSite("frontend", "../frontend/dist", frontendDomain, certificateArn);
const demo = createStaticSite("demo", "../demo/dist");

// Lambda needs VPC access to connect to RDS, security group allows outbound traffic
const lambdaSecurityGroup = new aws.ec2.SecurityGroup(`${projectName}-lambda-sg`, {
  vpcId: vpc.id,
  description: "Security group for Lambda functions",
  egress: [{
    protocol: "-1",
    fromPort: 0,
    toPort: 0,
    cidrBlocks: ["0.0.0.0/0"]
  }],
  tags: { ...tags, Name: `${projectName}-lambda-sg` }
});

// IAM role allows Lambda service to assume execution permissions
const lambdaRole = new aws.iam.Role(`${projectName}-lambda-role`, {
  assumeRolePolicy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [{
      Action: "sts:AssumeRole",
      Principal: {
        Service: "lambda.amazonaws.com"
      },
      Effect: "Allow"
    }]
  }),
  tags
});

// VPC policy lets Lambda create ENIs to access VPC resources (RDS)
new aws.iam.RolePolicyAttachment(`${projectName}-lambda-vpc-policy`, {
  role: lambdaRole.name,
  policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
});

// Basic execution policy allows Lambda to write logs to CloudWatch
new aws.iam.RolePolicyAttachment(`${projectName}-lambda-basic-policy`, {
  role: lambdaRole.name,
  policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
});

// Lambda runs our Node.js API with database connection string injected
const apiLambda = new aws.lambda.Function(`${projectName}-api`, {
  runtime: "nodejs20.x",
  handler: "index.handler",
  role: lambdaRole.arn,
  code: new pulumi.asset.AssetArchive({
    ".": new pulumi.asset.FileArchive("../api-lambda-bundle")
  }),
  environment: {
    variables: {
      DATABASE_URL: pulumi.interpolate`postgresql://simple_ab_testing_user:${config.requireSecret("dbPassword")}@${dbCluster.endpoint}:5432/simple_ab_testing`,
      NODE_ENV: "production"
    }
  },
  vpcConfig: {
    subnetIds: [publicSubnet1.id, publicSubnet2.id],
    securityGroupIds: [lambdaSecurityGroup.id]
  },
  timeout: 30,
  memorySize: 512,
  tags
});

// HTTP API Gateway is cheaper than REST API and includes built-in CORS support
const apiGateway = new aws.apigatewayv2.Api(`${projectName}-api-gateway`, {
  protocolType: "HTTP",
  corsConfiguration: {
    allowOrigins: ["*"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["*"]
  },
  tags
});

const integration = new aws.apigatewayv2.Integration(`${projectName}-api-integration`, {
  apiId: apiGateway.id,
  integrationType: "AWS_PROXY",
  integrationUri: apiLambda.arn,
  payloadFormatVersion: "2.0"
});

// Default route catches all paths and forwards to Lambda
const route = new aws.apigatewayv2.Route(`${projectName}-api-route`, {
  apiId: apiGateway.id,
  routeKey: "$default",
  target: pulumi.interpolate`integrations/${integration.id}`
});

const stage = new aws.apigatewayv2.Stage(`${projectName}-api-stage`, {
  apiId: apiGateway.id,
  name: "$default",
  autoDeploy: true,
  tags
});

// Permission allows API Gateway to invoke our Lambda function
new aws.lambda.Permission(`${projectName}-api-lambda-permission`, {
  action: "lambda:InvokeFunction",
  function: apiLambda.name,
  principal: "apigateway.amazonaws.com",
  sourceArn: pulumi.interpolate`${apiGateway.executionArn}/*`
});

// SDK needs to be loaded from customer websites, so CloudFront provides global CDN
// with aggressive caching (1 day default, 1 year max) and CORS headers
const sdkBucket = new aws.s3.Bucket(`${projectName}-sdk`, {
  tags: { ...tags, Name: `${projectName}-sdk` }
});

new aws.s3.BucketPublicAccessBlock(`${projectName}-sdk-pab`, {
  bucket: sdkBucket.id,
  blockPublicAcls: false,
  blockPublicPolicy: false,
  ignorePublicAcls: false,
  restrictPublicBuckets: false
});

const sdkOai = new aws.cloudfront.OriginAccessIdentity(`${projectName}-sdk-oai`, {
  comment: "OAI for SDK distribution"
});

new aws.s3.BucketPolicy(`${projectName}-sdk-policy`, {
  bucket: sdkBucket.id,
  policy: pulumi.all([sdkBucket.arn, sdkOai.iamArn]).apply(([bucketArn, oaiArn]) =>
    JSON.stringify({
      Version: "2012-10-17",
      Statement: [{
        Effect: "Allow",
        Principal: { AWS: oaiArn },
        Action: "s3:GetObject",
        Resource: `${bucketArn}/*`
      }]
    })
  )
});

// SDK CDN configured for long caching and CORS to allow embedding on any site
const sdkCdn = new aws.cloudfront.Distribution(`${projectName}-sdk-cdn`, {
  enabled: true,
  comment: "Simple A/B Testing - SDK Distribution",
  origins: [{
    originId: sdkBucket.bucket,
    domainName: sdkBucket.bucketRegionalDomainName,
    s3OriginConfig: {
      originAccessIdentity: sdkOai.cloudfrontAccessIdentityPath
    }
  }],
  defaultCacheBehavior: {
    targetOriginId: sdkBucket.bucket,
    viewerProtocolPolicy: "https-only",
    allowedMethods: ["GET", "HEAD", "OPTIONS"],
    cachedMethods: ["GET", "HEAD"],
    forwardedValues: {
      queryString: false,
      cookies: { forward: "none" },
      headers: ["Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"]
    },
    minTtl: 0,
    defaultTtl: 86400,
    maxTtl: 31536000,
    compress: true
  },
  restrictions: {
    geoRestriction: {
      restrictionType: "none"
    }
  },
  viewerCertificate: {
    cloudfrontDefaultCertificate: true
  },
  tags
});

export const landerUrl = lander.cdn.domainName;
export const frontendUrl = frontendDomain || frontend.cdn.domainName;
export const frontendCloudFrontUrl = frontend.cdn.domainName;
export const demoUrl = demo.cdn.domainName;
export const apiUrl = apiGateway.apiEndpoint;
export const sdkUrl = pulumi.interpolate`https://${sdkCdn.domainName}/simple-ab-testing.umd.js`;
export const databaseEndpoint = dbCluster.endpoint;
export const landerBucket = lander.bucket.bucket;
export const frontendBucket = frontend.bucket.bucket;
export const demoBucket = demo.bucket.bucket;
export const sdkBucketName = sdkBucket.bucket;
export const landerDistributionId = lander.cdn.id;
export const frontendDistributionId = frontend.cdn.id;
export const demoDistributionId = demo.cdn.id;
export const sdkDistributionId = sdkCdn.id;
