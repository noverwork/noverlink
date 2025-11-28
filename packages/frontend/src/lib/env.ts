/**
 * Type-safe environment variables for the frontend
 */
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL!,
  appUrl: process.env.NEXT_PUBLIC_APP_URL!,
} as const;
