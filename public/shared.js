// Shared browser helpers for the weather UI.

/**
 * Maps a free-form weather description to a representative emoji icon.
 * @param {string|null|undefined} description
 * @returns {string}
 */
export function weatherEmoji(description) {
  const text = (description ?? '').toLowerCase();
  if (/thunder|storm|lightning/.test(text)) return '⛈️';
  if (/snow|sleet|flurr|ice/.test(text)) return '❄️';
  if (/rain|shower|drizzle/.test(text)) return '🌧️';
  if (/fog|mist|haze/.test(text)) return '🌫️';
  if (/(partly|intermittent|mostly).*(sun|clear)|partly cloud/.test(text))
    return '⛅';
  if (/cloud|overcast/.test(text)) return '☁️';
  if (/sun|clear|fair/.test(text)) return '☀️';
  return '🌡️';
}

/**
 * Formats a live wall-clock time for an IANA time zone using the browser clock.
 * @param {string} timeZoneId e.g. "Asia/Singapore"
 * @param {object} [options]
 * @param {boolean} [options.withSeconds]
 * @returns {string} e.g. "14:07" or "14:07:22", or "--:--" if the zone is invalid.
 */
export function formatZoneTime(timeZoneId, { withSeconds = false } = {}) {
  if (!timeZoneId) return '--:--';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: timeZoneId,
      hour: '2-digit',
      minute: '2-digit',
      ...(withSeconds ? { second: '2-digit' } : {}),
      hour12: false,
    }).format(new Date());
  } catch {
    return '--:--';
  }
}

/**
 * Rounds a Celsius value for display, tolerating null.
 * @param {number|null|undefined} value
 * @returns {string}
 */
export function formatTemp(value) {
  return value === null || value === undefined ? '--' : `${Math.round(value)}°`;
}

/**
 * Fetches JSON and throws with the API-provided error message on failure.
 * @param {string} url
 * @returns {Promise<any>}
 */
export async function fetchJson(url) {
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status}).`);
  }
  return data;
}

/**
 * Converts a flag emoji (regional indicator pair) back to its ISO 3166-1
 * alpha-2 code, e.g. "🇸🇬" -> "sg". Returns null when not a valid flag.
 * @param {string|null|undefined} flag
 * @returns {string|null}
 */
export function flagToCode(flag) {
  if (typeof flag !== 'string') return null;
  const points = [...flag].map((ch) => ch.codePointAt(0));
  if (points.length !== 2) return null;
  const BASE = 0x1f1e6;
  const letters = points.map((cp) => {
    const offset = cp - BASE;
    return offset >= 0 && offset < 26
      ? String.fromCharCode('A'.charCodeAt(0) + offset)
      : null;
  });
  return letters.includes(null) ? null : letters.join('').toLowerCase();
}

/**
 * Renders a national flag as a crisp SVG image (so it displays consistently on
 * platforms without flag emoji glyphs, e.g. Windows), falling back to the emoji
 * if the image fails to load.
 *
 * @param {string|null} code ISO 3166-1 alpha-2 code (e.g. "sg").
 * @param {string} [emojiFallback] Emoji shown if the image cannot load.
 * @param {string} [cssClass]
 * @returns {string} HTML string.
 */
export function flagMarkup(code, emojiFallback = '🏳️', cssClass = 'flag-img') {
  if (code && /^[a-z]{2}$/i.test(code)) {
    const lc = code.toLowerCase();
    return `<img class="${cssClass}" src="https://flagcdn.com/${lc}.svg" alt="" loading="lazy" onerror="this.replaceWith(document.createTextNode('${emojiFallback}'))" />`;
  }
  return emojiFallback;
}

