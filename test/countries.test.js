import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  countryCodeToFlag,
  COUNTRY_GROUPS,
  findCountryByCity,
} from '../src/data/countries.js';

test('countryCodeToFlag converts ISO codes to flag emoji', () => {
  assert.equal(countryCodeToFlag('SG'), '🇸🇬');
  assert.equal(countryCodeToFlag('my'), '🇲🇾');
  assert.equal(countryCodeToFlag('PH'), '🇵🇭');
});

test('countryCodeToFlag returns null for invalid input', () => {
  assert.equal(countryCodeToFlag(''), null);
  assert.equal(countryCodeToFlag('USA'), null);
  assert.equal(countryCodeToFlag('1A'), null);
  assert.equal(countryCodeToFlag(undefined), null);
});

test('COUNTRY_GROUPS buckets every city under a country with a flag', () => {
  const expected = {
    Singapore: ['Singapore'],
    Malaysia: ['Kuala Lumpur', 'Penang'],
    India: ['Mumbai', 'New Delhi'],
    Australia: ['Perth', 'Sydney'],
    China: ['Beijing', 'Shanghai'],
    Philippines: ['Manila', 'Cebu'],
  };

  for (const group of COUNTRY_GROUPS) {
    assert.ok(group.flag, `${group.country} should have a flag emoji`);
    assert.deepEqual(group.cities, expected[group.country]);
  }
  assert.equal(COUNTRY_GROUPS.length, Object.keys(expected).length);
});

test('findCountryByCity resolves a city to its country bucket', () => {
  assert.deepEqual(findCountryByCity('penang'), {
    country: 'Malaysia',
    code: 'MY',
    flag: '🇲🇾',
  });
  assert.deepEqual(findCountryByCity('Cebu'), {
    country: 'Philippines',
    code: 'PH',
    flag: '🇵🇭',
  });
  assert.equal(findCountryByCity('London'), null);
  assert.equal(findCountryByCity(''), null);
});
