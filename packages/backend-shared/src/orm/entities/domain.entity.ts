import {
  Collection,
  Entity,
  Index,
  ManyToOne,
  Opt,
  Property,
  type Ref,
  Unique,
} from '@mikro-orm/core';

import { PgBaseEntity } from '../base-entities';
import { User } from './user.entity';

@Entity()
@Unique({ properties: ['hostname', 'baseDomain'] })
export class Domain extends PgBaseEntity {
  @ManyToOne(() => User, { ref: true })
  @Index()
  user!: Ref<User>;

  /** Subdomain (e.g., "myapp" for myapp.truley-interview.app) OR custom domain (e.g., "tunnel.mycompany.com") */
  @Property({ type: 'string' })
  @Index()
  hostname!: string;

  /** Base domain (e.g., "truley-interview.app" or "truley-interview-free.app") */
  @Property({ type: 'string' })
  baseDomain!: string;

  /** True if user reserved this subdomain */
  @Property({ type: 'boolean' })
  isReserved: boolean & Opt = false;

  /** Get full public URL (computed, not persisted) */
  get publicUrl(): string & Opt {
    return `https://${this.hostname}.${this.baseDomain}` as string & Opt;
  }
}
