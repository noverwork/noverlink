import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Plan, User } from '@noverlink/backend-shared';
import { Environment } from '@noverlink/shared';

const DEV_USER = {
  id: 'dev-user-00000000-0000-0000-0000-000000000001',
  name: 'Dev User',
  email: 'dev@localhost',
  authToken: 'nv_dev_token_for_local_development_only',
  planId: 'sandbox',
};

export class DevUserSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Only run in development
    if (process.env.NODE_ENV === Environment.Production) {
      // eslint-disable-next-line no-console
      console.log('Skipping DevUserSeeder in production environment');
      return;
    }

    const plan = await em.findOne(Plan, { id: DEV_USER.planId });
    if (!plan) {
      throw new Error(
        `Plan "${DEV_USER.planId}" not found. Run PlanSeeder first.`
      );
    }

    const existing = await em.findOne(User, { email: DEV_USER.email });

    if (existing) {
      // eslint-disable-next-line no-console
      console.log(`Dev user already exists: ${DEV_USER.email}`);
      // Update auth token in case it changed
      existing.authToken = DEV_USER.authToken;
      existing.name = DEV_USER.name;
    } else {
      const user = em.create(User, {
        id: DEV_USER.id,
        name: DEV_USER.name,
        email: DEV_USER.email,
        emailVerified: true,
        authToken: DEV_USER.authToken,
        plan,
        isActive: true,
      });
      em.persist(user);
      // eslint-disable-next-line no-console
      console.log(`Dev user created: ${DEV_USER.email}`);
    }

    await em.flush();

    /* eslint-disable no-console */
    console.log('');
    console.log('=== Dev User Credentials ===');
    console.log(`Email:      ${DEV_USER.email}`);
    console.log(`Auth Token: ${DEV_USER.authToken}`);
    console.log('');
    console.log('To use with CLI, add to ~/.noverlink/config.toml:');
    console.log(`auth_token = "${DEV_USER.authToken}"`);
    console.log('');
    /* eslint-enable no-console */
  }
}
