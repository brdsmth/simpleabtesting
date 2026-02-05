import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, rm, cp } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outdir = join(__dirname, '..', 'api-lambda-bundle');

async function build() {
  try {
    console.log('Building Lambda bundle...');
    
    // Clean output directory
    await rm(outdir, { recursive: true, force: true });
    await mkdir(outdir, { recursive: true });

    // Bundle the Lambda function using CommonJS for better Lambda compatibility
    await esbuild.build({
      entryPoints: [join(__dirname, 'handler.js')],
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'cjs',
      outfile: join(outdir, 'index.js'),
      external: ['pg-native', 'aws-sdk'],
      minify: false,
      sourcemap: true,
      mainFields: ['main', 'module'],
      logLevel: 'info'
    });

    // Copy migrations folder
    const migrationsSource = join(__dirname, 'migrations');
    const migrationsTarget = join(outdir, 'migrations');
    try {
      await cp(migrationsSource, migrationsTarget, { recursive: true });
      console.log('Migrations folder copied successfully');
    } catch (error) {
      console.warn('Warning: Could not copy migrations folder:', error.message);
    }

    console.log('Lambda bundle built successfully!');
    console.log(`Output: ${outdir}/index.js`);
    console.log('Ready to deploy with Pulumi!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
