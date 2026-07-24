import {
  weatherEmoji,
  formatZoneTime,
  formatTemp,
  fetchJson,
  flagToCode,
} from './shared.js';

const root = document.getElementById('detail-root');
const params = new URLSearchParams(window.location.search);
const location = (params.get('location') || '').trim();

let liveZoneId = null;

/** Formats an ISO date into a short weekday + date label. */
function formatDay(iso) {
  if (!iso) return { day: '--', date: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { day: '--', date: '' };
  return {
    day: d.toLocaleDateString('en-GB', { weekday: 'short' }),
    date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
  };
}

function createFlagNode(flag) {
  const fallback = flag || '🏳️';
  const code = flagToCode(flag);
  if (code && /^[a-z]{2}$/i.test(code)) {
    const img = document.createElement('img');
    img.className = 'flag-img';
    img.src = `https://flagcdn.com/${code.toLowerCase()}.svg`;
    img.alt = '';
    img.loading = 'lazy';
    img.addEventListener('error', () => {
      img.replaceWith(document.createTextNode(fallback));
    });
    return img;
  }

  return document.createTextNode(fallback);
}

function renderForecast(forecast = []) {
  const fragment = document.createDocumentFragment();

  for (const f of forecast) {
    const { day, date } = formatDay(f.date);

    const col = document.createElement('div');
    col.className = 'col-6 col-sm-4 col-md-3 col-lg';

    const card = document.createElement('div');
    card.className = 'forecast-card';

    const dayEl = document.createElement('div');
    dayEl.className = 'day';
    dayEl.textContent = day;

    const dateEl = document.createElement('div');
    dateEl.className = 'date';
    dateEl.textContent = date;

    const iconEl = document.createElement('div');
    iconEl.className = 'f-icon';
    iconEl.textContent = weatherEmoji(f.description);

    const range = document.createElement('div');
    range.className = 'range';

    const hi = document.createElement('span');
    hi.className = 'hi';
    hi.textContent = formatTemp(f.maxTempC);

    const lo = document.createElement('span');
    lo.className = 'lo';
    lo.textContent = formatTemp(f.minTempC);

    range.append(hi, lo);

    const uv = document.createElement('div');
    uv.className = 'date mt-1';
    uv.textContent = `UV ${f.uvIndex ?? '--'}`;

    card.append(dayEl, dateEl, iconEl, range, uv);
    col.appendChild(card);
    fragment.appendChild(col);
  }

  return fragment;
}

function render(data) {
  const { location: loc, current, localTime, forecast } = data;
  const cityName = loc?.resolvedName?.split(',')[0] || location;
  const countryName = loc?.country ?? '';

  liveZoneId = localTime?.timeZoneId ?? null;
  document.title = `${cityName} — Weather`;

  const lat = loc?.latitude;
  const lon = loc?.longitude;
  const hasMap = typeof lat === 'number' && typeof lon === 'number';

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <a href="index.html" class="btn-back mb-3">← Back to Main Page</a>
    <div class="detail-hero">
      <div class="d-flex flex-wrap align-items-start justify-content-between gap-3">
        <div>
          <div class="d-flex align-items-center gap-2">
            <span class="flag" id="detail-flag"></span>
            <div>
              <h1 class="h3 mb-0 fw-bold" id="detail-city"></h1>
              <div class="text-secondary" id="detail-country"></div>
            </div>
          </div>
          <div class="mt-3">
            <span class="detail-clock" id="clock"></span>
            <span class="text-secondary ms-2" id="detail-timezone"></span>
          </div>
        </div>
        <div class="text-center">
          <div class="big-icon" id="detail-icon"></div>
          <div class="big-temp" id="detail-temp"></div>
          <div class="text-secondary" id="detail-desc"></div>
        </div>
      </div>

      <div class="row g-3 mt-2">
        <div class="col-6 col-md-3">
          <div class="stat-pill">
            <div class="label">Humidity</div>
            <div class="value" id="detail-humidity"></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-pill">
            <div class="label">UV Index</div>
            <div class="value" id="detail-uvindex"></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-pill">
            <div class="label">UV Level</div>
            <div class="value" id="detail-uvlevel"></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-pill">
            <div class="label">Coordinates</div>
            <div class="value" id="detail-coordinates" style="font-size:1rem"></div>
          </div>
        </div>
      </div>
    </div>

    ${hasMap ? '<h2 class="h5 mt-4 mb-3">Where in the world</h2><div class="map-card"><img id="location-map" /></div>' : ''}
    <h2 class="h5 mt-4 mb-3">Forecast</h2>
    <div class="row g-3" id="forecast-row"></div>
    <div class="mt-4">
      <a href="index.html" class="btn-back">← Back to Main Page</a>
    </div>`;

  wrapper.querySelector('#detail-flag').appendChild(createFlagNode(loc?.flag));
  wrapper.querySelector('#detail-city').textContent = cityName;
  wrapper.querySelector('#detail-country').textContent = countryName;
  wrapper.querySelector('#clock').textContent = formatZoneTime(liveZoneId, {
    withSeconds: true,
  });
  wrapper.querySelector('#detail-timezone').textContent =
    localTime?.timeZoneName ?? '';
  wrapper.querySelector('#detail-icon').textContent = weatherEmoji(
    current?.description,
  );
  wrapper.querySelector('#detail-temp').textContent = `${formatTemp(current?.temperatureC)}C`;
  wrapper.querySelector('#detail-desc').textContent = current?.description ?? '';
  wrapper.querySelector('#detail-humidity').textContent = `${current?.humidity ?? '--'}%`;
  wrapper.querySelector('#detail-uvindex').textContent = `${current?.uvIndex ?? '--'}`;
  wrapper.querySelector('#detail-uvlevel').textContent = current?.uvCategory ?? '--';
  wrapper.querySelector('#detail-coordinates').textContent = `${
    loc?.latitude?.toFixed?.(2) ?? '--'
  }, ${loc?.longitude?.toFixed?.(2) ?? '--'}`;

  const forecastRow = wrapper.querySelector('#forecast-row');
  forecastRow.appendChild(renderForecast(forecast));

  const mapImg = wrapper.querySelector('#location-map');
  if (mapImg) {
    const mapUrl = new URL('/api/staticmap', window.location.origin);
    mapUrl.searchParams.set('lat', String(lat));
    mapUrl.searchParams.set('lon', String(lon));
    mapUrl.searchParams.set('zoom', '4');
    mapUrl.searchParams.set('width', '1000');
    mapUrl.searchParams.set('height', '420');

    mapImg.src = `${mapUrl.pathname}${mapUrl.search}`;
    mapImg.alt = `Map showing ${cityName}${countryName ? `, ${countryName}` : ''}`;

    mapImg.addEventListener('error', () => {
      const card = mapImg.closest('.map-card');
      if (card) {
        const fallback = document.createElement('div');
        fallback.className = 'map-fallback';
        fallback.textContent = 'Map preview unavailable.';
        card.replaceChildren(fallback);
      }
    });
  }

  root.replaceChildren(wrapper);
}

function renderNoLocationError() {
  const alert = document.createElement('div');
  alert.className = 'alert alert-warning';
  alert.append('No location specified. Return to the ');

  const homeLink = document.createElement('a');
  homeLink.href = 'index.html';
  homeLink.textContent = 'home page';

  alert.append(homeLink, '.');
  root.replaceChildren(alert);
}

function renderLoading() {
  const loading = document.createElement('div');
  loading.className = 'text-center text-secondary py-5';
  loading.textContent = `Loading weather for ${location}…`;
  root.replaceChildren(loading);
}

function renderLoadError(error) {
  const alert = document.createElement('div');
  alert.className = 'alert alert-danger';
  alert.textContent = `Could not load weather for “${location}”: ${error.message}`;
  root.replaceChildren(alert);
}

async function init() {
  if (!location) {
    renderNoLocationError();
    return;
  }

  renderLoading();
  try {
    const data = await fetchJson(
      `/api/weather?location=${encodeURIComponent(location)}&days=7`,
    );
    render(data);
  } catch (error) {
    renderLoadError(error);
  }
}

setInterval(() => {
  const clock = document.getElementById('clock');
  if (clock && liveZoneId) {
    clock.textContent = formatZoneTime(liveZoneId, { withSeconds: true });
  }
}, 1000);

init();
