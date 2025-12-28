import { Migration } from '@mikro-orm/migrations';

export class Migration20251228070622_AddRelayServerTable extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "relay_server" ("id" varchar(21) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "relay_id" varchar(50) not null, "ws_port" int not null, "http_port" int not null, "base_domain" varchar(255) not null, "ip_address" varchar(255) null, "version" varchar(255) null, "status" text check ("status" in ('online', 'offline')) not null default 'online', "last_heartbeat_at" timestamptz not null, "active_sessions" int not null default 0, constraint "relay_server_pkey" primary key ("id"));`);
    this.addSql(`alter table "relay_server" add constraint "relay_server_relay_id_unique" unique ("relay_id");`);
    this.addSql(`create index "relay_server_status_index" on "relay_server" ("status");`);
    this.addSql(`create index "relay_server_last_heartbeat_at_index" on "relay_server" ("last_heartbeat_at");`);

    this.addSql(`alter table "domain" drop constraint "domain_hostname_unique";`);

    this.addSql(`alter table "domain" add constraint "domain_hostname_base_domain_unique" unique ("hostname", "base_domain");`);

    this.addSql(`alter table "tunnel_session" alter column "last_seen_at" type timestamptz using ("last_seen_at"::timestamptz);`);
    this.addSql(`alter table "tunnel_session" alter column "last_seen_at" set default 'now()';`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "relay_server" cascade;`);

    this.addSql(`alter table "domain" drop constraint "domain_hostname_base_domain_unique";`);

    this.addSql(`alter table "domain" add constraint "domain_hostname_unique" unique ("hostname");`);

    this.addSql(`alter table "tunnel_session" alter column "last_seen_at" type timestamptz(6) using ("last_seen_at"::timestamptz(6));`);
    this.addSql(`alter table "tunnel_session" alter column "last_seen_at" set default '2025-12-28 07:06:15.181483+00';`);
  }

}
