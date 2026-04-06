import { Entity, Property, Unique } from '@mikro-orm/core';

import { PgBaseEntity } from '../base-entities';

@Entity()
export class User extends PgBaseEntity {
  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string' })
  @Unique()
  email!: string;

  @Property({ type: 'string' })
  password!: string;
}
