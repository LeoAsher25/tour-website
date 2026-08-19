#!/usr/bin/env bash
# Source this file before running k6:
#   source perfomance-testing-scripts/env.sh
#   k6 run perfomance-testing-scripts/01-smoke.js
#
# Hoặc override nhanh: BASE_URL=https://tour-website-kohl.vercel.app k6 run ...
# Data được lấy tự động từ Supabase live lúc 2026-08-18 — khớp seed src/lib/data/tours.ts
# Đã verify: GET https://tour-website-kohl.vercel.app/api/bookings/JAS-E3KN6C → 200

# --- Base URL ---------------------------------------------------------
# Vercel (đã verify live 2026-08-18)
export BASE_URL="https://tour-website-kohl.vercel.app"
# Local dev: http://localhost:3000
# Production (khi có domain): https://jasminehagiang.com

# --- Tour / Variant (đã verify trong DB) ------------------------------
export TOUR_ID="tour-1"
export TOUR_SLUG="ha-giang-loop-3d2n"
export VARIANT_ID="v1-self"
# Variant dự phòng: v1-easy (Easy Rider 4.68M), v1-self-bus (Self-Riding + bus 3.96M)

# --- Booking read test (02 + 03) --------------------------------------
# Booking mới nhất lúc seed (tour-1, departure 2026-08-22)
export BOOKING_CODE="JAS-E3KN6C"
# Các booking khác để thay thế khi cần: JAS-7UNN3R, JAS-TVXJPC, JAS-6WGN4M, JAS-F9A5KE

# --- Booking write tests (04 + 05) ------------------------------------
# Ngày test RIÊNG — chưa có khách thật, dùng cho mọi booking load/race
export START_DATE="2099-12-31"
# GUEST_COUNT mặc định trong scripts là 1; override nếu cần test oversell với n>1
export GUEST_COUNT="1"

# --- Tuning (optional, override khi cần tăng tải) ---------------------
# export START_RPS=5  MID_RPS=20  PEAK_RPS=50  PREALLOCATED_VUS=30  MAX_VUS=300  # cho 02
# export LOW_CCU=10 NORMAL_CCU=50 HIGH_CCU=100 PEAK_CCU=200                     # cho 03
# export LOW_VUS=5  MID_VUS=20  HIGH_VUS=50                                     # cho 04
# export RACE_VUS=100                                                           # cho 05

echo "[k6 env] BASE_URL=$BASE_URL TOUR_ID=$TOUR_ID TOUR_SLUG=$TOUR_SLUG VARIANT_ID=$VARIANT_ID BOOKING_CODE=$BOOKING_CODE START_DATE=$START_DATE"
