// api.js — Smart Irrigation System HTTP client
// All communication between the React frontend and the Flask backend goes here.
// Named exports follow Google JS Style Guide.

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/** Retrieve the stored JWT from localStorage. */
const getToken = () => localStorage.getItem('si_token');

/** Build request headers, injecting the Bearer token when present. */
const headers = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

// ── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Register a new user account.
 * @param {{ name, email, password, farm_name, region, primary_crop }} data
 */
export async function apiSignup(data) {
  const r = await fetch(`${BASE}/api/auth/signup`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  return r.json();
}

/**
 * Authenticate with email + password. Returns { token, user } on success.
 * @param {string} email
 * @param {string} password
 */
export async function apiLogin(email, password) {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, password }),
  });
  return r.json();
}

/**
 * Return the currently logged-in user's profile using the stored token.
 * Returns null if no token exists or if the token is invalid/expired.
 */
export async function apiMe() {
  if (!getToken()) return null;
  const r = await fetch(`${BASE}/api/auth/me`, { headers: headers() });
  if (!r.ok) return null;
  return r.json();
}

/**
 * Invalidate the current session on the server, then clear the local token.
 * Safe to call even if the server is unreachable (token will still be cleared).
 */
export async function apiLogout() {
  try {
    await fetch(`${BASE}/api/auth/logout`, {
      method: 'POST',
      headers: headers(),
    });
  } catch {
    // Server unreachable — still clear local token
  } finally {
    localStorage.removeItem('si_token');
  }
}

// ── Prediction ────────────────────────────────────────────────────────────────

/**
 * Submit farm sensor data and receive an irrigation recommendation.
 * @param {object} data  Farm input matching the REQUIRED_FIELDS schema.
 * @returns {{ success: boolean, data?: object, error?: string }}
 */
export async function predictIrrigation(data) {
  try {
    const r = await fetch(`${BASE}/api/predict`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    const json = await r.json();
    if (!r.ok) {
      return { success: false, error: json.error?.message || 'Prediction failed' };
    }
    return { success: true, data: json };
  } catch {
    return { success: false, error: 'Could not reach the backend. Is it running?' };
  }
}

// ── History ───────────────────────────────────────────────────────────────────

/**
 * Persist a prediction entry for the authenticated user.
 * @param {{ input: object, result: object }} entry
 */
export async function saveHistory(entry) {
  if (!getToken()) return;
  await fetch(`${BASE}/api/history`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(entry),
  });
}

/** Fetch the authenticated user's prediction history. */
export async function getHistory() {
  if (!getToken()) return [];
  const r = await fetch(`${BASE}/api/history`, { headers: headers() });
  const json = await r.json();
  return json.history || [];
}

// ── Trial counter (sessionStorage — resets on every new browser session) ──────

const TRIAL_KEY   = 'si_trial_count';
const TRIAL_LIMIT = 3;

/** Return the number of trial predictions used this session. */
export function getTrialCount() {
  return parseInt(sessionStorage.getItem(TRIAL_KEY) || '0', 10);
}

/** Increment and store the trial counter. Returns the new count. */
export function incrementTrial() {
  const n = getTrialCount() + 1;
  sessionStorage.setItem(TRIAL_KEY, String(n));
  return n;
}

/** Return true when the user has no token AND has used all free trials. */
export function isTrialExhausted() {
  return !getToken() && getTrialCount() >= TRIAL_LIMIT;
}

/** Return the number of remaining trial predictions (Infinity for logged-in users). */
export function getTrialRemaining() {
  if (getToken()) return Infinity;
  return Math.max(0, TRIAL_LIMIT - getTrialCount());
}
