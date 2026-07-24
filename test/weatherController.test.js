import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWeatherController } from '../src/controllers/weatherController.js';
import { AzureMapsError } from '../src/services/azureMapsService.js';

/** Minimal Express-style response double. */
function makeRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

const place = {
  name: 'London, UK',
  country: 'United Kingdom',
  countryCode: 'GB',
  latitude: 51.5,
  longitude: -0.12,
};
const current = {
  temperatureC: 20,
  humidity: 50,
  uvIndex: 3,
  uvCategory: 'Moderate',
  description: 'Sunny',
  observedAt: '2026-07-23T05:00:00+01:00',
};
const forecast = [
  {
    date: '2026-07-23',
    minTempC: 12,
    maxTempC: 22,
    humidity: 40,
    uvIndex: 5,
    uvCategory: 'Moderate',
    description: 'Sunny',
  },
];
const time = {
  timeZoneId: 'Europe/London',
  timeZoneName: 'British Time',
  localTime: '2026-07-23T06:37:00+01:00',
  utcOffset: '00:00:00',
};

function makeAzureMaps(overrides = {}) {
  return {
    geocode: async () => place,
    getCurrentConditions: async () => current,
    getDailyForecast: async () => forecast,
    getLocalTime: async () => time,
    ...overrides,
  };
}

test('returns 400 when the location parameter is missing', async () => {
  const handler = createWeatherController({ azureMaps: makeAzureMaps() });
  const res = makeRes();
  await handler({ query: {} }, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /location/);
});

test('returns combined weather and local time payload', async () => {
  const handler = createWeatherController({ azureMaps: makeAzureMaps() });
  const res = makeRes();
  await handler({ query: { location: 'London' } }, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    location: {
      query: 'London',
      resolvedName: 'London, UK',
      country: 'United Kingdom',
      flag: '🇬🇧',
      latitude: 51.5,
      longitude: -0.12,
    },
    localTime: time,
    current,
    forecast,
  });
});

test('falls back to the city bucket flag when Azure returns no country code', async () => {
  const azureMaps = makeAzureMaps({
    geocode: async () => ({
      name: 'Penang, Malaysia',
      country: null,
      countryCode: null,
      latitude: 5.41,
      longitude: 100.33,
    }),
  });
  const handler = createWeatherController({ azureMaps });
  const res = makeRes();
  await handler({ query: { location: 'Penang' } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.location.flag, '🇲🇾');
  assert.equal(res.body.location.country, 'Malaysia');
});

test('clamps requested days to the 1-7 range', async () => {
  let requestedDays;
  const azureMaps = makeAzureMaps({
    getDailyForecast: async (_lat, _lon, days) => {
      requestedDays = days;
      return forecast;
    },
  });
  const handler = createWeatherController({ azureMaps });
  const res = makeRes();
  await handler({ query: { location: 'London', days: '30' } }, res);
  assert.equal(requestedDays, 7);
});

test('translates AzureMapsError into its HTTP status', async () => {
  const azureMaps = makeAzureMaps({
    geocode: async () => {
      throw new AzureMapsError('No location found for "Xyz".', { status: 404 });
    },
  });
  const handler = createWeatherController({ azureMaps });
  const res = makeRes();
  await handler({ query: { location: 'Xyz' } }, res);
  assert.equal(res.statusCode, 404);
  assert.match(res.body.error, /No location found/);
});

test('returns 500 for unexpected errors without leaking details', async () => {
  const azureMaps = makeAzureMaps({
    geocode: async () => {
      throw new Error('boom: secret internals');
    },
  });
  const handler = createWeatherController({ azureMaps });
  const res = makeRes();
  await handler({ query: { location: 'London' } }, res);
  assert.equal(res.statusCode, 500);
  assert.equal(res.body.error, 'Failed to retrieve weather data.');
});
