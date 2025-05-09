const express = require('express');
const client = require('prom-client');

const app = express();
const port = 3000;

// Create a Registry to register the metrics
const register = new client.Registry();

// Create a counter metric
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});
register.registerMetric(httpRequestCounter);

// Create a histogram metric for request duration
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5] // typical web latency buckets
});
register.registerMetric(httpRequestDuration);

// Collect default metrics
client.collectDefaultMetrics({ register });

function randomStatus() {
  // Weighted random: 200 (70%), 400 (10%), 404 (10%), 500 (10%)
  const r = Math.random();
  if (r < 0.7) return 200;
  if (r < 0.8) return 400;
  if (r < 0.9) return 404;
  return 500;
}

app.get('/', (req, res) => {
  const start = process.hrtime();
  const status = randomStatus();
  httpRequestCounter.inc({ method: 'GET', route: '/', status_code: status });
  res.status(status);
  if (status === 200) {
    res.send('Hello, world!');
  } else if (status === 400) {
    res.send('Bad Request');
  } else if (status === 404) {
    res.send('Not Found');
  } else {
    res.send('Internal Server Error');
  }
  // Record request duration
  const diff = process.hrtime(start);
  const durationInSeconds = diff[0] + diff[1] / 1e9;
  httpRequestDuration.observe({ method: 'GET', route: '/', status_code: status }, durationInSeconds);
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(port, () => {
  console.log(`Demo app listening at http://localhost:${port}`);
}); 