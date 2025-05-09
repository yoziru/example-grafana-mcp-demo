# Example Grafana MCP Demo

This project demonstrates how to connect code changes and observability using Grafana MCP, Prometheus, and a sample Node.js app. You can use coding agents (like Cursor or Claude Code) to interactively update your code and observability dashboards.

## Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (for local development, optional)
- A coding agent that supports MCP (e.g. [Cursor](https://www.cursor.com/), [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview), [VS Code agent mode](https://code.visualstudio.com/docs/copilot/chat/chat-agent-mode))
- [mcp-grafana](https://github.com/grafana/mcp-grafana) extension/agent installed in your IDE

## Quick Start

### 1. Bring up the stack

This will start all required services: the demo app, Prometheus, Grafana, and a k6 load generator.

```sh
make up
```

**Services and Ports:**

| Service    | URL/Port              | Description                              |
| ---------- | --------------------- | ---------------------------------------- |
| App        | http://localhost:3000 | Demo Node.js app (metrics at `/metrics`) |
| Prometheus | http://localhost:9090 | Prometheus UI                            |
| Grafana    | http://localhost:3001 | Grafana UI (admin/admin)                 |

### 2. Generate a Grafana Service Account Token

After the containers are up, run:

```sh
make token
```

This will create a Grafana service account and output a token.
**Copy this token**—you'll need it to connect your IDE/agent to Grafana MCP.

### 3. Add MCP-Grafana to Your IDE

- Install the [mcp-grafana](https://github.com/grafana/mcp-grafana) extension or agent in your IDE.
- Configure it to connect to your local Grafana instance:
  - **GRAFANA_URL:** `http://localhost:3001`
  - **GRAFANA_API_KEY:** (the token you generated above)

### 4. Enable the MCP Server

- In your IDE, enable the MCP server

### 5. Run the Demo

Try the following in your coding agent:

1. `@index.js can you create an overview dashboard for this app in my grafana instance?`
2. `I'd like to see latency in there as well. Could you add it?`

This demonstrates how you can make code changes and update your observability programmatically using Grafana MCP.

---

## How It Works

- **App**: A Node.js/Express app exposing a `/metrics` endpoint with Prometheus metrics (including request count and latency).
- **Prometheus**: Scrapes metrics from the app.
- **Grafana**: Visualizes metrics and can be configured/updated via MCP.
- **k6**: Generates load for demo purposes.
- **MCP**: Lets you use coding agents to automate dashboard and observability changes.

## Useful Commands

- `make up` – Start all services
- `make down` – Stop and remove all services
- `make stop` – Stop services (keep containers)
- `make reset` – Reset Prometheus data
- `make token` – Create a Grafana service account and token

## File/Container Overview

- `docker-compose.yml` – Defines all services and their ports
- `app/` – Node.js demo app (runs on port 3000)
- `prometheus/` – Prometheus config and data
- `grafana/` – Grafana provisioning (datasources, etc.)
- `load/` – k6 load test scripts
