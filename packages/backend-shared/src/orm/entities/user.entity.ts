import { Entity, Property } from '@mikro-orm/core';

import { PgBaseEntity } from '../base-entities';

@Entity()
export class User extends PgBaseEntity {
  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string' })
  email!: string;

  @Property({ type: 'string', hidden: true })
  password!: string;
}
