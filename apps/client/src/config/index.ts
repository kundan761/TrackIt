export const config = {
  get: (key: string, defaultValue?: any): any => {
    const envKey = key.toUpperCase().replace(/\./g, '_');
    const value = (import.meta as any).env[envKey];
    return value !== undefined ? value : defaultValue;
  }
};
