# Infrastructure

AWS deployment using Pulumi: Aurora Serverless v2, Lambda + API Gateway, S3 + CloudFront.

## Quick Setup

```bash
# 1. Install and configure
npm install
aws configure
pulumi login
pulumi stack init prod

# 2. Set config
pulumi config set aws:region us-east-1
pulumi config set --secret simple-ab-testing:dbPassword "YourPassword"
```

## Deploy

```bash
# Build API
cd api
npm install
npm run build:lambda

# Build Frontend
cd ../frontend
npm install
npm run build

# Build Lander
cd ../lander
npm install
npm run build

# Build Demo
cd ../demo
npm install
npm run build

# Build SDK
cd ../sdk
npm install
npm run build

# Deploy infrastructure
cd ../infra
pulumi up

# Upload static assets
aws s3 sync ../frontend/dist s3://$(pulumi stack output frontendBucket) --delete
aws s3 sync ../lander/dist s3://$(pulumi stack output landerBucket) --delete
aws s3 sync ../demo/dist s3://$(pulumi stack output demoBucket) --delete
aws s3 cp ../sdk/dist/simple-ab-testing.umd.js s3://$(pulumi stack output sdkBucketName)/simple-ab-testing.umd.js

# Invalidate CloudFront caches
aws cloudfront create-invalidation --distribution-id $(pulumi stack output frontendDistributionId) --paths "/*"
aws cloudfront create-invalidation --distribution-id $(pulumi stack output landerDistributionId) --paths "/*"
aws cloudfront create-invalidation --distribution-id $(pulumi stack output demoDistributionId) --paths "/*"
aws cloudfront create-invalidation --distribution-id $(pulumi stack output sdkDistributionId) --paths "/*"

# Get URLs
pulumi stack output
```

## Update

```bash
# For API changes
cd api
npm run build:lambda
cd ../infra
pulumi up

# For frontend changes
cd frontend
npm run build
aws s3 sync dist s3://$(cd ../infra && pulumi stack output frontendBucket) --delete
aws cloudfront create-invalidation --distribution-id $(cd ../infra && pulumi stack output frontendDistributionId) --paths "/*"

# For SDK changes
cd sdk
npm run build
aws s3 cp dist/simple-ab-testing.umd.js s3://$(cd ../infra && pulumi stack output sdkBucketName)/simple-ab-testing.umd.js
aws cloudfront create-invalidation --distribution-id $(cd ../infra && pulumi stack output sdkDistributionId) --paths "/*"
```

## Cleanup

```bash
pulumi destroy
```
