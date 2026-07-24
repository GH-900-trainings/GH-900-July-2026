import { AzureMapsError } from '../services/azureMapsService.js';

/** Clamps a value to an integer within [min, max], or returns the fallback. */
function clampInt(raw, min, max, fallback) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.round(n), min), max);
}

/** Parses a coordinate, returning null when out of range or not a number. */
function parseCoord(raw, limit) {
  const n = Number(raw);
  if (!Number.isFinite(n) || Math.abs(n) > limit) return null;
  return n;
}

/**
 * Builds an Express handler that streams a static map image for the given
 * coordinates. Only validated numeric inputs are forwarded to Azure Maps.
 *
 * @param {object} deps
 * @param {import('../services/azureMapsService.js').createAzureMapsService} deps.azureMaps
 */
export function createStaticMapController({ azureMaps }) {
  if (!azureMaps) {
    throw new Error('An Azure Maps service instance is required.');
  }

  return async function getStaticMap(req, res) {
    const latitude = parseCoord(req.query.lat, 90);
    const longitude = parseCoord(req.query.lon, 180);

    if (latitude === null || longitude === null) {
      res.status(400).json({
        error:
          'Valid "lat" (-90..90) and "lon" (-180..180) query parameters are required.',
      });
      return;
    }

    const zoom = clampInt(req.query.zoom, 1, 20, 6);
    const width = clampInt(req.query.width, 80, 1024, 600);
    const height = clampInt(req.query.height, 80, 1024, 400);

    try {
      const { contentType, body } = await azureMaps.getStaticMap(
        latitude,
        longitude,
        { zoom, width, height },
      );
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=86400');
      res.send(body);
    } catch (error) {
      if (error instanceof AzureMapsError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to retrieve map image.' });
    }
  };
}
