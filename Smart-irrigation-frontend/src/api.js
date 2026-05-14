const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('si_token');

const headers = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

// ── Auth ─────────────────────────────────────────────
export async function apiSignup(data) {
  const r = await fetch(`${BASE}/api/auth/signup`, { method: 'POST', headers: headers(), body: JSON.stringify(data) });
  return r.json();
}

export async function apiLogin(email, password) {
  const r = await fetch(`${BASE}/api/auth/login`, { method: 'POST', headers: headers(), body: JSON.stringify({ email, password }) });
  return r.json();
}

export async function apiMe() {
  if (!getToken()) return null;
  const r = await fetch(`${BASE}/api/auth/me`, { headers: headers() });
  if (!r.ok) return null;
  return r.json();
}

// ── Prediction ───────────────────────────────────────
export async function predictIrrigation(data) {
  try {
    const r = await fetch(`${BASE}/api/predict`, { method: 'POST', headers: headers(), body: JSON.stringify(data) });
    const json = await r.json();
    if (!r.ok) return { success: false, error: json.error?.message || 'Prediction failed' };
    return { success: true, data: json };
  } catch (e) {
    return { success: false, error: 'Could not reach the backend. Is it running?' };
  }
}

// ── History ──────────────────────────────────────────
export async function saveHistory(entry) {
  if (!getToken()) return;
  await fetch(`${BASE}/api/history`, { method: 'POST', headers: headers(), body: JSON.stringify(entry) });
}

export async function getHistory() {
  if (!getToken()) return [];
  const r = await fetch(`${BASE}/api/history`, { headers: headers() });
  const json = await r.json();
  return json.history || [];
}

// ── Trial counter (sessionStorage — resets every visit like ChatGPT) ──
const TRIAL_KEY = 'si_trial_count';
const TRIAL_LIMIT = 3;

export function getTrialCount() {
  return parseInt(sessionStorage.getItem(TRIAL_KEY) || '0');
}

export function incrementTrial() {
  const n = getTrialCount() + 1;
  sessionStorage.setItem(TRIAL_KEY, n);
  return n;
}

export function isTrialExhausted() {
  return !getToken() && getTrialCount() >= TRIAL_LIMIT;
}

export function getTrialRemaining() {
  if (getToken()) return Infinity;
  return Math.max(0, TRIAL_LIMIT - getTrialCount());
}
