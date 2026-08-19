# Performance testing guide — Next.js + Supabase Free + k6

Bộ script này được viết theo source hiện tại: Next.js full-stack, Drizzle/Postgres, Supabase/Supavisor transaction pooler và booking qua `POST /api/bookings`.

Mục tiêu chính không phải chỉ là “server chịu bao nhiêu VU”, mà là tìm:

1. **Realistic website CCU** mà website vẫn phản hồi tốt.
2. **Sustainable DB read RPS** trước khi Supabase Free trở thành bottleneck.
3. **Booking concurrency/throughput** của write path.
4. Booking có **oversell** khi nhiều request tranh cùng một departure hay không.

> Supabase Free quota/compute limits không phải performance guarantee cố định. Khi chạy test, luôn đối chiếu output k6 với Supabase Dashboard (CPU, RAM, connections, IO/query latency) để tìm bottleneck thực tế.

---

## 1. Copy vào source code

Giải nén file ZIP rồi copy folder:

```text
perfomance-testing-scripts/
```

vào root project, cùng cấp với `app/`, `src/`, `components/`.

Cấu trúc:

```text
<project-root>/
├── app/
├── src/
├── components/
├── perfomance-testing-scripts/
│   ├── lib/
│   │   └── common.js
│   ├── sql/
│   │   ├── prepare-booking-test-data.sql
│   │   └── cleanup-booking-test-data.sql
│   ├── 01-smoke.js
│   ├── 02-db-read-throughput.js
│   ├── 03-realistic-ccu.js
│   ├── 04-booking-load.js
│   └── 05-booking-race.js
└── ...
```

Không cần thêm k6 vào `package.json`; k6 chạy như CLI riêng.

---

## 2. Cài k6 trên macOS

```bash
brew install k6
k6 version
```

Nếu chạy local Next.js, mở app trước:

```bash
npm run dev
```

hoặc command tương ứng của project.

**Không dùng kết quả localhost để kết luận capacity production.** Local chủ yếu dùng để kiểm tra script và concurrency correctness. Capacity thật nên test trên dev/staging deployment có cùng Supabase project/region/config với môi trường cần đánh giá.

---

## 3. Lấy test variables từ database

Trong Supabase SQL Editor chạy:

```sql
select
  t.id as tour_id,
  t.slug as tour_slug,
  tv.id as variant_id,
  tv.name as variant_name
from tours t
join tour_variants tv on tv.tour_id = t.id
where t.status = 'published'
order by t.id, tv.position;
```

Bạn cần giữ lại:

```text
TOUR_ID
TOUR_SLUG
VARIANT_ID
```

Để test DB read, cần một booking code có sẵn. Có thể lấy booking test/booking không nhạy cảm:

```sql
select booking_code, created_at
from bookings
order by created_at desc
limit 10;
```

Giá trị đó sẽ là:

```text
BOOKING_CODE
```

---

## 4. Test 01 — Smoke test

Mục đích: xác nhận URL và script hoạt động trước khi tăng tải.

Local:

```bash
k6 run \
  -e BASE_URL=http://localhost:3000 \
  -e TOUR_SLUG=YOUR_TOUR_SLUG \
  perfomance-testing-scripts/01-smoke.js
```

Dev/staging:

```bash
k6 run \
  -e BASE_URL=https://your-dev-domain.com \
  -e TOUR_SLUG=YOUR_TOUR_SLUG \
  perfomance-testing-scripts/01-smoke.js
```

Chỉ tiếp tục nếu response chủ yếu là `200` và không có lỗi cấu hình.

---

## 5. Test 02 — Supabase DB read throughput

Đây là bài test quan trọng để tìm khả năng của Supabase Free đối với **live database reads**.

Script gọi:

```text
GET /api/bookings/[bookingCode]
```

Route này đi qua Next.js server và đọc Postgres live, nên phù hợp hơn homepage/tour page nếu các page đó được static/cached.

Chạy baseline:

```bash
k6 run \
  -e BASE_URL=https://your-dev-domain.com \
  -e BOOKING_CODE=YOUR_TEST_BOOKING_CODE \
  perfomance-testing-scripts/02-db-read-throughput.js
```

Default ramp:

```text
5 RPS → 20 RPS → 50 RPS
```

Muốn tăng:

```bash
k6 run \
  -e BASE_URL=https://your-dev-domain.com \
  -e BOOKING_CODE=YOUR_TEST_BOOKING_CODE \
  -e START_RPS=10 \
  -e MID_RPS=50 \
  -e PEAK_RPS=100 \
  -e PREALLOCATED_VUS=50 \
  -e MAX_VUS=500 \
  perfomance-testing-scripts/02-db-read-throughput.js
```

Trong lúc chạy, mở Supabase Dashboard và ghi lại theo từng level:

