import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import yaml from 'yaml'

let clientConfig = {};
try {
  const envFile = fs.readFileSync(path.resolve(__dirname, '../../env.yaml'), 'utf8');
  const envVars = yaml.parse(envFile);
  clientConfig = envVars.client || {};
} catch(e) {
  console.warn('Could not load env.yaml', e);
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.CLIENT_CONFIG': JSON.stringify(clientConfig)
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
