# GH-900-July-2026
GH-900 training

today is 23 July 2026

## Weather & Time API

The server exposes a backend endpoint that returns **live weather** and the
**local time** for a given city or country, powered by the
[Azure Maps](https://learn.microsoft.com/azure/azure-maps/) Weather, Search and
Timezone services.

### Configuration

API keys are managed securely via a git-ignored `.env` file (never commit real
keys). Copy the example file and add your own Azure Maps subscription key:

```bash
cp .env.example .env
# then edit .env and set AZURE_MAPS_KEY=<your key>
```

| Variable         | Description                                     |
| ---------------- | ----------------------------------------------- |
| `AZURE_MAPS_KEY` | Azure Maps subscription key (required)          |
| `PORT`           | HTTP port to listen on (optional, default 3000) |

### Running

```bash
npm install
npm start
```

### Endpoint

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

### Testing

```bash
npm test
```
