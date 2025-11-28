import { Entity, Index, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/core';

import { PgBaseEntity } from '../base-entities';
import { Tunnel } from './tunnel.entity';
import { User } from './user.entity';

@Entity()
export class Domain extends PgBaseEntity {
  @ManyToOne(() => User)
  user!: User;

  @Property({ type: 'string' })
  @Unique()
  @Index()
  name!: string;

  @Property({ type: 'date', nullable: true })
  reservedUntil?: Date;

  @Property({ type: 'boolean' })
  isActive = true;

  @OneToMany(() => Tunnel, (tunnel) => tunnel.domain)
  tunnels!: Tunnel[];
}
