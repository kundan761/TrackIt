import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const config = {
  get: (key: string, defaultValue?: any): any => {
    const envKey = key.toUpperCase().replace(/\./g, '_');

    if (process.env[envKey] !== undefined) {
      const val = process.env[envKey];

      if (val === 'true') return true;
      if (val === 'false') return false;
      if (!isNaN(Number(val)) && val !== '') return Number(val);
      
      return val;
    }

    return defaultValue;
  }
};
