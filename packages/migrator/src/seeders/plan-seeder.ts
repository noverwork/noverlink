import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Plan } from '@noverlink/backend-shared';

// Domain configuration (required)
const FREE_DOMAIN = process.env.FREE_DOMAIN;
const PAID_DOMAIN = process.env.PAID_DOMAIN;

if (!FREE_DOMAIN || !PAID_DOMAIN) {
  throw new Error(
    'FREE_DOMAIN and PAID_DOMAIN environment variables are required for seeding plans'
  );
}

const PLANS = [
  {
    id: 'sandbox',
    name: 'Sandbox',
    baseDomain: FREE_DOMAIN,
    maxTunnels: 1,
    maxBandwidthMb: 1000, // 1 GB
    sessionLimitMinutes: 60, // 1 hour
    allowReservedSubdomain: false,
    sortOrder: 0,
    isActive: true,
  },
  {
    id: 'starter',
    name: 'Starter',
    baseDomain: PAID_DOMAIN,
    maxTunnels: 3,
    maxBandwidthMb: 30000, // 30 GB
    sessionLimitMinutes: null,
    allowReservedSubdomain: true,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    baseDomain: PAID_DOMAIN,
    maxTunnels: 999999, // unlimited
    maxBandwidthMb: 100000, // 100 GB
    sessionLimitMinutes: null,
    allowReservedSubdomain: true,
    sortOrder: 2,
    isActive: true,
  },
];

export class PlanSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    for (const data of PLANS) {
      const existing = await em.findOne(Plan, { id: data.id });

      if (existing) {
        existing.name = data.name;
        existing.baseDomain = data.baseDomain;
        existing.maxTunnels = data.maxTunnels;
        existing.maxBandwidthMb = data.maxBandwidthMb;
        existing.sessionLimitMinutes = data.sessionLimitMinutes ?? undefined;
        existing.allowReservedSubdomain = data.allowReservedSubdomain;
        existing.sortOrder = data.sortOrder;
        existing.isActive = data.isActive;
      } else {
        const plan = em.create(Plan, {
          id: data.id,
          name: data.name,
          baseDomain: data.baseDomain,
          maxTunnels: data.maxTunnels,
          maxBandwidthMb: data.maxBandwidthMb,
          sessionLimitMinutes: data.sessionLimitMinutes ?? undefined,
          allowReservedSubdomain: data.allowReservedSubdomain,
          sortOrder: data.sortOrder,
          isActive: data.isActive,
        });
        em.persist(plan);
      }
    }

    await em.flush();
  }
}
