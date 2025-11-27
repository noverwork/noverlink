import {
  Collection,
  Entity,
  Enum,
  Index,
  OneToMany,
  Opt,
  Property,
  Unique,
} from '@mikro-orm/core';

import { PgBaseEntity } from '../base-entities';
import { Domain } from './domain.entity';
import { OAuthConnection } from './oauth-connection.entity';
import { Tunnel } from './tunnel.entity';
import { UsageQuota } from './usage-quota.entity';

export enum UserPlan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

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

  @Enum(() => UserPlan)
  plan: UserPlan & Opt = UserPlan.FREE;

  @Property({ type: 'number' })
  maxTunnels: number & Opt = 1;

  @Property({ type: 'number' })
  maxBandwidthMb: number & Opt = 1000;

  @Property({ type: 'string', nullable: true, hidden: true })
  apiKey?: string;

  @Property({ type: 'boolean' })
  isActive: boolean & Opt = true;

  @OneToMany(() => Domain, (domain) => domain.user)
  domains = new Collection<Domain>(this);

  @OneToMany(() => Tunnel, (tunnel) => tunnel.user)
  tunnels = new Collection<Tunnel>(this);

  @OneToMany(() => UsageQuota, (quota) => quota.user)
  usageQuotas = new Collection<UsageQuota>(this);

  @OneToMany(() => OAuthConnection, (connection) => connection.user)
  oauthConnections = new Collection<OAuthConnection>(this);
}
