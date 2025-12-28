import { Entity, Enum, Index, Opt, Property, Unique } from '@mikro-orm/core';

import { PgBaseEntity } from '../base-entities';

export enum RelayStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

@Entity()
export class RelayServer extends PgBaseEntity {
  /** Unique relay identifier (from RELAY_ID env) */
  @Property({ type: 'string', length: 50 })
  @Unique()
  relayId!: string;

  /** WebSocket port for CLI connections */
  @Property({ type: 'number' })
  wsPort!: number;

  /** HTTP port for public traffic */
  @Property({ type: 'number' })
  httpPort!: number;

  /** Base domain this relay serves (e.g., "noverlink.app") */
  @Property({ type: 'string' })
  baseDomain!: string;

  /** IP address of the relay server */
  @Property({ type: 'string', nullable: true })
  ipAddress?: string;

  /** Relay software version */
  @Property({ type: 'string', nullable: true })
  version?: string;

  /** Current status */
  @Enum(() => RelayStatus)
  @Index()
  status: RelayStatus & Opt = RelayStatus.ONLINE;

  /** Last heartbeat received */
  @Property({ type: 'Date' })
  @Index()
  lastHeartbeatAt: Date & Opt = new Date();

  /** Number of active sessions on this relay */
  @Property({ type: 'number' })
  activeSessions: number & Opt = 0;
}
