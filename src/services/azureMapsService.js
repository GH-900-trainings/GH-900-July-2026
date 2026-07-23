const AZURE_MAPS_BASE_URL = 'https://atlas.microsoft.com';

// Durations (in days) supported by the Azure Maps daily forecast API.
const SUPPORTED_FORECAST_DURATIONS = [1, 5, 10, 15, 25, 45];

/**
 * Picks the smallest Azure Maps daily-forecast duration that covers the
 * requested number of days. The API only accepts a fixed set of durations,
 * so we over-fetch and let the caller slice the result.
 *
 * @param {number} days Number of days the caller is interested in.
 * @returns {number} A duration accepted by the Azure Maps forecast API.
 */
export function pickForecastDuration(days) {
  const requested = Number(days);
  if (!Number.isFinite(requested) || requested < 1) {
    return SUPPORTED_FORECAST_DURATIONS[0];
  }
  return (
    SUPPORTED_FORECAST_DURATIONS.find((duration) => duration >= requested) ??
    SUPPORTED_FORECAST_DURATIONS[SUPPORTED_FORECAST_DURATIONS.length - 1]
  );
}

/**
 * Error thrown when an upstream Azure Maps request fails. Carries an HTTP
 * status so the controller can translate it into an appropriate response.
 */
export class AzureMapsError extends Error {
  constructor(message, { status = 502, cause } = {}) {
    super(message);
    this.name = 'AzureMapsError';
    this.status = status;
    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}

/**
 * Extracts the UV index entry from an Azure Maps `airAndPollen` array.
 *
 * @param {Array<{name?: string, value?: number, category?: string}>} airAndPollen
 * @returns {{value: number|null, category: string|null}}
 */
function extractUvIndex(airAndPollen) {
  if (!Array.isArray(airAndPollen)) {
    return { value: null, category: null };
  }
  const uv = airAndPollen.find(
    (entry) => entry?.name?.toLowerCase() === 'uvindex',
  );
  return {
    value: uv?.value ?? null,
    category: uv?.category ?? null,
  };
}

/**
 * Creates an Azure Maps service bound to a subscription key. The `fetch`
 * implementation is injectable to keep the service unit-testable.
 *
 * @param {object} options
 * @param {string} options.subscriptionKey Azure Maps subscription key.
 * @param {typeof fetch} [options.fetch] Fetch implementation (defaults to global fetch).
 * @param {number} [options.timeoutMs] Per-request timeout in milliseconds.
 */
export function createAzureMapsService({
  subscriptionKey,
  fetch: fetchImpl = globalThis.fetch,
  timeoutMs = 10_000,
} = {}) {
  if (!subscriptionKey) {
    throw new Error(
      'Azure Maps subscription key is required. Set AZURE_MAPS_KEY in your .env file.',
    );
  }
  if (typeof fetchImpl !== 'function') {
    throw new Error('A fetch implementation is required.');
  }

  async function request(path, params) {
    const url = new URL(`${AZURE_MAPS_BASE_URL}${path}`);
    url.searchParams.set('subscription-key', subscriptionKey);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetchImpl(url, { signal: controller.signal });
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new AzureMapsError('Azure Maps request timed out.', {
          status: 504,
          cause: error,
        });
      }
      throw new AzureMapsError('Failed to reach Azure Maps.', {
        status: 502,
        cause: error,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new AzureMapsError(
        `Azure Maps request failed with status ${response.status}.`,
        { status: response.status >= 500 ? 502 : response.status },
      );
    }

    return response.json();
  }

  /**
   * Resolves a free-form location (city or country) to coordinates.
   * @param {string} query
   */
  async function geocode(query) {
    const data = await request('/search/address/json', {
      'api-version': '1.0',
      query,
      limit: 1,
    });
    const match = data?.results?.[0];
    if (!match?.position) {
      throw new AzureMapsError(`No location found for "${query}".`, {
        status: 404,
      });
    }
    return {
      name: match.address?.freeformAddress ?? query,
      latitude: match.position.lat,
      longitude: match.position.lon,
    };
  }

  /**
   * Fetches current weather conditions in metric units.
   * @param {number} latitude
   * @param {number} longitude
   */
  async function getCurrentConditions(latitude, longitude) {
    const data = await request('/weather/currentConditions/json', {
      'api-version': '1.1',
      query: `${latitude},${longitude}`,
      unit: 'metric',
      details: true,
    });
    const current = data?.results?.[0];
    if (!current) {
      throw new AzureMapsError('No current weather data available.', {
        status: 502,
      });
    }
    return {
      temperatureC: current.temperature?.value ?? null,
      humidity: current.relativeHumidity ?? null,
      uvIndex: current.uvIndex ?? null,
      uvCategory: current.uvIndexPhrase ?? null,
      description: current.phrase ?? null,
      observedAt: current.dateTime ?? null,
    };
  }

  /**
   * Fetches the daily forecast, sliced to the requested number of days.
   * @param {number} latitude
   * @param {number} longitude
   * @param {number} days Number of days to return (e.g. 5-7).
   */
  async function getDailyForecast(latitude, longitude, days = 7) {
    const duration = pickForecastDuration(days);
    const data = await request('/weather/forecast/daily/json', {
      'api-version': '1.1',
      query: `${latitude},${longitude}`,
      unit: 'metric',
      duration,
    });
    const forecasts = Array.isArray(data?.forecasts) ? data.forecasts : [];
    return forecasts.slice(0, days).map((forecast) => {
      const uv = extractUvIndex(forecast.airAndPollen);
      return {
        date: forecast.date ?? null,
        minTempC: forecast.temperature?.minimum?.value ?? null,
        maxTempC: forecast.temperature?.maximum?.value ?? null,
        humidity:
          forecast.day?.relativeHumidity ??
          forecast.night?.relativeHumidity ??
          null,
        uvIndex: uv.value,
        uvCategory: uv.category,
        description: forecast.day?.iconPhrase ?? null,
      };
    });
  }

  /**
   * Fetches the local time for a set of coordinates.
   * @param {number} latitude
   * @param {number} longitude
   */
  async function getLocalTime(latitude, longitude) {
    const data = await request('/timezone/byCoordinates/json', {
      'api-version': '1.0',
      query: `${latitude},${longitude}`,
      options: 'all',
    });
    const zone = data?.TimeZones?.[0];
    if (!zone) {
      throw new AzureMapsError('No timezone data available.', { status: 502 });
    }
    return {
      timeZoneId: zone.Id ?? null,
      timeZoneName: zone.Names?.Generic ?? null,
      localTime: zone.ReferenceTime?.WallTime ?? null,
      utcOffset: zone.ReferenceTime?.StandardOffset ?? null,
    };
  }

  return {
    geocode,
    getCurrentConditions,
    getDailyForecast,
    getLocalTime,
  };
}
