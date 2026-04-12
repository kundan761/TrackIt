import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../../../../env.yaml');

let envConfig: any = {};

try {
  if (fs.existsSync(envPath)) {
    const fileContents = fs.readFileSync(envPath, 'utf8');
    envConfig = yaml.parse(fileContents);
  } else {
    console.warn(`env.yaml not found at ${envPath}, falling back to process.env`);
  }
} catch (error) {
  console.warn(`Failed to parse env.yaml at ${envPath}.`);
}

export const config = {
  get: (key: string, defaultValue?: any): any => {
    const keys = key.split('.');
    let result = envConfig;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        result = undefined;
        break;
      }
    }

    if (result !== undefined) {
      return result;
    }

    if (key.startsWith('server.')) {
      const strippedKey = key.replace('server.', '');
      if (envConfig.server && envConfig.server[strippedKey] !== undefined) {
        return envConfig.server[strippedKey];
      }
      if (envConfig[strippedKey] !== undefined) {
        return envConfig[strippedKey];
      }
    }

    const upperKey = key.replace(/\./g, '_').toUpperCase();
    if (process.env[upperKey] !== undefined) {
      return process.env[upperKey];
    }
    
    const plainUpperKey = key.replace('server.', '').toUpperCase();
    if (process.env[plainUpperKey] !== undefined) {
      return process.env[plainUpperKey];
    }

    return defaultValue;
  }
};
