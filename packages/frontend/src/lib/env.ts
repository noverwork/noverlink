/**
 * Type-safe environment variables for the frontend
 * These are inlined at build time by Next.js
 */
export const env = {
  get apiUrl(): string {
    const value = process.env.NEXT_PUBLIC_API_URL;
    if (!value) throw new Error('NEXT_PUBLIC_API_URL is required');
    return value;
  },
  get appUrl(): string {
    const value = process.env.NEXT_PUBLIC_APP_URL;
    if (!value) throw new Error('NEXT_PUBLIC_APP_URL is required');
    return value;
  },
} as const;