| RPS | p95 | p99 | Error | Dropped iterations | CPU | RAM | Connections |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 5 | | | | | | | |
| 20 | | | | | | | |
| 50 | | | | | | | |
| 100 | | | | | | | |

**Breaking point** là vùng mà latency/error/dropped iterations tăng mạnh hoặc Supabase resource bị bão hòa.

**Sustainable RPS** nên thấp hơn breaking point và chừa headroom; không dùng chính breaking point làm production target.

---

## 6. Test 03 — Realistic website CCU

Bài này mô phỏng user thật hơn:

```text
homepage
→ think time
→ tour page
→ think time
→ ~35% vào checkout
→ ~10% đọc booking status nếu BOOKING_CODE được cung cấp
```

Chạy:

```bash
k6 run \
  -e BASE_URL=https://your-dev-domain.com \
  -e TOUR_SLUG=YOUR_TOUR_SLUG \
  -e BOOKING_CODE=YOUR_TEST_BOOKING_CODE \
  perfomance-testing-scripts/03-realistic-ccu.js
```

Default:

```text
10 → 50 → 100 → 200 VU/CCU
```

Có thể override:

```bash
k6 run \
  -e BASE_URL=https://your-dev-domain.com \
  -e TOUR_SLUG=YOUR_TOUR_SLUG \
  -e BOOKING_CODE=YOUR_TEST_BOOKING_CODE \
  -e LOW_CCU=25 \
  -e NORMAL_CCU=100 \
  -e HIGH_CCU=200 \
  -e PEAK_CCU=400 \
  perfomance-testing-scripts/03-realistic-ccu.js
```

### Cách hiểu kết quả

Tour/homepage có thể được Next.js/Vercel cache/static. Vì vậy:

```text
200 VU ổn
```

không tự động có nghĩa:

```text
Supabase chịu 200 simultaneous DB requests.
```

Đó là lý do phải đọc **03-realistic-ccu.js cùng với 02-db-read-throughput.js**:

- `03` trả lời: website thực tế chịu khoảng bao nhiêu active users.
- `02` trả lời: DB-backed path chịu khoảng bao nhiêu requests/second.

Có thể chạy `03` không có `BOOKING_CODE` để đo pure browsing/cache behavior, rồi chạy lại có `BOOKING_CODE` để thấy Supabase utilization thay đổi thế nào.

---

## 7. Chuẩn bị booking performance test

**Không chạy `04` hoặc `05` vào departure thật.** Chúng tạo booking thật trong DB.

Mở:

```text
perfomance-testing-scripts/sql/prepare-booking-test-data.sql
```

Thay:

```sql
v_tour_id := 'REPLACE_WITH_TOUR_ID';
v_test_date := '2099-12-31';
v_capacity := 100000;
```

Ngày phải nằm trong tương lai và dành riêng cho performance test.

Sau đó chạy file SQL trong Supabase SQL Editor.

Với booking load (`04`), dùng capacity lớn như:

```text
100000
```

để tránh test dừng sớm vì SOLD_OUT.

---

## 8. Test 04 — Booking load

Đây là write-path nặng hơn read vì source hiện tại thực hiện pricing lookup + transaction + atomic capacity update + booking insert.

Chạy:

```bash
k6 run \
  -e BASE_URL=https://your-dev-domain.com \
  -e TOUR_ID=YOUR_TOUR_ID \
  -e VARIANT_ID=YOUR_VARIANT_ID \
  -e START_DATE=2099-12-31 \
  perfomance-testing-scripts/04-booking-load.js
```

Default:

```text
5 → 20 → 50 concurrent booking VUs
```

Tăng tải:

```bash
k6 run \
  -e BASE_URL=https://your-dev-domain.com \
  -e TOUR_ID=YOUR_TOUR_ID \
  -e VARIANT_ID=YOUR_VARIANT_ID \
  -e START_DATE=2099-12-31 \
  -e LOW_VUS=10 \
  -e MID_VUS=50 \
  -e HIGH_VUS=100 \
  perfomance-testing-scripts/04-booking-load.js
```

Theo dõi:

```text
booking_created
booking_sold_out
booking_unexpected_rate
endpoint_duration p95/p99
Supabase CPU/RAM/connections
```

`409` có thể là SOLD_OUT/business rejection và không được script coi là server crash. Với dedicated departure capacity lớn, nếu xuất hiện `409` sớm thì cần kiểm tra test data hoặc business logic.

---

## 9. Test 05 — Booking race / oversell

Mục đích: chứng minh atomic capacity reservation hoạt động đúng dưới concurrency.

Trước tiên đổi dedicated departure thành, ví dụ:

```text
capacity = 20
booked = 0
```

Có thể sửa `v_capacity := 20` trong `prepare-booking-test-data.sql` rồi chạy lại.

Sau đó:

