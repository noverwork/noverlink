import {
  Collection,
  Entity,
  Enum,
  Index,
  ManyToOne,
  OneToMany,
  Opt,
  Property,
  Ref,
} from '@mikro-orm/core';

import { PgBaseEntity } from '../base-entities';
import { Domain } from './domain.entity';
import { HttpRequest } from './http-request.entity';
import { User } from './user.entity';

export enum SessionStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
}

export enum TunnelProtocol {
  HTTP = 'http',
  TCP = 'tcp',
}

@Entity()
@Index({ properties: ['user', 'status', 'connectedAt'] })
export class TunnelSession extends PgBaseEntity {
  @ManyToOne(() => User, { ref: true })
  @Index()
  user!: Ref<User>;

  /** Domain used for this tunnel session */
  @ManyToOne(() => Domain, { ref: true })
  @Index()
  domain!: Ref<Domain>;

  /** Local port on CLI side */
  @Property({ type: 'number' })
  localPort!: number;

  @Enum(() => TunnelProtocol)
  protocol: TunnelProtocol & Opt = TunnelProtocol.HTTP;

  // ─── Session State ───────────────────────────────────────────

  @Enum(() => SessionStatus)
  @Index()
  status: SessionStatus & Opt = SessionStatus.ACTIVE;

  @Property({ type: 'Date' })
  connectedAt: Date & Opt = new Date();

  /** Last time Relay reported this session is alive (updated every 60s by stats) */
  @Property({ type: 'Date', default: 'now()' })
  @Index()
  lastSeenAt: Date & Opt = new Date();

  @Property({ type: 'Date', nullable: true })
  disconnectedAt?: Date;

  @Property({ type: 'bigint' })
  bytesIn: bigint & Opt = BigInt(0);

  @Property({ type: 'bigint' })
  bytesOut: bigint & Opt = BigInt(0);

  @Property({ type: 'string', nullable: true })
  clientIp?: string;

  /** CLI version for debugging */
  @Property({ type: 'string', nullable: true })
  clientVersion?: string;

  /** Relay instance ID that handles this session */
  @Property({ type: 'string', length: 50, nullable: true })
  relayId?: string;

  // ─── Relations ───────────────────────────────────────────────

  @OneToMany(() => HttpRequest, (req) => req.session)
  httpRequests = new Collection<HttpRequest>(this);
}
