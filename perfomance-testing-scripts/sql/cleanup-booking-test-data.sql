-- PERFORMANCE TEST CLEANUP (run only against your dedicated test departure)
-- Replace these values with the same TOUR_ID / START_DATE used by k6.

DO $$
DECLARE
  -- Khớp với prepare-booking-test-data.sql — đã điền sẵn tour-1 / 2099-12-31 (2026-08-18)
  v_tour_id text := 'tour-1';
  v_test_date date := '2099-12-31';
BEGIN
  -- Delete only bookings created by these k6 scripts.
  DELETE FROM bookings
  WHERE tour_id = v_tour_id
    AND departure_date = v_test_date
    AND customer->>'note' = 'AUTOMATED_K6_PERFORMANCE_TEST';

  -- The departure must be dedicated to testing before resetting booked.
  UPDATE departures
  SET booked = 0, updated_at = now()
  WHERE tour_id = v_tour_id
    AND date = v_test_date
    AND notes = 'AUTOMATED_K6_PERFORMANCE_TEST';
END $$;

-- Verify cleanup:
select tour_id, date, capacity, booked, status, notes
from departures
where notes = 'AUTOMATED_K6_PERFORMANCE_TEST';
