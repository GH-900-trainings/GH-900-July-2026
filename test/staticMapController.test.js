import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStaticMapController } from '../src/controllers/staticMapController.js';
import { AzureMapsError } from '../src/services/azureMapsService.js';

/** Minimal Express-style response double capturing status, headers and body. */
function makeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    set(key, value) {
      this.headers[key] = value;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    send(payload) {
      this.body = payload;
      return this;
    },
  };
}

function makeAzureMaps(overrides = {}) {
  return {
    getStaticMap: async () => ({
      contentType: 'image/png',
      body: Buffer.from([1, 2, 3]),
    }),
    ...overrides,
  };
}

test('returns 400 when coordinates are missing or invalid', async () => {
  const handler = createStaticMapController({ azureMaps: makeAzureMaps() });

  const res1 = makeRes();
  await handler({ query: {} }, res1);
  assert.equal(res1.statusCode, 400);

  const res2 = makeRes();
  await handler({ query: { lat: '200', lon: '0' } }, res2);
  assert.equal(res2.statusCode, 400);
});

test('streams the PNG bytes with content-type for valid coordinates', async () => {
  let received;
  const azureMaps = makeAzureMaps({
    getStaticMap: async (lat, lon, opts) => {
      received = { lat, lon, opts };
      return { contentType: 'image/png', body: Buffer.from([9, 9]) };
    },
  });
  const handler = createStaticMapController({ azureMaps });
  const res = makeRes();

  await handler({ query: { lat: '51.5', lon: '-0.12', zoom: '4' } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['Content-Type'], 'image/png');
  assert.ok(Buffer.isBuffer(res.body));
  assert.deepEqual(received.lat, 51.5);
  assert.deepEqual(received.lon, -0.12);
  assert.equal(received.opts.zoom, 4);
});

test('clamps zoom, width and height to safe ranges', async () => {
  let opts;
  const azureMaps = makeAzureMaps({
    getStaticMap: async (_lat, _lon, o) => {
      opts = o;
      return { contentType: 'image/png', body: Buffer.from([0]) };
    },
  });
  const handler = createStaticMapController({ azureMaps });
  const res = makeRes();

  await handler(
    { query: { lat: '0', lon: '0', zoom: '999', width: '99999', height: '1' } },
    res,
  );

  assert.equal(opts.zoom, 20);
  assert.equal(opts.width, 1024);
  assert.equal(opts.height, 80);
});

test('translates AzureMapsError into its HTTP status', async () => {
  const azureMaps = makeAzureMaps({
    getStaticMap: async () => {
      throw new AzureMapsError('boom', { status: 502 });
    },
  });
  const handler = createStaticMapController({ azureMaps });
  const res = makeRes();

  await handler({ query: { lat: '0', lon: '0' } }, res);
  assert.equal(res.statusCode, 502);
  assert.equal(res.body.error, 'boom');
});
