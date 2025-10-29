const required = [
  'VITE_API_URL',
  'VITE_GRAPHQL_URL',
  'VITE_WEBSOCKET_URL'
] as const;

type RequiredEnv = typeof required[number];

type EnvConfig = Record<RequiredEnv, string> & {
  VITE_STORAGE_KEY: string;
};

const env = required.reduce((acc, key) => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing environment variable ${key}`);
  }
  acc[key] = value;
  return acc;
}, {} as Record<RequiredEnv, string>);

export const envConfig: EnvConfig = {
  ...env,
  VITE_STORAGE_KEY: import.meta.env.VITE_STORAGE_KEY ?? 'ecommerce-c2c',
};
