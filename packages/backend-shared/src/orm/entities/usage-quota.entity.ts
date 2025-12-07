import { Entity, Index, ManyToOne, Property, Ref } from '@mikro-orm/core';

import { PgBaseEntity } from '../base-entities';
import { User } from './user.entity';

@Entity()
@Index({ properties: ['user', 'year', 'month'] })
export class UsageQuota extends PgBaseEntity {
  @ManyToOne(() => User, { ref: true })
  user!: Ref<User>;

  @Property({ type: 'smallint' })
  year!: number;

  @Property({ type: 'smallint' })
  month!: number;

  @Property({ type: 'number' })
  bandwidthUsedMb = 0;

  @Property({ type: 'number' })
  requestCount = 0;

  @Property({ type: 'number' })
  tunnelMinutes = 0;
}
