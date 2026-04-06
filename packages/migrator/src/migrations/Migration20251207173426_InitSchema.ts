import { Migration } from '@mikro-orm/migrations';

export class Migration20251207173426_InitSchema extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "user" ("id" varchar(21) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, constraint "user_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "user" add constraint "user_email_unique" unique ("email");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "user" cascade;`);
  }
}
