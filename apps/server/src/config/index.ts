export const config = {
  get: (key: string, defaultValue?: any): any => {
    // Convert dot notation (e.g., 'server.port') to uppercase with underscores (e.g., 'PORT')
    // We strip 'server.' prefix first if it exists
    const strippedKey = key.startsWith('server.') ? key.replace('server.', '') : key;
    const envKey = strippedKey.toUpperCase().replace(/\./g, '_');

    if (process.env[envKey] !== undefined) {
      const val = process.env[envKey];
      
      // Try to parse numbers or booleans if they look like them
      if (val === 'true') return true;
      if (val === 'false') return false;
      if (!isNaN(Number(val)) && val !== '') return Number(val);
      
      return val;
    }

    return defaultValue;
  }
};
