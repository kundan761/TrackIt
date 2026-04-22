export const config = {
  get: (key: string, defaultValue?: any): any => {
    // Vite requires VITE_ prefix for environment variables to be exposed to the client
    const strippedKey = key.startsWith('client.') ? key.replace('client.', '') : key;
    const viteKey = strippedKey.toUpperCase().startsWith('VITE_') 
      ? strippedKey.toUpperCase() 
      : `VITE_${strippedKey.toUpperCase()}`;
    
    if ((import.meta as any).env[viteKey] !== undefined) {
      return (import.meta as any).env[viteKey];
    }

    return defaultValue;
  }
};
