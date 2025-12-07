import {
  Collection,
  Entity,
  OneToMany,
  Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

import { User } from './user.entity';

/**
 * Plan entity - defines subscription tiers and their limits
 *
 * Plans are identified by string IDs (e.g., 'sandbox', 'starter', 'pro')
 * rather than auto-generated IDs for easier reference and configuration.
 */
@Entity()
export class Plan {
  /** Plan identifier (e.g., 'sandbox', 'starter', 'pro', 'enterprise') */
  @PrimaryKey({ type: 'string' })
  id!: string;

  /** Display name (e.g., 'Sandbox', 'Starter', 'Pro') */
  @Property({ type: 'string' })
  name!: string;

  /** Base domain for tunnels on this plan (e.g., 'noverlink-free.app') */
  @Property({ type: 'string' })
  baseDomain!: string;

  /** Maximum concurrent tunnels allowed */
  @Property({ type: 'number' })
  maxTunnels: number & Opt = 1;

  /** Maximum bandwidth in MB per month (0 = unlimited) */
  @Property({ type: 'number' })
  maxBandwidthMb: number & Opt = 1000;

  /** Session time limit in minutes (null = unlimited) */
  @Property({ type: 'number', nullable: true })
  sessionLimitMinutes?: number;

  /** Whether this plan allows custom/reserved subdomains */
  @Property({ type: 'boolean' })
  allowReservedSubdomain: boolean & Opt = false;

  /** Sort order for display (lower = first) */
  @Property({ type: 'number' })
  sortOrder: number & Opt = 0;

  /** Whether this plan is currently available for new signups */
  @Property({ type: 'boolean' })
  isActive: boolean & Opt = true;

  @Property()
  createdAt: Date & Opt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();

  // ─── Relations ─────────────────────────────────────────────────

  @OneToMany(() => User, (user) => user.plan)
  users = new Collection<User>(this);
}
