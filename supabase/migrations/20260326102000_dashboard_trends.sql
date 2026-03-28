create index if not exists idx_saved_offers_offer on public.saved_offers (offer_id, saved_at desc);
create index if not exists idx_user_activity_offer_action on public.user_activity (offer_id, action, created_at desc);

create or replace function public.dashboard_market_match(home_country text, target_market text)
returns boolean
language sql
immutable
as $$
  select case
    when target_market is null or target_market = '' or lower(target_market) = 'international' then true
    when lower(target_market) = 'eu' then upper(coalesce(home_country, '')) not in ('', 'GB', 'UK')
    when lower(target_market) = 'uk' then upper(coalesce(home_country, '')) in ('GB', 'UK')
    else upper(coalesce(home_country, '')) = upper(target_market)
  end
$$;

create or replace function public.get_market_offer_activity(
  target_market text default 'eu',
  target_user_type text default null,
  lookback_days integer default 30
)
returns table (
  offer_id text,
  category text,
  save_count bigint,
  provider_click_count bigint,
  offer_view_count bigint,
  activity_score numeric
)
language sql
security definer
set search_path = public
as $$
  with scoped_users as (
    select user_id, user_type, home_country
    from public.user_profiles
    where public.dashboard_market_match(home_country, target_market)
      and (
        target_user_type is null
        or target_user_type = ''
        or user_type = target_user_type
      )
  ),
  saved_rollup as (
    select
      saved_offers.offer_id,
      max(saved_offers.category) as category,
      count(*)::bigint as save_count
    from public.saved_offers
    join scoped_users on scoped_users.user_id = saved_offers.user_id
    where saved_offers.saved_at >= now() - make_interval(days => greatest(lookback_days, 1))
    group by saved_offers.offer_id
  ),
  activity_rollup as (
    select
      user_activity.offer_id,
      max(user_activity.category) filter (where user_activity.category is not null) as category,
      count(*) filter (where user_activity.action = 'provider_click')::bigint as provider_click_count,
      count(*) filter (where user_activity.action = 'offer_view')::bigint as offer_view_count
    from public.user_activity
    join scoped_users on scoped_users.user_id = user_activity.user_id
    where user_activity.offer_id is not null
      and user_activity.created_at >= now() - make_interval(days => greatest(lookback_days, 1))
    group by user_activity.offer_id
  )
  select
    coalesce(activity_rollup.offer_id, saved_rollup.offer_id) as offer_id,
    coalesce(
      nullif(activity_rollup.category, ''),
      nullif(saved_rollup.category, ''),
      'unknown'
    ) as category,
    coalesce(saved_rollup.save_count, 0) as save_count,
    coalesce(activity_rollup.provider_click_count, 0) as provider_click_count,
    coalesce(activity_rollup.offer_view_count, 0) as offer_view_count,
    round(
      (
        coalesce(saved_rollup.save_count, 0)::numeric * 2.5
        + coalesce(activity_rollup.provider_click_count, 0)::numeric * 3.0
        + coalesce(activity_rollup.offer_view_count, 0)::numeric
      ),
      2
    ) as activity_score
  from activity_rollup
  full outer join saved_rollup on saved_rollup.offer_id = activity_rollup.offer_id
  where coalesce(activity_rollup.offer_id, saved_rollup.offer_id) is not null
  order by
    activity_score desc,
    provider_click_count desc,
    offer_view_count desc,
    save_count desc;
$$;

revoke all on function public.dashboard_market_match(text, text) from public;
revoke all on function public.get_market_offer_activity(text, text, integer) from public;

grant execute on function public.dashboard_market_match(text, text) to authenticated;
grant execute on function public.get_market_offer_activity(text, text, integer) to authenticated;
