import { Migration } from '@mikro-orm/migrations';

export class Migration20251227161610_AddLastSeenAtToTunnelSession extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "tunnel_session" add column "last_seen_at" timestamptz not null;`);
    this.addSql(`create index "tunnel_session_last_seen_at_index" on "tunnel_session" ("last_seen_at");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index "tunnel_session_last_seen_at_index";`);
    this.addSql(`alter table "tunnel_session" drop column "last_seen_at";`);
  }

}
