insert into public.categories (code, name)
values
  ('loans', 'Loans'),
  ('cards', 'Credit Cards'),
  ('transfers', 'Money Transfers'),
  ('exchange', 'Currency Exchange')
on conflict (code) do nothing;

insert into public.countries (code, name, region)
values
  ('EU', 'European Union', 'EU'),
  ('DE', 'Germany', 'EU'),
  ('ES', 'Spain', 'EU'),
  ('UK', 'United Kingdom', 'Europe')
on conflict (code) do nothing;

