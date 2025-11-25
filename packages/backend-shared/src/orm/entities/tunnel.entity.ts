import { Entity, Enum, Index, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/core';

import { PgBaseEntity } from '../base-entities';
import { Domain } from './domain.entity';
import { TunnelSession } from './tunnel-session.entity';
import { User } from './user.entity';

export enum TunnelStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity()
export class Tunnel extends PgBaseEntity {
  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Domain, { nullable: true })
  domain?: Domain;

  @Property({ type: 'string' })
  @Unique()
  subdomain!: string;

  @Enum(() => TunnelStatus)
  status: TunnelStatus = TunnelStatus.INACTIVE;

  @Property({ type: 'string', hidden: true })
  @Unique()
  @Index()
  authToken!: string;

  @OneToMany(() => TunnelSession, (session) => session.tunnel)
  sessions!: TunnelSession[];
}
