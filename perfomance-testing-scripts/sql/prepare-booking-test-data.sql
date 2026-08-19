-- PERFORMANCE TEST SETUP (run in Supabase SQL Editor)
-- 1) First find a valid published tour + variant:
--
-- select t.id as tour_id, t.slug, tv.id as variant_id, tv.name
-- from tours t
-- join tour_variants tv on tv.tour_id = t.id
-- where t.status = 'published'
-- order by t.id, tv.position;
--
-- 2) Replace the values below. Choose a FUTURE date that is NOT used by real customers.
--    For 04-booking-load.js use a large capacity (e.g. 100000).
--    For 05-booking-race.js use a small capacity (e.g. 20) to verify no oversell.

DO $$
DECLARE
  -- Đã điền sẵn từ DB (2026-08-18): tour-1 = ha-giang-loop-3d2n, variant v1-self
  -- Đổi v_tour_id nếu muốn test tour khác (tour-2..tour-5). Giữ v_test_date = 2099-12-31
  -- để tách biệt khỏi khách thật. 04-booking-load dùng 100000, 05-booking-race dùng 20.
  v_tour_id text := 'tour-1';
  v_test_date date := '2099-12-31';
  v_capacity integer := 100000;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM tours WHERE id = v_tour_id) THEN
    RAISE EXCEPTION 'Tour % does not exist', v_tour_id;
  END IF;

  INSERT INTO departures (tour_id, date, capacity, booked, status, notes)
  VALUES (
    v_tour_id,
    v_test_date,
    v_capacity,
    0,
    'open',
    'AUTOMATED_K6_PERFORMANCE_TEST'
  )
  ON CONFLICT (tour_id, date)
  DO UPDATE SET
    capacity = EXCLUDED.capacity,
    booked = 0,
    status = 'open',
    notes = 'AUTOMATED_K6_PERFORMANCE_TEST',
    updated_at = now();
END $$;

-- Verify:
select id, tour_id, date, capacity, booked, status, notes
from departures
where notes = 'AUTOMATED_K6_PERFORMANCE_TEST'
order by updated_at desc;
