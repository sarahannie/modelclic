-- ModelClic scheduled jobs. Run once in Supabase → SQL Editor AFTER schema.sql.
-- First enable the extension: Database → Extensions → search "pg_cron" → Enable.

-- Every 15 minutes: release pay 12 h after events end, close finished events
select cron.schedule('mc-release-payments', '*/15 * * * *', $$select public.release_due_payments()$$);

-- 1st of every month at 01:05 Lagos time: top talent back up to the monthly free bid points
select cron.schedule('mc-monthly-points', '5 0 1 * *', $$select public.reset_monthly_points()$$);
