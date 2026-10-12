-- Read-only checks for the NAYAD owner to run in the Supabase SQL editor.
-- They only read Postgres system catalogs: no customer rows are read, nothing is changed.
-- Paste the results back to the reviewer (they contain no secrets or personal data).

-- 1. Is Row Level Security enabled (and forced) on every table in the public schema?
--    Every row should show rls_enabled = true.
select c.relname as table_name,
       c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r', 'p')
order by 1;

-- 2. Every policy, with the condition it applies. Each should restrict rows to the
--    signed-in user's own business (e.g. via auth.uid()).
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname in ('public', 'storage')
order by tablename, policyname;

-- 3. Column types used for money. Expect integer/bigint or numeric, never real/double precision.
select table_name, column_name, data_type, numeric_precision, numeric_scale
from information_schema.columns
where table_schema = 'public'
  and column_name ~* '(amount|balance|total|price|paid|debt|loan|interest|sum)'
order by 1, 2;

-- 4. Functions that run with their owner's rights (SECURITY DEFINER) and so bypass RLS.
--    Each one needs its own access check inside.
select p.proname, pg_get_function_identity_arguments(p.oid) as args
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef;
