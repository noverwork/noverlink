import { Checkout } from '@polar-sh/nextjs';

const accessToken = process.env.POLAR_ACCESS_TOKEN;
if (!accessToken) {
  throw new Error('POLAR_ACCESS_TOKEN is required');
}

export const GET = Checkout({
  accessToken,
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billings?success=true`,
  server: 'sandbox',
});
