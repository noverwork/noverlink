import { Checkout } from '@polar-sh/nextjs';

// Use empty string fallback for build - checkout will fail at runtime if not set
export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN ?? '',
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billings?success=true`,
  server: process.env.POLAR_SERVER === 'production' ? 'production' : 'sandbox',
});
