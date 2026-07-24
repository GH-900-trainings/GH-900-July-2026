/**
 * Static reference data grouping the supported cities into country "buckets"
 * and attaching a national flag emoji to each country.
 *
 * The flag emoji is derived from the ISO 3166-1 alpha-2 country code so there
 * is a single source of truth (the code) rather than hand-typed emoji.
 */

/**
 * Converts an ISO 3166-1 alpha-2 country code (e.g. "SG") into its national
 * flag emoji (e.g. "🇸🇬") using Unicode regional indicator symbols.
 *
 * @param {unknown} code Two-letter country code, case-insensitive.
 * @returns {string|null} The flag emoji, or null when the code is invalid.
 */
export function countryCodeToFlag(code) {
  if (typeof code !== 'string') {
    return null;
  }
  const upper = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) {
    return null;
  }
  const REGIONAL_INDICATOR_A = 0x1f1e6;
  const LETTER_A = 'A'.charCodeAt(0);
  const codePoints = [...upper].map(
    (letter) => REGIONAL_INDICATOR_A + (letter.charCodeAt(0) - LETTER_A),
  );
  return String.fromCodePoint(...codePoints);
}

/**
 * Cities grouped under their country. Each bucket carries the ISO country code
 * and a derived flag emoji.
 *
 * @type {ReadonlyArray<{country: string, code: string, flag: string|null, cities: string[]}>}
 */
export const COUNTRY_GROUPS = [
  { country: 'Singapore', code: 'SG', cities: ['Singapore'] },
  { country: 'Malaysia', code: 'MY', cities: ['Kuala Lumpur', 'Penang'] },
  { country: 'India', code: 'IN', cities: ['Mumbai', 'New Delhi'] },
  { country: 'Australia', code: 'AU', cities: ['Perth', 'Sydney'] },
  { country: 'China', code: 'CN', cities: ['Beijing', 'Shanghai'] },
  { country: 'Philippines', code: 'PH', cities: ['Manila', 'Cebu'] },
].map((group) => ({ ...group, flag: countryCodeToFlag(group.code) }));

/**
 * Finds the country bucket that contains the given city (case-insensitive).
 *
 * @param {string} city
 * @returns {{country: string, code: string, flag: string|null}|null}
 */
export function findCountryByCity(city) {
  if (typeof city !== 'string') {
    return null;
  }
  const needle = city.trim().toLowerCase();
  if (!needle) {
    return null;
  }
  const group = COUNTRY_GROUPS.find((bucket) =>
    bucket.cities.some((name) => name.toLowerCase() === needle),
  );
  if (!group) {
    return null;
  }
  return { country: group.country, code: group.code, flag: group.flag };
}
