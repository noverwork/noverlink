import {
  Collection,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  Opt,
  Property,
  Unique,
} from '@mikro-orm/core';

import { PgBaseEntity } from '../base-entities';
import { TunnelSession } from './tunnel-session.entity';
import { User } from './user.entity';

@Entity()
export class Domain extends PgBaseEntity {
  @ManyToOne(() => User)
  @Index()
  user!: User;

  /** Subdomain (e.g., "myapp" for myapp.noverlink.io) OR custom domain (e.g., "tunnel.mycompany.com") */
  @Property({ type: 'string' })
  @Unique()
  @Index()
  hostname!: string;

  /** True if user reserved this subdomain */
  @Property({ type: 'boolean' })
  isReserved: boolean & Opt = false;

  // ─── Relations ─────────────────────────────────────────────────

  @OneToMany(() => TunnelSession, (session) => session.domain)
  sessions = new Collection<TunnelSession>(this);
}
