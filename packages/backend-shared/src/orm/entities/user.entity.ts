import { PgBaseEntity } from '../base-entities';
import { Entity, Property } from '@mikro-orm/core';

@Entity()
export class User extends PgBaseEntity {
  @Property()
  name!: string;

  @Property()
  email!: string;

  @Property()
  password!: string;
}
