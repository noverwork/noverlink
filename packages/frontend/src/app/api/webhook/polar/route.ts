import { Webhooks } from '@polar-sh/nextjs';

const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
if (!webhookSecret) {
  throw new Error('POLAR_WEBHOOK_SECRET is required');
}

export const POST = Webhooks({
  webhookSecret,
  onPayload: async (payload) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    switch (payload.type) {
      case 'checkout.updated':
        if (payload.data.status === 'succeeded') {
          // Sync subscription to backend
          await fetch(`${apiUrl}/billing/webhook/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerId: payload.data.customerId,
              customerEmail: payload.data.customerEmail,
              productId: payload.data.productId,
              subscriptionId: payload.data.subscriptionId,
            }),
          });
        }
        break;

      case 'subscription.active':
        await fetch(`${apiUrl}/billing/webhook/subscription-active`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscriptionId: payload.data.id,
            customerId: payload.data.customerId,
            productId: payload.data.productId,
            status: payload.data.status,
            currentPeriodEnd: payload.data.currentPeriodEnd,
          }),
        });
        break;

      case 'subscription.canceled':
      case 'subscription.revoked':
        await fetch(`${apiUrl}/billing/webhook/subscription-canceled`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscriptionId: payload.data.id,
          }),
        });
        break;
    }
  },
});
