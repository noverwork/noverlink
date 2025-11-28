import {
  Collection,
  Entity,
  Enum,
  Index,
  ManyToOne,
  OneToMany,
  Opt,
  Property,
} from '@mikro-orm/core';

import { PgBaseEntity } from '../base-entities';
import { Domain } from './domain.entity';
import { HttpRequest } from './http-request.entity';

export enum SessionStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
}

export enum TunnelProtocol {
  HTTP = 'http',
  TCP = 'tcp',
}

@Entity()
export class TunnelSession extends PgBaseEntity {
  @ManyToOne(() => Domain)
  @Index()
  domain!: Domain;

  @Enum(() => TunnelProtocol)
  protocol: TunnelProtocol & Opt = TunnelProtocol.HTTP;

  // ─── Session State ───────────────────────────────────────────

  @Enum(() => SessionStatus)
  @Index()
  status: SessionStatus & Opt = SessionStatus.ACTIVE;

  @Property({ type: 'Date' })
  connectedAt: Date & Opt = new Date();

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

  // ─── Relations ───────────────────────────────────────────────

  @OneToMany(() => HttpRequest, (req) => req.session)
  httpRequests = new Collection<HttpRequest>(this);
}
