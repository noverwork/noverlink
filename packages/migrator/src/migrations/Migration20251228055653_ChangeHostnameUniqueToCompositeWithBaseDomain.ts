import { Migration } from '@mikro-orm/migrations';

export class Migration20251228055653_ChangeHostnameUniqueToCompositeWithBaseDomain extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "plan" ("id" varchar(255) not null, "name" varchar(255) not null, "base_domain" varchar(255) not null, "max_tunnels" int not null default 1, "max_bandwidth_mb" int not null default 1000, "session_limit_minutes" int null, "allow_reserved_subdomain" boolean not null default false, "sort_order" int not null default 0, "is_active" boolean not null default true, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "plan_pkey" primary key ("id"));`
    );

    this.addSql(
      `create table "user" ("id" varchar(21) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) null, "email_verified" boolean not null default false, "plan_id" varchar(255) not null, "is_active" boolean not null default true, "auth_token" varchar(255) null, constraint "user_pkey" primary key ("id"));`
    );
    this.addSql(`create index "user_email_index" on "user" ("email");`);
    this.addSql(
      `alter table "user" add constraint "user_email_unique" unique ("email");`
    );
    this.addSql(`create index "user_plan_id_index" on "user" ("plan_id");`);
    this.addSql(
      `create index "user_auth_token_index" on "user" ("auth_token");`
    );
    this.addSql(
      `alter table "user" add constraint "user_auth_token_unique" unique ("auth_token");`
    );

    this.addSql(
      `create table "usage_quota" ("id" varchar(21) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" varchar(21) not null, "year" smallint not null, "month" smallint not null, "bandwidth_used_mb" int not null default 0, "request_count" int not null default 0, "tunnel_minutes" int not null default 0, constraint "usage_quota_pkey" primary key ("id"));`
    );
    this.addSql(
      `create index "usage_quota_user_id_year_month_index" on "usage_quota" ("user_id", "year", "month");`
    );

    this.addSql(
      `create table "subscription" ("id" varchar(21) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "polar_subscription_id" varchar(255) not null, "polar_customer_id" varchar(255) not null, "polar_product_id" varchar(255) not null, "status" text check ("status" in ('active', 'canceled', 'past_due', 'trialing', 'incomplete')) not null default 'active', "current_period_end" date null, "cancel_at_period_end" boolean not null default false, "user_id" varchar(21) not null, constraint "subscription_pkey" primary key ("id"));`
    );
    this.addSql(
      `create index "subscription_polar_subscription_id_index" on "subscription" ("polar_subscription_id");`
    );
    this.addSql(
      `alter table "subscription" add constraint "subscription_polar_subscription_id_unique" unique ("polar_subscription_id");`
    );
    this.addSql(
      `create index "subscription_polar_customer_id_index" on "subscription" ("polar_customer_id");`
    );
    this.addSql(
      `create index "subscription_user_id_index" on "subscription" ("user_id");`
    );

    this.addSql(
      `create table "oauth_connection" ("id" varchar(21) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "provider" text check ("provider" in ('google', 'github')) not null, "provider_user_id" varchar(255) not null, "user_id" varchar(21) not null, constraint "oauth_connection_pkey" primary key ("id"));`
    );
    this.addSql(
      `create index "oauth_connection_provider_index" on "oauth_connection" ("provider");`
    );
    this.addSql(
      `create index "oauth_connection_provider_user_id_index" on "oauth_connection" ("provider_user_id");`
    );
    this.addSql(
      `alter table "oauth_connection" add constraint "oauth_connection_provider_provider_user_id_unique" unique ("provider", "provider_user_id");`
    );

    this.addSql(
      `create table "domain" ("id" varchar(21) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" varchar(21) not null, "hostname" varchar(255) not null, "base_domain" varchar(255) not null, "is_reserved" boolean not null default false, constraint "domain_pkey" primary key ("id"));`
    );
    this.addSql(`create index "domain_user_id_index" on "domain" ("user_id");`);
    this.addSql(
      `create index "domain_hostname_index" on "domain" ("hostname");`
    );
    this.addSql(
      `alter table "domain" add constraint "domain_hostname_base_domain_unique" unique ("hostname", "base_domain");`
    );

    this.addSql(
      `create table "tunnel_session" ("id" varchar(21) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" varchar(21) not null, "domain_id" varchar(21) not null, "local_port" int not null, "protocol" text check ("protocol" in ('http', 'tcp')) not null default 'http', "status" text check ("status" in ('active', 'closed')) not null default 'active', "connected_at" timestamptz not null, "last_seen_at" timestamptz not null default 'now()', "disconnected_at" timestamptz null, "bytes_in" bigint not null default 0, "bytes_out" bigint not null default 0, "client_ip" varchar(255) null, "client_version" varchar(255) null, "relay_id" varchar(50) null, constraint "tunnel_session_pkey" primary key ("id"));`
    );
    this.addSql(
      `create index "tunnel_session_user_id_index" on "tunnel_session" ("user_id");`
    );
    this.addSql(
      `create index "tunnel_session_domain_id_index" on "tunnel_session" ("domain_id");`
    );
    this.addSql(
      `create index "tunnel_session_status_index" on "tunnel_session" ("status");`
    );
    this.addSql(
      `create index "tunnel_session_last_seen_at_index" on "tunnel_session" ("last_seen_at");`
    );
    this.addSql(
      `create index "tunnel_session_user_id_status_connected_at_index" on "tunnel_session" ("user_id", "status", "connected_at");`
    );

    this.addSql(
      `create table "http_request" ("id" varchar(21) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "session_id" varchar(21) not null, "method" varchar(10) not null, "path" varchar(255) not null, "query_string" varchar(255) null, "request_headers" jsonb not null, "request_body" bytea null, "response_status" smallint null, "response_headers" jsonb null, "response_body" bytea null, "duration_ms" int null, "timestamp" timestamptz not null, "body_truncated" boolean not null default false, "original_request_size" int null, "original_response_size" int null, constraint "http_request_pkey" primary key ("id"));`
    );
    this.addSql(
      `create index "http_request_session_id_index" on "http_request" ("session_id");`
    );
    this.addSql(
      `create index "http_request_timestamp_index" on "http_request" ("timestamp");`
    );
    this.addSql(
      `create index "http_request_session_id_timestamp_index" on "http_request" ("session_id", "timestamp");`
    );

    this.addSql(
      `alter table "user" add constraint "user_plan_id_foreign" foreign key ("plan_id") references "plan" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "usage_quota" add constraint "usage_quota_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "subscription" add constraint "subscription_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "oauth_connection" add constraint "oauth_connection_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "domain" add constraint "domain_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "tunnel_session" add constraint "tunnel_session_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`
    );
    this.addSql(
      `alter table "tunnel_session" add constraint "tunnel_session_domain_id_foreign" foreign key ("domain_id") references "domain" ("id") on update cascade;`
    );

    this.addSql(
      `alter table "http_request" add constraint "http_request_session_id_foreign" foreign key ("session_id") references "tunnel_session" ("id") on update cascade;`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" drop constraint "user_plan_id_foreign";`);

    this.addSql(
      `alter table "usage_quota" drop constraint "usage_quota_user_id_foreign";`
    );

    this.addSql(
      `alter table "subscription" drop constraint "subscription_user_id_foreign";`
    );

    this.addSql(
      `alter table "oauth_connection" drop constraint "oauth_connection_user_id_foreign";`
    );

    this.addSql(
      `alter table "domain" drop constraint "domain_user_id_foreign";`
    );

    this.addSql(
      `alter table "tunnel_session" drop constraint "tunnel_session_user_id_foreign";`
    );

    this.addSql(
      `alter table "tunnel_session" drop constraint "tunnel_session_domain_id_foreign";`
    );

    this.addSql(
      `alter table "http_request" drop constraint "http_request_session_id_foreign";`
    );

    this.addSql(`drop table if exists "plan" cascade;`);

    this.addSql(`drop table if exists "user" cascade;`);

    this.addSql(`drop table if exists "usage_quota" cascade;`);

    this.addSql(`drop table if exists "subscription" cascade;`);

    this.addSql(`drop table if exists "oauth_connection" cascade;`);

    this.addSql(`drop table if exists "domain" cascade;`);

    this.addSql(`drop table if exists "tunnel_session" cascade;`);

    this.addSql(`drop table if exists "http_request" cascade;`);
  }
}
