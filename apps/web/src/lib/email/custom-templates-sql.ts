// SQL shown in the admin UI when the email_custom_templates table is missing.
// Mirrors supabase/migrations/20260615120000_email_custom_templates.sql.
// Run once in the Supabase Dashboard SQL editor to enable custom templates.
export const CUSTOM_TEMPLATES_SETUP_SQL = `create table if not exists email_custom_templates (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  subject     text not null default '',
  html        text not null default '',
  category    text not null default 'custom' check (category in ('transactional','marketing','custom')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table email_custom_templates enable row level security;

create or replace function touch_email_custom_templates_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists email_custom_templates_updated_at on email_custom_templates;
create trigger email_custom_templates_updated_at before update on email_custom_templates
  for each row execute function touch_email_custom_templates_updated_at();`;
