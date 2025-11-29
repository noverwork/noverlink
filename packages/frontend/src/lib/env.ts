function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

/**
 * Type-safe environment variables for the frontend
 */
export const env = {
  apiUrl: getEnvVar('NEXT_PUBLIC_API_URL'),
  appUrl: getEnvVar('NEXT_PUBLIC_APP_URL'),
} as const;
