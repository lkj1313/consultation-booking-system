import { Migration } from '@mikro-orm/migrations';

export class Migration20260214000100 extends Migration {
  override up(): Promise<void> {
    this.addSql("create type \"users_role\" as enum ('admin', 'counselor');");
    this.addSql(
      'create table "users" ("id" serial primary key, "email" varchar(255) not null, "password_hash" varchar(255) not null, "name" varchar(50) not null, "role" "users_role" not null default \'admin\', "created_at" timestamptz not null, "updated_at" timestamptz not null);',
    );
    this.addSql('create unique index "users_email_unique" on "users" ("email");');

    this.addSql(
      "create type \"counselor_schedule_slots_status\" as enum ('open', 'closed', 'cancelled');",
    );
    this.addSql(
      "create type \"bookings_status\" as enum ('reserved', 'cancelled', 'completed');",
    );

    this.addSql(
      'create table "counselor_schedule_slots" ("id" serial primary key, "counselor_id" int not null, "start_at" timestamptz not null, "end_at" timestamptz not null, "status" "counselor_schedule_slots_status" not null default \'open\', "capacity" smallint not null default 3, "booked_count" smallint not null default 0, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "counselor_schedule_slots_capacity_check" check("capacity" between 1 and 3), constraint "counselor_schedule_slots_booked_count_check" check("booked_count" between 0 and "capacity"), constraint "counselor_schedule_slots_start_end_check" check("start_at" < "end_at"));',
    );
    this.addSql(
      'alter table "counselor_schedule_slots" add constraint "counselor_schedule_slots_counselor_id_foreign" foreign key ("counselor_id") references "users" ("id") on update cascade;',
    );
    this.addSql(
      'create unique index "counselor_schedule_slots_counselor_id_start_at_end_at_unique" on "counselor_schedule_slots" ("counselor_id", "start_at", "end_at");',
    );
    this.addSql(
      'create index "counselor_schedule_slots_start_at_index" on "counselor_schedule_slots" ("start_at");',
    );
    this.addSql(
      'create index "counselor_schedule_slots_start_at_status_index" on "counselor_schedule_slots" ("start_at", "status");',
    );

    this.addSql(
      'create table "booking_link_tokens" ("id" serial primary key, "counselor_id" int not null, "token_hash" varchar(255) not null, "target_email" varchar(255) not null, "expires_at" timestamptz not null, "used_at" timestamptz null, "is_revoked" boolean not null default false, "created_at" timestamptz not null, constraint "booking_link_tokens_expire_after_create_check" check("expires_at" > "created_at"));',
    );
    this.addSql(
      'alter table "booking_link_tokens" add constraint "booking_link_tokens_counselor_id_foreign" foreign key ("counselor_id") references "users" ("id") on update cascade;',
    );
    this.addSql(
      'create unique index "booking_link_tokens_token_hash_unique" on "booking_link_tokens" ("token_hash");',
    );
    this.addSql(
      'create index "booking_link_tokens_target_email_expires_at_index" on "booking_link_tokens" ("target_email", "expires_at");',
    );
    this.addSql(
      'create index "booking_link_tokens_counselor_id_created_at_index" on "booking_link_tokens" ("counselor_id", "created_at");',
    );

    this.addSql(
      'create table "bookings" ("id" serial primary key, "slot_id" int not null, "applicant_name" varchar(100) not null, "applicant_email" varchar(255) not null, "applicant_phone" varchar(30) null, "status" "bookings_status" not null default \'reserved\', "created_by_counselor_id" int null, "created_at" timestamptz not null, "updated_at" timestamptz not null);',
    );
    this.addSql(
      'alter table "bookings" add constraint "bookings_slot_id_foreign" foreign key ("slot_id") references "counselor_schedule_slots" ("id") on update cascade;',
    );
    this.addSql(
      'alter table "bookings" add constraint "bookings_created_by_counselor_id_foreign" foreign key ("created_by_counselor_id") references "users" ("id") on update cascade on delete set null;',
    );
    this.addSql(
      'create unique index "bookings_slot_id_applicant_email_unique" on "bookings" ("slot_id", "applicant_email");',
    );
    this.addSql(
      'create index "bookings_slot_id_status_index" on "bookings" ("slot_id", "status");',
    );
    this.addSql(
      'create index "bookings_applicant_email_index" on "bookings" ("applicant_email");',
    );

    this.addSql(
      'create table "consultation_notes" ("id" serial primary key, "booking_id" int not null, "counselor_id" int not null, "note" text not null, "created_at" timestamptz not null, "updated_at" timestamptz not null);',
    );
    this.addSql(
      'alter table "consultation_notes" add constraint "consultation_notes_booking_id_foreign" foreign key ("booking_id") references "bookings" ("id") on update cascade;',
    );
    this.addSql(
      'alter table "consultation_notes" add constraint "consultation_notes_counselor_id_foreign" foreign key ("counselor_id") references "users" ("id") on update cascade;',
    );
    this.addSql(
      'create unique index "consultation_notes_booking_id_unique" on "consultation_notes" ("booking_id");',
    );
    this.addSql(
      'create index "consultation_notes_counselor_id_created_at_index" on "consultation_notes" ("counselor_id", "created_at");',
    );
    return Promise.resolve();
  }

  override down(): Promise<void> {
    this.addSql('drop table if exists "consultation_notes" cascade;');
    this.addSql('drop table if exists "bookings" cascade;');
    this.addSql('drop table if exists "booking_link_tokens" cascade;');
    this.addSql('drop table if exists "counselor_schedule_slots" cascade;');
    this.addSql('drop table if exists "users" cascade;');

    this.addSql('drop type if exists "bookings_status";');
    this.addSql('drop type if exists "counselor_schedule_slots_status";');
    this.addSql('drop type if exists "users_role";');
    return Promise.resolve();
  }
}
