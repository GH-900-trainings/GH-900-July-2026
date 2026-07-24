import {
  weatherEmoji,
  formatZoneTime,
  formatTemp,
  fetchJson,
  flagMarkup,
} from './shared.js';

const board = document.getElementById('board');
const clocks = []; // { el, timeZoneId }

/** Builds the skeleton card shown while a city's weather loads. */
function skeletonCard(label, query) {
  return `
    <a class="weather-card skeleton" href="detail.html?location=${encodeURIComponent(
      query,
    )}" target="_blank" rel="noopener" aria-label="Open ${label} details in a new tab">
      <p class="city-name">${label}</p>
      <p class="local-time"><span class="sk-bar" style="width:40%"></span></p>
      <div class="snapshot">
        <span class="icon">⏳</span>
        <div>
          <div class="temp"><span class="sk-bar" style="width:70px"></span></div>
          <p class="desc"><span class="sk-bar" style="width:120px"></span></p>
        </div>
      </div>
      <div class="meta">
        <span class="sk-bar" style="width:90%"></span>
      </div>
    </a>`;
}

/** Renders the populated card content for a city once weather is available. */
function renderCard(cardEl, label, data) {
  const { current, localTime } = data;
  const icon = weatherEmoji(current?.description);
  cardEl.classList.remove('skeleton');
  cardEl.innerHTML = `
    <p class="city-name">${label}</p>
    <p class="local-time" data-zone="${localTime?.timeZoneId ?? ''}">${formatZoneTime(
      localTime?.timeZoneId,
      { withSeconds: true },
    )}</p>
    <div class="snapshot">
      <span class="icon">${icon}</span>
      <div>
        <div class="temp">${formatTemp(current?.temperatureC)}C</div>
        <p class="desc">${current?.description ?? 'No data'}</p>
      </div>
    </div>
    <div class="meta">
      <span>💧 <strong>${current?.humidity ?? '--'}%</strong> humidity</span>
      <span>🔆 UV <strong>${current?.uvIndex ?? '--'}</strong></span>
    </div>`;

  const clockEl = cardEl.querySelector('.local-time');
  if (clockEl && localTime?.timeZoneId) {
    clocks.push({ el: clockEl, timeZoneId: localTime.timeZoneId });
  }
}

/** Shows an inline error state inside a card that failed to load. */
function renderCardError(cardEl, label, message) {
  cardEl.classList.remove('skeleton');
  cardEl.innerHTML = `
    <p class="city-name">${label}</p>
    <div class="snapshot">
      <span class="icon">⚠️</span>
      <div><div class="temp">--</div><p class="desc">Unavailable</p></div>
    </div>
    <p class="card-error">${message}</p>`;
}

/** Loads a single city's snapshot and swaps its skeleton for real data. */
async function loadCity(cardEl, label, query) {
  try {
    const data = await fetchJson(
      `/api/weather?location=${encodeURIComponent(query)}&days=1`,
    );
    renderCard(cardEl, label, data);
  } catch (error) {
    renderCardError(cardEl, label, error.message);
  }
}

/** Builds the whole board from the country buckets, then hydrates each card. */
async function init() {
  let countries;
  try {
    ({ countries } = await fetchJson('/api/cities'));
  } catch (error) {
    board.innerHTML = `<div class="alert alert-danger">Could not load cities: ${error.message}</div>`;
    return;
  }

  const pending = [];

  for (const group of countries) {
    const section = document.createElement('section');
    section.className = 'country-section';
    section.innerHTML = `
      <h2 class="country-heading">
        <span class="flag">${flagMarkup(group.code, group.flag ?? '🏳️')}</span>
        <span>${group.country}</span>
        <span class="count">${group.cities.length} ${
          group.cities.length === 1 ? 'city' : 'cities'
        }</span>
      </h2>
      <div class="row g-3 g-lg-4"></div>`;

    const row = section.querySelector('.row');

    for (const city of group.cities) {
      // Qualify the city with its country so ambiguous names (e.g. "Penang")
      // geocode to the intended place.
      const query = `${city}, ${group.country}`;
      const col = document.createElement('div');
      col.className = 'col-12 col-sm-6 col-lg-4 col-xl-3';
      col.innerHTML = skeletonCard(city, query);
      row.appendChild(col);
      pending.push(loadCity(col.querySelector('.weather-card'), city, query));
    }

    board.appendChild(section);
  }

  // Hydrate all cities in parallel.
  await Promise.allSettled(pending);
}

// Tick every live clock once per second.
setInterval(() => {
  for (const { el, timeZoneId } of clocks) {
    el.textContent = formatZoneTime(timeZoneId, { withSeconds: true });
  }
}, 1000);

init();
