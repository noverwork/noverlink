import { Migration } from '@mikro-orm/migrations';

export class Migration20251207173426_InitSchema extends Migration {
  override async up(): Promise<void> {
    // Plan table
    this.addSql(
      `create table "plan" ("id" varchar(255) not null, "name" varchar(255) not null, "base_domain" varchar(255) not null, "max_tunnels" int not null default 1, "max_bandwidth_mb" int not null default 1000, "session_limit_minutes" int null, "allow_reserved_subdomain" boolean not null default false, "sort_order" int not null default 0, "is_active" boolean not null default true, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "plan_pkey" primary key ("id"));`,
    );

    // User table
    this.addSql(
      `create table "user" ("id" varchar(21) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) null, "email_verified" boolean not null default false, "plan_id" varchar(255) not null, "is_active" boolean not null default true, "auth_token" varchar(255) null, constraint "user_pkey" primary key ("id"));`,
    );
    this.addSql(`create index "user_email_index" on "user" ("email");`);
    this.addSql(
      `alter table "user" add constraint "user_email_unique" unique ("email");`,
    );
    this.addSql(`create index "user_plan_id_index" on "user" ("plan_id");`);
    this.addSql(
      `create index "user_auth_token_index" on "user" ("auth_token");`,
    );
    this.addSql(
      `alter table "user" add constraint "user_auth_token_unique" unique ("auth_token");`,
    );

    // OAuth Connection table
    this.addSql(
      `create table "oauth_connection" ("id" varchar(21) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "provider" text check ("provider" in ('google', 'github')) not null, "provider_user_id" varchar(255) not null, "user_id" varchar(21) not null, constraint "oauth_connection_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "oauth_connection_provider_index" on "oauth_connection" ("provider");`,
    );
    this.addSql(
      `create index "oauth_connection_provider_user_id_index" on "oauth_connection" ("provider_user_id");`,
    );
    this.addSql(
      `alter table "oauth_connection" add constraint "oauth_connection_provider_provider_user_id_unique" unique ("provider", "provider_user_id");`,
    );

    // Domain table
    this.addSql(
      `create table "domain" ("id" varchar(21) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" varchar(21) not null, "hostname" varchar(255) not null, "base_domain" varchar(255) not null, "is_reserved" boolean not null default false, constraint "domain_pkey" primary key ("id"));`,
    );
    this.addSql(`create index "domain_user_id_index" on "domain" ("user_id");`);
    this.addSql(
      `create index "domain_hostname_index" on "domain" ("hostname");`,
    );
    this.addSql(
      `alter table "domain" add constraint "domain_hostname_unique" unique ("hostname");`,
    );

    // Foreign keys
    this.addSql(
      `alter table "user" add constraint "user_plan_id_foreign" foreign key ("plan_id") references "plan" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "oauth_connection" add constraint "oauth_connection_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "domain" add constraint "domain_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" drop constraint "user_plan_id_foreign";`);
    this.addSql(
      `alter table "oauth_connection" drop constraint "oauth_connection_user_id_foreign";`,
    );
    this.addSql(
      `alter table "domain" drop constraint "domain_user_id_foreign";`,
    );

    this.addSql(`drop table if exists "plan" cascade;`);
    this.addSql(`drop table if exists "user" cascade;`);
    this.addSql(`drop table if exists "oauth_connection" cascade;`);
    this.addSql(`drop table if exists "domain" cascade;`);
  }
}
