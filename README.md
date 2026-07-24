# GH-900-July-2026 — Weather & Time app

GH-900 training project: a small **Node.js 22 + Express** web app that shows
**live weather** and the **local time** for cities around the world, powered by
the [Azure Maps](https://learn.microsoft.com/azure/azure-maps/) Weather, Search
and Timezone services.

## Contents

- [Prerequisites](#prerequisites)
- [1. Configuration (Azure Maps key)](#1-configuration-azure-maps-key)
- [2. Run locally with Node.js](#2-run-locally-with-nodejs)
- [3. Run the tests](#3-run-the-tests)
- [API reference](#api-reference)
- [4. Run with Docker (build it yourself)](#4-run-with-docker-build-it-yourself)
- [5. Run the published image from GitHub Packages](#5-run-the-published-image-from-github-packages)
- [CI/CD pipelines](#cicd-pipelines)

## Prerequisites

| Tool | Version | Needed for |
| ---- | ------- | ---------- |
| [Node.js](https://nodejs.org/) | 22 or newer | Running & testing locally |
| [Docker](https://www.docker.com/products/docker-desktop/) | any recent | Building & running the container |
| [Azure Maps account](https://learn.microsoft.com/azure/azure-maps/how-to-manage-account-keys) | — | Provides the subscription **key** for weather data |

## 1. Configuration (Azure Maps key)

The app reads its Azure Maps **subscription key** from a git-ignored `.env`
file, so real keys are never committed. Copy the example file and paste in your
own key:

```bash
cp .env.example .env
# then edit .env and set AZURE_MAPS_KEY=<your key>
```

| Variable         | Description                                     |
| ---------------- | ----------------------------------------------- |
| `AZURE_MAPS_KEY` | Azure Maps subscription key (required)          |
| `PORT`           | HTTP port to listen on (optional, default 3000) |

> The home page loads without a key, but the weather endpoints stay disabled
> until `AZURE_MAPS_KEY` is set.

## 2. Run locally with Node.js

```bash
npm install
npm start
```

Then open <http://localhost:3000> in your browser.

## 3. Run the tests

```bash
npm test
```

## API reference

```
GET /api/weather?location=<city or country>&days=<1-7>
```

- `location` (required): a city or country name, e.g. `London` or `Japan`.
- `days` (optional): number of forecast days to return, `1`-`7` (default `7`).

Temperatures are reported in degrees Celsius (°C).

Example response:

```json
{
  "location": {
    "query": "London",
    "resolvedName": "London, United Kingdom",
    "latitude": 51.5,
    "longitude": -0.12
  },
  "localTime": {
    "timeZoneId": "Europe/London",
    "timeZoneName": "British Time",
    "localTime": "2026-07-23T06:37:00+01:00",
    "utcOffset": "00:00:00"
  },
  "current": {
    "temperatureC": 20,
    "humidity": 50,
    "uvIndex": 3,
    "uvCategory": "Moderate",
    "description": "Sunny",
    "observedAt": "2026-07-23T05:00:00+01:00"
  },
  "forecast": [
    {
      "date": "2026-07-23",
      "minTempC": 12,
      "maxTempC": 22,
      "humidity": 40,
      "uvIndex": 5,
      "uvCategory": "Moderate",
      "description": "Sunny"
    }
  ]
}
```

## 4. Run with Docker (build it yourself)

The repository ships a multi-stage [`Dockerfile`](Dockerfile) based on
`node:22-alpine` that runs as a non-root user.

Build the image:

```bash
docker build -t weather-app:local .
```

Run it, passing your Azure Maps key. Reading from your `.env` file keeps the key
out of your shell history:

```bash
docker run -d -p 3000:3000 --name weather-app --env-file .env weather-app:local
```

Or pass the key inline:

```bash
docker run -d -p 3000:3000 --name weather-app -e AZURE_MAPS_KEY=<your key> weather-app:local
```

Open <http://localhost:3000>. Handy commands:

```bash
docker logs -f weather-app     # follow the logs
docker rm -f weather-app       # stop and remove the container
```

## 5. Run the published image from GitHub Packages

Every successful build on `main` publishes a container image to the GitHub
Container Registry (GHCR) as **`nodejs-weather-forecast-component`**:

```
ghcr.io/gh-900-trainings/nodejs-weather-forecast-component:latest
```

Because the package is **public**, anyone can pull and run it without logging in
— you only need your own Azure Maps key:

```bash
docker pull ghcr.io/gh-900-trainings/nodejs-weather-forecast-component:latest

docker run -d -p 3000:3000 --name weather-app \
  -e AZURE_MAPS_KEY=<your key> \
  ghcr.io/gh-900-trainings/nodejs-weather-forecast-component:latest
```

Then open <http://localhost:3000>.

## CI/CD pipelines

Two GitHub Actions workflows automate quality checks and delivery.

### CI — [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

Runs on every push and pull request to `main`. It fans out into small reusable
workflows and only runs the unit tests once the checks are green:

- **build** – installs dependencies and syntax-checks every source file
- **audit** – `npm audit` for known vulnerabilities
- **dependency-review** – flags risky dependency changes (pull requests only)
- **test** – runs the unit test suite (`npm test`)

### CD — [`.github/workflows/CD.yml`](.github/workflows/CD.yml)

Starts automatically **after CI finishes**, and publishes only when that CI run
**succeeded**. It then:

1. re-runs the unit tests as a final gate, and
2. builds the Docker image and pushes it to GHCR as
   `nodejs-weather-forecast-component` (tags: `latest` and the commit SHA).

```
CI (success) ─► test ─► build & push image to GHCR
```

### Required repository secret

The tests call Azure Maps, so add your key as a repository secret named
**`AZURE_MAPS_KEY_SECRET`** under **Settings → Secrets and variables →
Actions**.

### One-time: make the package public

The first push creates the GHCR package as **private**. To make it public so
anyone can pull it:

1. Open the repository's **Packages** page and select
   `nodejs-weather-forecast-component`.
2. **Package settings** → **Danger Zone** → **Change visibility** →
   **Public** and confirm.

It then stays public for every future push.
