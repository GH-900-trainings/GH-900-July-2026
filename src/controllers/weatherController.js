import { AzureMapsError } from '../services/azureMapsService.js';
import { countryCodeToFlag, findCountryByCity } from '../data/countries.js';

// Bounds for the number of forecast days a caller may request.
const MIN_FORECAST_DAYS = 1;
const MAX_FORECAST_DAYS = 7;
const DEFAULT_FORECAST_DAYS = 7;

/**
 * Parses and clamps the requested number of forecast days.
 * @param {unknown} raw
 * @returns {number}
 */
function parseDays(raw) {
  if (raw === undefined || raw === null || raw === '') {
    return DEFAULT_FORECAST_DAYS;
  }
  const days = Number(raw);
  if (!Number.isInteger(days)) {
    return DEFAULT_FORECAST_DAYS;
  }
  return Math.min(Math.max(days, MIN_FORECAST_DAYS), MAX_FORECAST_DAYS);
}

/**
 * Builds an Express handler that returns live weather and local time for a
 * given city or country.
 *
 * @param {object} deps
 * @param {import('../services/azureMapsService.js').createAzureMapsService} deps.azureMaps
 *   An initialised Azure Maps service instance.
 */
export function createWeatherController({ azureMaps }) {
  if (!azureMaps) {
    throw new Error('An Azure Maps service instance is required.');
  }

  return async function getWeather(req, res) {
    const location = (req.query.location ?? req.query.city ?? '')
      .toString()
      .trim();

    if (!location) {
      res.status(400).json({
        error:
          'A "location" query parameter (city or country) is required, e.g. /api/weather?location=London.',
      });
      return;
    }

    const days = parseDays(req.query.days);

    try {
      const place = await azureMaps.geocode(location);

      // Resolve the national flag from the geocoded country code, falling back
      // to our curated city -> country buckets when the code is unavailable.
      const bucket = findCountryByCity(location);
      const flag = countryCodeToFlag(place.countryCode) ?? bucket?.flag ?? null;
      const country = place.country ?? bucket?.country ?? null;

      const [current, forecast, time] = await Promise.all([
        azureMaps.getCurrentConditions(place.latitude, place.longitude),
        azureMaps.getDailyForecast(place.latitude, place.longitude, days),
        azureMaps.getLocalTime(place.latitude, place.longitude),
      ]);

      res.json({
        location: {
          query: location,
          resolvedName: place.name,
          country,
          flag,
          latitude: place.latitude,
          longitude: place.longitude,
        },
        localTime: time,
        current,
        forecast,
      });
    } catch (error) {
      if (error instanceof AzureMapsError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to retrieve weather data.' });
    }
  };
}
