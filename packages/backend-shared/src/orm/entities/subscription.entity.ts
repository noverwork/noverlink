import {
  Entity,
  Enum,
  Index,
  ManyToOne,
  Opt,
  Property,
  Ref,
  Unique,
} from '@mikro-orm/core';

import { PgBaseEntity } from '../base-entities';
import { User } from './user.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
  INCOMPLETE = 'incomplete',
}

@Entity()
export class Subscription extends PgBaseEntity {
  @Property({ type: 'string' })
  @Unique()
  @Index()
  polarSubscriptionId!: string;

  @Property({ type: 'string' })
  @Index()
  polarCustomerId!: string;

  @Property({ type: 'string' })
  polarProductId!: string;

  @Enum(() => SubscriptionStatus)
  status: SubscriptionStatus & Opt = SubscriptionStatus.ACTIVE;

  @Property({ type: 'date', nullable: true })
  currentPeriodEnd?: Date;

  @Property({ type: 'boolean' })
  cancelAtPeriodEnd: boolean & Opt = false;

  @ManyToOne(() => User, { ref: true })
  @Index()
  user!: Ref<User>;
}
