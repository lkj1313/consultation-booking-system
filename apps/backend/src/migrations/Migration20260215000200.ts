import { Migration } from '@mikro-orm/migrations';

export class Migration20260215000200 extends Migration {
  override up(): Promise<void> {
    this.addSql(
      "alter table \"booking_link_tokens\" add column \"target_name\" varchar(100) not null default '';",
    );
    this.addSql(
      "update \"booking_link_tokens\" set \"target_name\" = left(trim(split_part(\"target_email\", '@', 1)), 100) where \"target_name\" = '';",
    );
    this.addSql(
      'drop index "booking_link_tokens_target_email_expires_at_index";',
    );
    this.addSql(
      'create index "booking_link_tokens_target_name_target_email_expires_at_index" on "booking_link_tokens" ("target_name", "target_email", "expires_at");',
    );

    return Promise.resolve();
  }

  override down(): Promise<void> {
    this.addSql(
      'drop index "booking_link_tokens_target_name_target_email_expires_at_index";',
    );
    this.addSql(
      'create index "booking_link_tokens_target_email_expires_at_index" on "booking_link_tokens" ("target_email", "expires_at");',
    );
    this.addSql(
      'alter table "booking_link_tokens" drop column "target_name";',
    );

    return Promise.resolve();
  }
}

