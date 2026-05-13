-- Email recipient preferences and unsubscribe state
create table if not exists email_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  marketing_opt_in boolean default false,
  transactional_opt_in boolean default true,
  digest_frequency text check (digest_frequency in ('weekly', 'monthly', 'off')) default 'monthly',
  country text,
  language text default 'en',
  unsubscribe_token text unique default encode(gen_random_bytes(24), 'base64'),
  last_email_sent_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists email_preferences_user_id_idx on email_preferences(user_id);
create index if not exists email_preferences_marketing_idx on email_preferences(marketing_opt_in) where marketing_opt_in = true;
create index if not exists email_preferences_token_idx on email_preferences(unsubscribe_token);

-- All outbound emails — single source of truth for the admin inbox
create table if not exists email_messages (
  id uuid primary key default gen_random_uuid(),
  resend_id text unique,
  user_id uuid references auth.users(id) on delete set null,
  campaign_id uuid,
  template_id text,
  from_address text not null,
  to_address text not null,
  reply_to text,
  subject text not null,
  html text,
  text text,
  tags jsonb default '[]'::jsonb,
  metadata jsonb default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued', 'sent', 'delivered', 'bounced', 'complained', 'failed')),
  error text,
  sent_at timestamptz,
  delivered_at timestamptz,
  first_opened_at timestamptz,
  first_clicked_at timestamptz,
  bounced_at timestamptz,
  complained_at timestamptz,
  open_count int default 0,
  click_count int default 0,
  created_at timestamptz default now()
);

create index if not exists email_messages_user_id_idx on email_messages(user_id);
create index if not exists email_messages_campaign_id_idx on email_messages(campaign_id);
create index if not exists email_messages_status_idx on email_messages(status);
create index if not exists email_messages_created_at_idx on email_messages(created_at desc);
create index if not exists email_messages_resend_id_idx on email_messages(resend_id);

-- Email campaigns (mass sends)
create table if not exists email_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  preheader text,
  template_id text not null,
  audience jsonb not null default '{}'::jsonb,
  variables jsonb default '{}'::jsonb,
  scheduled_at timestamptz,
  sent_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  audience_size int default 0,
  delivered_count int default 0,
  opened_count int default 0,
  clicked_count int default 0,
  bounced_count int default 0,
  unsubscribed_count int default 0,
  failed_count int default 0,
  created_by text,
  created_at timestamptz default now()
);

create index if not exists email_campaigns_status_idx on email_campaigns(status);
create index if not exists email_campaigns_scheduled_idx on email_campaigns(scheduled_at) where status = 'scheduled';

-- Granular event log (one row per webhook event)
create table if not exists email_events (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references email_messages(id) on delete cascade,
  resend_id text,
  event_type text not null check (event_type in ('sent', 'delivered', 'delivery_delayed', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed', 'failed')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists email_events_message_id_idx on email_events(message_id);
create index if not exists email_events_resend_id_idx on email_events(resend_id);
create index if not exists email_events_type_idx on email_events(event_type);

-- Auto-populate email_preferences for every new user
create or replace function ensure_email_preferences()
returns trigger language plpgsql security definer as $$
begin
  insert into email_preferences (user_id, marketing_opt_in, transactional_opt_in)
  values (new.id, false, true)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists ensure_email_preferences_trg on auth.users;
create trigger ensure_email_preferences_trg
  after insert on auth.users
  for each row execute function ensure_email_preferences();

-- Backfill for existing users
insert into email_preferences (user_id, marketing_opt_in, transactional_opt_in)
select id, false, true from auth.users
on conflict (user_id) do nothing;
