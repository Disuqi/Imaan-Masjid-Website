-- Undoes 001 if the wrong duplicate was removed.
ALTER TABLE "DailyPrayers" DROP CONSTRAINT IF EXISTS dailyprayers_date_unique;

INSERT INTO "DailyPrayers"
    (id, date, hijri, fajr_adhan, fajr_iqama, sunrise, dhuhr_adhan, dhuhr_iqama,
     asr_adhan, asr_iqama, mughrib_adhan, isha_adhan, isha_iqama)
VALUES
    (1477, '2026-05-31', 15, '02:50:00', '03:45:00', '04:47:00', '01:13:00',
     '01:45:00', '05:32:00', '06:15:00', '09:34:00', '10:34:00', '10:45:00'),
    (1539, '2026-07-31', 17, '03:41:00', '04:30:00', '05:27:00', '01:21:00',
     '01:45:00', '05:29:00', '06:15:00', '09:11:00', '10:11:00', '10:20:00');
