import {
  Entity,
  Enum,
  Index,
  ManyToOne,
  Property,
  Ref,
  Unique,
} from '@mikro-orm/core';

import { PgBaseEntity } from '../base-entities';
import { User } from './user.entity';

export enum OAuthProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
}

@Entity()
@Unique({ properties: ['provider', 'providerUserId'] })
export class OAuthConnection extends PgBaseEntity {
  @Enum(() => OAuthProvider)
  @Index()
  provider!: OAuthProvider;

  @Property({ type: 'string' })
  @Index()
  providerUserId!: string;

  @ManyToOne(() => User, { ref: true })
  user!: Ref<User>;
}
