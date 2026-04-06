export const env = {
  get apiUrl(): string {
    const value = import.meta.env.VITE_API_URL;
    if (!value) throw new Error('VITE_API_URL is required');
    return value;
  },
  get appUrl(): string {
    const value = import.meta.env.VITE_APP_URL;
    if (!value) throw new Error('VITE_APP_URL is required');
    return value;
  },
} as const;
