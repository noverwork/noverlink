import { Entity, Index, ManyToOne, Property } from '@mikro-orm/core';

import { PgBaseEntity } from '../base-entities';
import { TunnelSession } from './tunnel-session.entity';

@Entity()
@Index({ properties: ['createdAt'] })
export class TunnelRequest extends PgBaseEntity {
  @ManyToOne(() => TunnelSession)
  session!: TunnelSession;

  @Property({ type: 'string' })
  method!: string;

  @Property({ type: 'string' })
  path!: string;

  @Property({ type: 'number', nullable: true })
  statusCode?: number;

  @Property({ type: 'number' })
  requestSize!: number;

  @Property({ type: 'number' })
  responseSize = 0;

  @Property({ type: 'number' })
  durationMs!: number;

  @Property({ type: 'string', nullable: true })
  errorMessage?: string;
}
