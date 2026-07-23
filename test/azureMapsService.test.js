import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createAzureMapsService,
  pickForecastDuration,
  AzureMapsError,
} from '../src/services/azureMapsService.js';

/**
 * Builds a fake fetch that routes requests to canned JSON responses based on
 * the URL path, and records the URLs it was called with.
 */
function makeFetch(routes) {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    const pathname = new URL(url).pathname;
    const entry = routes[pathname];
    if (!entry) {
      throw new Error(`Unexpected request to ${pathname}`);
    }
    return {
      ok: entry.ok ?? true,
      status: entry.status ?? 200,
      json: async () => entry.body,
    };
  };
  return { fetchImpl, calls };
}

test('pickForecastDuration returns smallest valid duration covering the request', () => {
  assert.equal(pickForecastDuration(1), 1);
  assert.equal(pickForecastDuration(5), 5);
  assert.equal(pickForecastDuration(6), 10);
  assert.equal(pickForecastDuration(7), 10);
  assert.equal(pickForecastDuration(0), 1);
  assert.equal(pickForecastDuration('nope'), 1);
  assert.equal(pickForecastDuration(100), 45);
});

test('createAzureMapsService requires a subscription key', () => {
  assert.throws(() => createAzureMapsService({}), /subscription key is required/);
});

test('geocode resolves a location to coordinates and sends the key', async () => {
  const { fetchImpl, calls } = makeFetch({
    '/search/address/json': {
      body: {
        results: [
          {
            address: {
              freeformAddress: 'London, United Kingdom',
              country: 'United Kingdom',
              countryCode: 'GB',
            },
            position: { lat: 51.5, lon: -0.12 },
          },
        ],
      },
    },
  });
  const service = createAzureMapsService({
    subscriptionKey: 'test-key',
    fetch: fetchImpl,
  });

  const place = await service.geocode('London');
  assert.deepEqual(place, {
    name: 'London, United Kingdom',
    country: 'United Kingdom',
    countryCode: 'GB',
    latitude: 51.5,
    longitude: -0.12,
  });
  assert.equal(calls[0].searchParams.get('subscription-key'), 'test-key');
  assert.equal(calls[0].searchParams.get('query'), 'London');
});

test('geocode throws a 404 AzureMapsError when nothing matches', async () => {
  const { fetchImpl } = makeFetch({
    '/search/address/json': { body: { results: [] } },
  });
  const service = createAzureMapsService({
    subscriptionKey: 'test-key',
    fetch: fetchImpl,
  });

  await assert.rejects(service.geocode('Nowhere'), (error) => {
    assert.ok(error instanceof AzureMapsError);
    assert.equal(error.status, 404);
    return true;
  });
});

test('getCurrentConditions returns metric temperature, humidity and UV', async () => {
  const { fetchImpl, calls } = makeFetch({
    '/weather/currentConditions/json': {
      body: {
        results: [
          {
            temperature: { value: 21.3, unit: 'C' },
            relativeHumidity: 55,
            uvIndex: 4,
            uvIndexPhrase: 'Moderate',
            phrase: 'Sunny',
            dateTime: '2026-07-23T05:00:00+01:00',
          },
        ],
      },
    },
  });
  const service = createAzureMapsService({
    subscriptionKey: 'test-key',
    fetch: fetchImpl,
  });

  const current = await service.getCurrentConditions(51.5, -0.12);
  assert.deepEqual(current, {
    temperatureC: 21.3,
    humidity: 55,
    uvIndex: 4,
    uvCategory: 'Moderate',
    description: 'Sunny',
    observedAt: '2026-07-23T05:00:00+01:00',
  });
  assert.equal(calls[0].searchParams.get('unit'), 'metric');
});

test('getDailyForecast returns UV index and humidity, sliced to requested days', async () => {
  const forecasts = Array.from({ length: 10 }, (_, i) => ({
    date: `2026-07-${23 + i}`,
    temperature: { minimum: { value: 12 + i }, maximum: { value: 22 + i } },
    day: { iconPhrase: 'Sunny', relativeHumidity: 40 + i },
    airAndPollen: [{ name: 'UVIndex', value: 5, category: 'Moderate' }],
  }));
  const { fetchImpl, calls } = makeFetch({
    '/weather/forecast/daily/json': { body: { forecasts } },
  });
  const service = createAzureMapsService({
    subscriptionKey: 'test-key',
    fetch: fetchImpl,
  });

  const result = await service.getDailyForecast(51.5, -0.12, 7);
  assert.equal(result.length, 7);
  assert.deepEqual(result[0], {
    date: '2026-07-23',
    minTempC: 12,
    maxTempC: 22,
    humidity: 40,
    uvIndex: 5,
    uvCategory: 'Moderate',
    description: 'Sunny',
  });
  // Requesting 7 days should ask Azure Maps for the 10-day duration.
  assert.equal(calls[0].searchParams.get('duration'), '10');
});

test('getLocalTime returns the wall time and offset', async () => {
  const { fetchImpl } = makeFetch({
    '/timezone/byCoordinates/json': {
      body: {
        TimeZones: [
          {
            Id: 'Europe/London',
            Names: { Generic: 'British Time' },
            ReferenceTime: {
              WallTime: '2026-07-23T06:37:00+01:00',
              StandardOffset: '00:00:00',
            },
          },
        ],
      },
    },
  });
  const service = createAzureMapsService({
    subscriptionKey: 'test-key',
    fetch: fetchImpl,
  });

  const time = await service.getLocalTime(51.5, -0.12);
  assert.deepEqual(time, {
    timeZoneId: 'Europe/London',
    timeZoneName: 'British Time',
    localTime: '2026-07-23T06:37:00+01:00',
    utcOffset: '00:00:00',
  });
});

test('non-ok upstream responses become AzureMapsError with mapped status', async () => {
  const { fetchImpl } = makeFetch({
    '/search/address/json': { ok: false, status: 500, body: {} },
  });
  const service = createAzureMapsService({
    subscriptionKey: 'test-key',
    fetch: fetchImpl,
  });

  await assert.rejects(service.geocode('London'), (error) => {
    assert.ok(error instanceof AzureMapsError);
    // 5xx from upstream is surfaced as a 502 Bad Gateway.
    assert.equal(error.status, 502);
    return true;
  });
});
