import { Entity, Index, ManyToOne, Opt, Property, Ref } from '@mikro-orm/core';

import { PgBaseEntity } from '../base-entities';
import { TunnelSession } from './tunnel-session.entity';

@Entity()
export class HttpRequest extends PgBaseEntity {
  @ManyToOne(() => TunnelSession, { ref: true })
  @Index()
  session!: Ref<TunnelSession>;

  /** HTTP method */
  @Property({ type: 'string', length: 10 })
  method!: string;

  /** Request path (e.g., /api/users) */
  @Property({ type: 'string' })
  path!: string;

  /** Query string (e.g., ?foo=bar) */
  @Property({ type: 'string', nullable: true })
  queryString?: string;

  /** Request headers as JSON */
  @Property({ type: 'json' })
  requestHeaders!: Record<string, string>;

  /** Request body (max 64KB, larger bodies truncated) */
  @Property({ type: 'blob', nullable: true })
  requestBody?: Buffer;

  /** Response HTTP status code */
  @Property({ type: 'smallint', nullable: true })
  responseStatus?: number;

  /** Response headers as JSON */
  @Property({ type: 'json', nullable: true })
  responseHeaders?: Record<string, string>;

  /** Response body (max 64KB, larger bodies truncated) */
  @Property({ type: 'blob', nullable: true })
  responseBody?: Buffer;

  /** Request duration in milliseconds */
  @Property({ type: 'number', nullable: true })
  durationMs?: number;

  /** Request timestamp */
  @Property({ type: 'Date' })
  @Index()
  timestamp: Date & Opt = new Date();

  /** True if request/response body was truncated */
  @Property({ type: 'boolean' })
  bodyTruncated: boolean & Opt = false;

  /** Original content length if truncated */
  @Property({ type: 'number', nullable: true })
  originalRequestSize?: number;

  @Property({ type: 'number', nullable: true })
  originalResponseSize?: number;
}
