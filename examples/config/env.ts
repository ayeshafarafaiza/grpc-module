import dotenv from 'dotenv';
import path from 'path';
import { Logger } from '../../src/index.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let isInitialized = false;

interface AppConfig {
  NODE_ENV: string;
  GRPC_HOST: string;
  PRODUCT_SERVICE_PORT: number;
  ORDER_SERVICE_PORT: number;
}

let config: AppConfig;

export const initConfig = () => {
  if (isInitialized) return;

  const envPath = path.resolve(__dirname, `../../.env.${process.env.NODE_ENV || 'development'}`);
  dotenv.config({ path: envPath });

  // Fallback to .env if specific environment file not found
  dotenv.config();

  config = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    GRPC_HOST: process.env.GRPC_HOST || '127.0.0.1',
    PRODUCT_SERVICE_PORT: parseInt(process.env.PRODUCT_SERVICE_PORT || '50051', 10),
    ORDER_SERVICE_PORT: parseInt(process.env.ORDER_SERVICE_PORT || '50052', 10)
  };

  Logger.info(`Loaded environment for examples: ${config.NODE_ENV}`);
  isInitialized = true;
};

export const getConfig = (): AppConfig => {
  if (!isInitialized) {
    initConfig();
  }
  return config;
};

export const isDevelopment = (): boolean => {
  return getConfig().NODE_ENV === 'development';
};
