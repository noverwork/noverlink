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
import { TunnelSession } from './tunnel-session.entity';
import { User } from './user.entity';

@Entity()
export class Domain extends PgBaseEntity {
  @ManyToOne(() => User, { ref: true })
  @Index()
  user!: Ref<User>;

  /** Subdomain (e.g., "myapp" for myapp.noverlink.app) OR custom domain (e.g., "tunnel.mycompany.com") */
  @Property({ type: 'string' })
  @Unique()
  @Index()
  hostname!: string;

  /** Base domain (e.g., "noverlink.app" or "noverlink-free.app") */
  @Property({ type: 'string' })
  baseDomain!: string;

  /** True if user reserved this subdomain */
  @Property({ type: 'boolean' })
  isReserved: boolean & Opt = false;

  /** Get full public URL (computed, not persisted) */
  get publicUrl(): string & Opt {
    return `https://${this.hostname}.${this.baseDomain}` as string & Opt;
  }

  // ─── Relations ─────────────────────────────────────────────────

  @OneToMany(() => TunnelSession, (session) => session.domain)
  sessions = new Collection<TunnelSession>(this);
}
