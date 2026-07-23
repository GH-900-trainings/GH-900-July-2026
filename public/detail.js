import {
  weatherEmoji,
  formatZoneTime,
  formatTemp,
  fetchJson,
  flagToCode,
  flagMarkup,
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

function renderForecast(forecast = []) {
  return forecast
    .map((f) => {
      const { day, date } = formatDay(f.date);
      return `
        <div class="col-6 col-sm-4 col-md-3 col-lg">
          <div class="forecast-card">
            <div class="day">${day}</div>
            <div class="date">${date}</div>
            <div class="f-icon">${weatherEmoji(f.description)}</div>
            <div class="range">
              <span class="hi">${formatTemp(f.maxTempC)}</span>
              <span class="lo">${formatTemp(f.minTempC)}</span>
            </div>
            <div class="date mt-1">UV ${f.uvIndex ?? '--'}</div>
          </div>
        </div>`;
    })
    .join('');
}

function render(data) {
  const { location: loc, current, localTime, forecast } = data;
  const cityName = loc?.resolvedName?.split(',')[0] || location;
  liveZoneId = localTime?.timeZoneId ?? null;
  document.title = `${cityName} — Weather`;

  const lat = loc?.latitude;
  const lon = loc?.longitude;
  const mapSection =
    typeof lat === 'number' && typeof lon === 'number'
      ? `
    <h2 class="h5 mt-4 mb-3">Where in the world</h2>
    <div class="map-card">
      <img id="location-map" src="/api/staticmap?lat=${lat}&lon=${lon}&zoom=4&width=1000&height=420"
           alt="Map showing ${cityName}${loc?.country ? ', ' + loc.country : ''}" />
    </div>`
      : '';

  root.innerHTML = `
    <a href="index.html" class="btn-back mb-3">← Back to Main Page</a>
    <div class="detail-hero">
      <div class="d-flex flex-wrap align-items-start justify-content-between gap-3">
        <div>
          <div class="d-flex align-items-center gap-2">
            <span class="flag">${flagMarkup(
              flagToCode(loc?.flag),
              loc?.flag ?? '🏳️',
            )}</span>
            <div>
              <h1 class="h3 mb-0 fw-bold">${cityName}</h1>
              <div class="text-secondary">${loc?.country ?? ''}</div>
            </div>
          </div>
          <div class="mt-3">
            <span class="detail-clock" id="clock">${formatZoneTime(liveZoneId, {
              withSeconds: true,
            })}</span>
            <span class="text-secondary ms-2">${localTime?.timeZoneName ?? ''}</span>
          </div>
        </div>
        <div class="text-center">
          <div class="big-icon">${weatherEmoji(current?.description)}</div>
          <div class="big-temp">${formatTemp(current?.temperatureC)}C</div>
          <div class="text-secondary">${current?.description ?? ''}</div>
        </div>
      </div>

      <div class="row g-3 mt-2">
        <div class="col-6 col-md-3">
          <div class="stat-pill">
            <div class="label">Humidity</div>
            <div class="value">${current?.humidity ?? '--'}%</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-pill">
            <div class="label">UV Index</div>
            <div class="value">${current?.uvIndex ?? '--'}</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-pill">
            <div class="label">UV Level</div>
            <div class="value">${current?.uvCategory ?? '--'}</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-pill">
            <div class="label">Coordinates</div>
            <div class="value" style="font-size:1rem">${
              loc?.latitude?.toFixed?.(2) ?? '--'
            }, ${loc?.longitude?.toFixed?.(2) ?? '--'}</div>
          </div>
        </div>
      </div>
    </div>

    ${mapSection}
    <h2 class="h5 mt-4 mb-3">Forecast</h2>
    <div class="row g-3">
      ${renderForecast(forecast)}
    </div>
    <div class="mt-4">
      <a href="index.html" class="btn-back">← Back to Main Page</a>
    </div>`;

  const mapImg = document.getElementById('location-map');
  if (mapImg) {
    mapImg.addEventListener('error', () => {
      const card = mapImg.closest('.map-card');
      if (card) {
        card.innerHTML =
          '<div class="map-fallback">Map preview unavailable.</div>';
      }
    });
  }
}

async function init() {
  if (!location) {
    root.innerHTML = `<div class="alert alert-warning">No location specified. Return to the <a href="index.html">home page</a>.</div>`;
    return;
  }
  root.innerHTML = `<div class="text-center text-secondary py-5">Loading weather for ${location}…</div>`;
  try {
    const data = await fetchJson(
      `/api/weather?location=${encodeURIComponent(location)}&days=7`,
    );
    render(data);
  } catch (error) {
    root.innerHTML = `<div class="alert alert-danger">Could not load weather for “${location}”: ${error.message}</div>`;
  }
}

setInterval(() => {
  const clock = document.getElementById('clock');
  if (clock && liveZoneId) {
    clock.textContent = formatZoneTime(liveZoneId, { withSeconds: true });
  }
}, 1000);

init();
