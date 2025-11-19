import dotenv from 'dotenv';

dotenv.config();

const REQUIRED_VARS = ['MONGO_URL', 'JWT_SECRET'] as const;

type RequiredVar = (typeof REQUIRED_VARS)[number];

type EnvConfig = Record<RequiredVar, string> & {
  PORT: number;
};

const getEnvVar = (key: RequiredVar): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const env: EnvConfig = {
  MONGO_URL: getEnvVar('MONGO_URL'),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  PORT: Number(process.env.PORT) || 3000,
};

export default env;
