import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  scenarios: {
    forever: {
      executor: 'constant-vus',
      vus: 10,
      duration: '24h',
    },
  },
};

export default function () {
  http.get('http://app:3000/');
  sleep(1);
} 