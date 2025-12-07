import { Opt, PrimaryKey, Property } from '@mikro-orm/core';
import { nanoid } from 'nanoid';

export abstract class PgBaseEntity {
  @PrimaryKey({ length: 21 })
  id = nanoid();

  @Property()
  createdAt: Date & Opt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}
