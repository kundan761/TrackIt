const envConfig = (import.meta as any).env.CLIENT_CONFIG || {};

export const config = {
  get: (key: string, defaultValue?: any): any => {
    if (key.startsWith('client.')) {
      key = key.replace('client.', '');
    }
    
    if (envConfig[key] !== undefined) {
      return envConfig[key];
    }
    
    const viteKey = key.toUpperCase().startsWith('VITE_') ? key.toUpperCase() : `VITE_${key.toUpperCase()}`;
    if ((import.meta as any).env[viteKey] !== undefined) {
      return (import.meta as any).env[viteKey];
    }

    return defaultValue;
  }
};
