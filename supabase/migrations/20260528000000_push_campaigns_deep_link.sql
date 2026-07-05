-- PR-INT-01 — push deep-link routing
--
-- Adds the `deep_link` column to push_campaigns so admins can pick a
-- target screen when composing a push (e.g. `/offer/wise-business`,
-- `/explore/saving`). The dispatcher passes this through FCM's `data`
-- payload as `route`; the mobile app reads it on tap and navigates
-- there with go_router.
--
-- The column is nullable — pushes without a deep-link still work, they
-- just open the app at its default landing screen.
alter table public.push_campaigns
  add column if not exists deep_link text;

comment on column public.push_campaigns.deep_link is
  'Optional in-app route to open when the user taps the push (e.g. /offer/wise-business). Sent as the `route` key inside the FCM data payload.';
