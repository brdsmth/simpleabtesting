import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SimpleABTesting',
      fileName: 'simple-ab-testing',
      formats: ['umd', 'es']
    },
    rollupOptions: {
      output: {
        globals: {}
      }
    },
    minify: false // Disable minify for easier debugging
  },
  server: {
    port: 3002,
    cors: true,
    // Serve built files in development
    middlewareMode: false
  },
  // Configure for library development
  define: {
    'process.env.NODE_ENV': '"development"'
  }
});
