/**
 * Centralized Environment Utility
 * Prevents direct process.env scattered access across the infrastructure module.
 */

export const getEnvironment = (): string => {
  return process.env.NODE_ENV || 'production'; // Fail secure: default to production if unspecified
};

export const isDevelopment = (): boolean => {
  return getEnvironment() === 'development';
};

export const isProduction = (): boolean => {
  return getEnvironment() === 'production';
};

export const assertDevelopment = (operationName: string) => {
  if (!isDevelopment()) {
    throw new Error(
      `[SECURITY RESTRICTION] Operation '${operationName}' is strictly forbidden in production environments.`
    );
  }
};
