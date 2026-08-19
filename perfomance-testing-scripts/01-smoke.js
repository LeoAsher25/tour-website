import http from 'k6/http';
import { sleep } from 'k6';
import { baseUrl, envOrDefault, recordResponse, randomThinkTime } from './lib/common.js';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    unexpected_error_rate: ['rate<0.01'],
    http_req_duration: ['p(95)<1500'],
  },
};

export default function () {
  const base = baseUrl();
  const slug = envOrDefault('TOUR_SLUG');

  const home = http.get(`${base}/`, { tags: { endpoint: 'homepage' } });
  recordResponse(home, [200], 'homepage');
  sleep(randomThinkTime(1, 2));

  if (slug) {
    const tour = http.get(`${base}/tours/${slug}`, { tags: { endpoint: 'tour_page' } });
    recordResponse(tour, [200], 'tour_page');
  }
}