```bash
k6 run \
  -e BASE_URL=https://your-dev-domain.com \
  -e TOUR_ID=YOUR_TOUR_ID \
  -e VARIANT_ID=YOUR_VARIANT_ID \
  -e START_DATE=2099-12-31 \
  -e RACE_VUS=100 \
  perfomance-testing-scripts/05-booking-race.js
```

Với:

```text
capacity = 20
guestCount = 1
RACE_VUS = 100
```

kỳ vọng:

```text
race_booking_created ≈ 20
race_booking_rejected ≈ 80
```

và quan trọng nhất:

```sql
select tour_id, date, capacity, booked
from departures
where tour_id = 'YOUR_TOUR_ID'
  and date = '2099-12-31';
```

phải có:

```text
booked <= capacity
```

Nếu test bắt đầu từ `booked = 0` và không có traffic khác, kỳ vọng chính xác là:

```text
booked = 20
```

Kiểm tra số booking k6:

```sql
select count(*)
from bookings
where tour_id = 'YOUR_TOUR_ID'
  and departure_date = '2099-12-31'
  and customer->>'note' = 'AUTOMATED_K6_PERFORMANCE_TEST';
```

Không được lớn hơn capacity.

---

## 10. Cleanup sau booking tests

Mở:

```text
perfomance-testing-scripts/sql/cleanup-booking-test-data.sql
```

điền đúng `TOUR_ID` và `START_DATE`, sau đó chạy trong Supabase SQL Editor.

Script chỉ xóa booking có:

```text
customer.note = AUTOMATED_K6_PERFORMANCE_TEST
```

và chỉ reset departure có:

```text
notes = AUTOMATED_K6_PERFORMANCE_TEST
```

Tuy nhiên vẫn phải đảm bảo đây là **departure test riêng**, không dùng chung với khách thật.

---

## 11. Thứ tự chạy được khuyến nghị

Chạy lần lượt:

```text
01 Smoke
↓
02 DB read: 5 → 20 → 50 RPS
↓
03 Realistic CCU: 10 → 50 → 100 → 200
↓
04 Booking load: 5 → 20 → 50 VUs
↓
05 Booking race: capacity 20 vs 100 VUs
```

Nếu level hiện tại còn khỏe, tăng từng bước; không nhảy ngay lên 500–1000 VUs.

---

## 12. Metrics quan trọng nhất

Ưu tiên:

```text
p50
p95
p99
unexpected_error_rate
RPS / http_reqs
dropped_iterations (arrival-rate test)
Supabase CPU
Supabase RAM
Supabase connections
```

Threshold ban đầu trong scripts chỉ là guardrail, không phải SLA bắt buộc. Với website này có thể bắt đầu bằng:

### Public/read

```text
p95 < 1s–1.5s
p99 < 2s–3s
unexpected errors < 1%
```

### Booking

```text
p95 < 1.5s
p99 < 3s
unexpected errors < 1%
no oversell
```

Nếu bạn muốn chuẩn nghiêm hơn, giảm threshold sau khi đã có baseline.

---

## 13. Cách kết luận “Supabase Free đủ đến đâu?”

Sau test, tạo bảng tổng hợp:

| Test level | RPS | p95 | p99 | Error | CPU | RAM | Connections | Result |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| DB 5 RPS | | | | | | | | |
| DB 20 RPS | | | | | | | | |
| DB 50 RPS | | | | | | | | |
| 50 CCU | | | | | | | | |
| 100 CCU | | | | | | | | |
| 200 CCU | | | | | | | | |
| Booking 20 VUs | | | | | | | | |
| Booking 50 VUs | | | | | | | | |

Sau đó xác định:

```text
Breaking point = level bắt đầu bão hòa/latency tăng mạnh/errors xuất hiện.

Safe operating level = mức thấp hơn breaking point đủ nhiều để còn headroom.
```

Con số cần giữ lại cuối cùng:

```text
1. Sustainable DB read RPS
2. Sustainable realistic CCU
3. Sustainable booking throughput/concurrency
4. Booking race: PASS/FAIL (no oversell)
```

Đây mới là cách hợp lý để trả lời “website hiện tại chạy trên Supabase Free chịu được tới đâu”, thay vì lấy một con số VU duy nhất.

---

## 14. Một lưu ý từ source hiện tại

`src/lib/db/index.ts` đang dùng Supavisor transaction pooler và:

```ts
max: 5
```

nhưng comment phía trên vẫn ghi ``max: 1``. Nên sửa comment để tài liệu khớp code trước khi benchmark, tránh hiểu nhầm khi phân tích connection behavior.

Ngoài ra, không đưa `POST /api/payments/vnpay/create` vào load test Supabase chính. Benchmark payment gateway bên thứ ba riêng; không spam VNPay sandbox khi mục tiêu đang là đo Supabase/database capacity.
