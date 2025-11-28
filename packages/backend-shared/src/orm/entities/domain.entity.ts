import {
  Collection,
  Entity,
  Enum,
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

export enum TunnelProtocol {
  HTTP = 'http',
  TCP = 'tcp',
}

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

  /** True if custom domain (e.g., tunnel.mycompany.com) */
  @Property({ type: 'boolean' })
  isCustom: boolean & Opt = false;

  /** DNS verified for custom domains */
  @Property({ type: 'boolean' })
  dnsVerified: boolean & Opt = false;

  // ─── Tunnel Config ─────────────────────────────────────────────

  @Enum(() => TunnelProtocol)
  protocol: TunnelProtocol & Opt = TunnelProtocol.HTTP;

  /** Default local port for this tunnel */
  @Property({ type: 'number' })
  targetPort!: number;

  /** Optional: local hostname (default: localhost) */
  @Property({ type: 'string' })
  targetHost: string & Opt = 'localhost';

  @Property({ type: 'boolean' })
  isEnabled: boolean & Opt = true;

  /** Store HTTP requests for replay (HTTP tunnels only) */
  @Property({ type: 'boolean' })
  recordRequests: boolean & Opt = true;

  // ─── Relations ─────────────────────────────────────────────────

  @OneToMany(() => TunnelSession, (session) => session.domain)
  sessions = new Collection<TunnelSession>(this);
}
