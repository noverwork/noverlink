import { Entity, Enum, Index, OneToMany, Property, Unique } from '@mikro-orm/core';

import { PgBaseEntity } from '../base-entities';
import { Domain } from './domain.entity';
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

  @Property({ type: 'string', hidden: true })
  password!: string;

  @Enum(() => UserPlan)
  plan: UserPlan = UserPlan.FREE;

  @Property({ type: 'number' })
  maxTunnels = 1;

  @Property({ type: 'number' })
  maxBandwidthMb = 1000;

  @Property({ type: 'string', nullable: true, hidden: true })
  apiKey?: string;

  @Property({ type: 'boolean' })
  isActive = true;

  @OneToMany(() => Domain, (domain) => domain.user)
  domains!: Domain[];

  @OneToMany(() => Tunnel, (tunnel) => tunnel.user)
  tunnels!: Tunnel[];

  @OneToMany(() => UsageQuota, (quota) => quota.user)
  usageQuotas!: UsageQuota[];
}
