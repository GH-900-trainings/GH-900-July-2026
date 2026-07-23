// Dark / light theme selection, persisted in localStorage and applied to the
// Bootstrap `data-bs-theme` attribute (which also drives our CSS variables).

const STORAGE_KEY = 'ww-theme';

function currentTheme() {
  return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-bs-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const isDark = theme === 'dark';
  btn.setAttribute('aria-pressed', String(isDark));
  btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  const icon = btn.querySelector('.theme-icon');
  const label = btn.querySelector('.theme-label');
  if (icon) icon.textContent = isDark ? '🌙' : '☀️';
  if (label) label.textContent = isDark ? 'Dark' : 'Light';
}

function toggleTheme() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  localStorage.setItem(STORAGE_KEY, next);
  applyTheme(next);
}

document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
applyTheme(currentTheme());
