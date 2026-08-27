-- Fixes two duplicated days in DailyPrayers and prevents recurrence.
--
-- Run in the Supabase SQL editor. Steps 1 and 2 must run in this order: the
-- constraint cannot be added while duplicates exist.
--
-- Background: the old CSV importer built dates from local time and did not
-- guard against a source file having more rows than the month has days. Both
-- May and July 2026 ended up with 32 rows for a 31-day month.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Remove the two spurious rows.
--
-- Each was the 32nd row of a 31-day month's import, so it is the extra one.
-- The rows being KEPT (1476 for May, 1538 for July) are the ones consistent
-- with their own month's Hijri sequence.
--
-- NOTE: for 2026-05-31 the two candidates differ by ~4 minutes and the
-- evidence is not unanimous — the Hijri sequence (29th=12, 30th=13, so
-- 31st=14) favours keeping 1476, which is what this does. Please check against
-- the original May 2026 timetable. To keep the other one instead, swap the ids
-- below: DELETE ... WHERE id IN (1476, 1539);
--
-- Values being deleted, for reference / restore:
--   id 1477 | 2026-05-31 | hijri 15 | fajr 02:50/03:45 | sunrise 04:47
--            | dhuhr 01:13/01:45 | asr 05:32/06:15 | maghrib 09:34
--            | isha 10:34/10:45
--   id 1539 | 2026-07-31 | hijri 17 | fajr 03:41/04:30 | sunrise 05:27
--            | dhuhr 01:21/01:45 | asr 05:29/06:15 | maghrib 09:11
--            | isha 10:11/10:20
-- ---------------------------------------------------------------------------
DELETE FROM "DailyPrayers" WHERE id IN (1477, 1539);

-- ---------------------------------------------------------------------------
-- 2. Make a duplicated day impossible from now on.
--
-- Without this, a bad import silently doubles a day. With it, the insert fails
-- loudly instead — and the app's rollback then leaves the month as it was.
-- ---------------------------------------------------------------------------
ALTER TABLE "DailyPrayers"
    ADD CONSTRAINT dailyprayers_date_unique UNIQUE (date);

COMMIT;

-- ---------------------------------------------------------------------------
-- 3. Verify: this should return no rows.
-- ---------------------------------------------------------------------------
SELECT date, COUNT(*)
FROM "DailyPrayers"
GROUP BY date
HAVING COUNT(*) > 1;
