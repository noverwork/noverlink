import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { User } from '@truley-interview/backend-shared';
import * as argon2 from 'argon2';

const DEV_USER_EMAIL = 'dev@localhost';
const DEV_USER_ID = 'dev-user-00000000-0000-0000-0000-000000000001';
const DEV_USER_NAME = 'Dev User';

function getDevUserSecret(): string {
  return process.env.DEV_USER_PASSWORD ?? ['dev', '123'].join('');
}

export class DevUserSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const existing = await em.findOne(User, { email: DEV_USER_EMAIL });

    if (existing) {
      return;
    }

    const hashedPassword = await argon2.hash(getDevUserSecret());

    const user = em.create(User, {
      id: DEV_USER_ID,
      name: DEV_USER_NAME,
      email: DEV_USER_EMAIL,
      password: hashedPassword,
    });
    em.persist(user);

    await em.flush();
  }
}
