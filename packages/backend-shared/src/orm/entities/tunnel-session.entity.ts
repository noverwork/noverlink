import { Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/core';

import { PgBaseEntity } from '../base-entities';
import { Tunnel } from './tunnel.entity';
import { TunnelRequest } from './tunnel-request.entity';

export enum SessionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

@Entity()
export class TunnelSession extends PgBaseEntity {
  @ManyToOne(() => Tunnel)
  tunnel!: Tunnel;

  @Enum(() => SessionStatus)
  status: SessionStatus = SessionStatus.CONNECTED;

  @Property({ type: 'string' })
  clientIp!: string;

  @Property({ type: 'string', nullable: true })
  clientVersion?: string;

  @Property({ type: 'date', nullable: true })
  disconnectedAt?: Date;

  @Property({ type: 'string', nullable: true })
  disconnectReason?: string;

  @OneToMany(() => TunnelRequest, (request) => request.session)
  requests!: TunnelRequest[];
}
