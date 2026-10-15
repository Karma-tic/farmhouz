import "server-only";
import postgres from "postgres";

/**
 * Postgres connection (Neon, Supabase or any Postgres) from DATABASE_URL.
 * The schema is created automatically on first use.
 */
type Sql = ReturnType<typeof postgres>;

const g = globalThis as unknown as { __fzSql?: Sql; __fzSchema?: Promise<void> };

export class DatabaseNotConfigured extends Error {
  constructor() {
    super("DATABASE_URL is not set — bookings can't be saved yet.");
  }
}

export const dbConfigured = () => Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);

function client(): Sql {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new DatabaseNotConfigured();
  if (!g.__fzSql) {
    const local = /localhost|127\.0\.0\.1/.test(url);
    g.__fzSql = postgres(url, {
      ssl: local ? false : "require",
      max: 3,
      idle_timeout: 20,
      prepare: false, // works with pooled (pgbouncer) connections
      onnotice: () => {},
    });
  }
  return g.__fzSql;
}

const SCHEMA = /* sql */ `
create table if not exists bookings (
  id            uuid primary key default gen_random_uuid(),
  code          text unique not null,
  status        text not null,
  farm_slug     text not null,
  check_in      date not null,
  check_out     date,
  guests        int not null,
  occasion      text,
  package_id    text,
  name          text not null,
  phone         text not null,
  email         text,
  message       text,
  quote_total   int,
  advance       int,
  hold_until    timestamptz,
  payment_utr   text,
  payment_name  text,
  alt_dates     jsonb not null default '[]'::jsonb,
  alt_farms     jsonb not null default '[]'::jsonb,
  guest_note    text,
  admin_note    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  confirmed_at  timestamptz
);
create index if not exists bookings_status_idx on bookings (status, created_at desc);
create index if not exists bookings_farm_idx on bookings (farm_slug, check_in);

create table if not exists booking_events (
  id          bigserial primary key,
  booking_id  uuid not null references bookings(id) on delete cascade,
  at          timestamptz not null default now(),
  type        text not null,
  actor       text not null,
  data        jsonb not null default '{}'::jsonb
);
create index if not exists booking_events_booking_idx on booking_events (booking_id, at);

create table if not exists blocked_dates (
  farm_slug   text not null,
  day         date not null,
  reason      text not null default 'manual',
  booking_id  uuid references bookings(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (farm_slug, day)
);

create table if not exists owner_leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  phone       text not null,
  farm_name   text not null,
  area        text,
  guests      int,
  has_pool    boolean,
  photos_link text,
  notes       text,
  status      text not null default 'new'
);

create table if not exists farms (
  slug        text primary key,
  data        jsonb not null,
  private     jsonb not null default '{}'::jsonb,
  published   boolean not null default false,
  sort        int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists waitlist (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  phone       text not null,
  occasion    text,
  when_text   text,
  guests      int,
  notes       text,
  status      text not null default 'new'
);

alter table owner_leads add column if not exists source text;
alter table owner_leads add column if not exists ref text;
alter table waitlist add column if not exists source text;
alter table waitlist add column if not exists ref text;
`;

/** Returns the SQL client, creating tables on the first call of each server instance. */
export async function db(): Promise<Sql> {
  const sql = client();
  if (!g.__fzSchema) {
    g.__fzSchema = sql
      .unsafe(SCHEMA)
      .then(() => undefined)
      .catch((e) => {
        g.__fzSchema = undefined;
        throw e;
      });
  }
  await g.__fzSchema;
  return sql;
}
