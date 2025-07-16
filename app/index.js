const express = require("express");
const client = require("prom-client");
const winston = require("winston");
const timers = require("timers");

const app = express();
const port = 3000;

// Create a Registry to register the metrics
const register = new client.Registry();

// Create a counter metric
const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});
register.registerMetric(httpRequestCounter);

// Create a histogram metric for request duration
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5], // typical web latency buckets
});
register.registerMetric(httpRequestDuration);

// Collect default metrics
client.collectDefaultMetrics({ register });

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: "demo-app.log",
      maxsize: 1e9, // 1GiB
      tailable: true,
    }),
    new winston.transports.Console(),
  ],
});

function randomStatus() {
  // Weighted random: 200 (70%), 400 (10%), 404 (10%), 500 (10%)
  const r = Math.random();
  if (r < 0.7) return 200;
  if (r < 0.8) return 400;
  if (r < 0.9) return 404;
  return 500;
}

function randn_bm(min, max, skew) {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0)
    num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range
  else {
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
  }
  return num;
}

app.get("/", (req, res) => {
  // Delay response by a random skewed gaussian for nice metrics
  var time = randn_bm(1, 5000, 2);
  const start = process.hrtime();
  setTimeout(() => {
    const status = randomStatus();
    httpRequestCounter.inc({ method: "GET", route: "/", status_code: status });
    res.status(status);
    if (status === 200) {
      res.send("Hello, world!");
    } else if (status === 400) {
      res.send("Bad Request");
    } else if (status === 404) {
      res.send("Not Found");
    } else {
      res.send("Internal Server Error");
    }
    // Record request duration
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;
    httpRequestDuration.observe(
      { method: "GET", route: "/", status_code: status },
      durationInSeconds,
    );
    logger.info({
      message: {
        method: "GET",
        route: "/",
        status_code: status,
        duration_seconds: durationInSeconds,
      },
    });
  }, time);
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(port, () => {
  console.log(`Demo app listening at http://localhost:${port}`);
});
