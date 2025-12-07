import {
  Collection,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  Opt,
  Property,
  type Ref,
  Unique,
} from '@mikro-orm/core';

import { PgBaseEntity } from '../base-entities';
import { Domain } from './domain.entity';
import { OAuthConnection } from './oauth-connection.entity';
import { Plan } from './plan.entity';
import { Subscription } from './subscription.entity';
import { UsageQuota } from './usage-quota.entity';

/** Default plan ID for new users */
export const DEFAULT_PLAN_ID = 'sandbox';

@Entity()
export class User extends PgBaseEntity {
  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string' })
  @Unique()
  @Index()
  email!: string;

  @Property({ type: 'string', nullable: true, hidden: true })
  password?: string;

  @Property({ type: 'boolean' })
  emailVerified: boolean & Opt = false;

  @ManyToOne(() => Plan, { ref: true })
  @Index()
  plan!: Ref<Plan>;

  @Property({ type: 'boolean' })
  isActive: boolean & Opt = true;

  /** Auth token for CLI authentication */
  @Property({ type: 'string', nullable: true })
  @Unique()
  @Index()
  authToken?: string;

  @OneToMany(() => Domain, (domain) => domain.user)
  domains = new Collection<Domain>(this);

  @OneToMany(() => UsageQuota, (quota) => quota.user)
  usageQuotas = new Collection<UsageQuota>(this);

  @OneToMany(() => OAuthConnection, (connection) => connection.user)
  oauthConnections = new Collection<OAuthConnection>(this);

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions = new Collection<Subscription>(this);
}
