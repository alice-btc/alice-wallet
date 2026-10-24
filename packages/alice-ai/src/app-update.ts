// Update awareness for the wallet. The proxy Worker answers GET /app-version
// for every Alice surface; this wallet versions on its own (see CHANGELOG.md),
// so it reads only the `wallet` field of that answer, never `version`, which
// is the Alice App release. The Worker is reachable from every origin the
// wallet uses, so it stays the one place to ask.
//
// Everything fails open. No update check may ever break the app: a network
// error, a missing proxy URL, an answer without a `wallet` field or a
// malformed one all read as "no update".
import { isCheckDue, isNewerVersion } from './app-update-format.ts';

/** Simple async key-value contract: localStorage on web, AsyncStorage native. */
export type UpdateStateStore = {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
};

const LAST_SEEN_KEY = 'alice.whats-new.seen.v1';
const LAST_CHECK_KEY = 'alice.update-check.at.v1';
const CHECK_MIN_INTERVAL_MS = 6 * 60 * 60 * 1_000;

/** Fired on window (web surfaces) whenever a newer version is discovered. */
export const APP_UPDATE_EVENT = 'alice-app-update';

export function currentAppVersion(): string | null {
  const value = (process.env.EXPO_PUBLIC_ALICE_APP_VERSION ?? '').trim();
  return /^\d+\.\d+\.\d+$/.test(value) ? value : null;
}

/** Asks the proxy for the released wallet version. Null on any failure. */
export async function fetchLatestAppVersion(
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  const proxyUrl = (process.env.EXPO_PUBLIC_VENICE_PROXY_URL ?? '').trim().replace(/\/+$/, '');
  if (!proxyUrl) return null;
  try {
    const response = await fetchImpl(`${proxyUrl}/app-version`);
    if (!response.ok) return null;
    const body = await response.json() as { wallet?: unknown } | null;
    const wallet = body?.wallet;
    return typeof wallet === 'string' && /^\d+\.\d+\.\d+$/.test(wallet) ? wallet : null;
  } catch {
    return null;
  }
}

/**
 * Throttled check: at most one request per six hours per device. Returns the
 * newer version when there is one, null otherwise.
 */
export async function checkForAppUpdate(
  store: UpdateStateStore,
  nowMs: number = Date.now(),
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  const current = currentAppVersion();
  if (!current) return null;
  try {
    const rawLast = await store.getItem(LAST_CHECK_KEY);
    const lastMs = rawLast === null ? null : Number(rawLast);
    if (!isCheckDue(lastMs, nowMs, CHECK_MIN_INTERVAL_MS)) return null;
    await store.setItem(LAST_CHECK_KEY, String(nowMs));
  } catch {
    // A broken store must not block the check itself.
  }
  const latest = await fetchLatestAppVersion(fetchImpl);
  return latest && isNewerVersion(latest, current) ? latest : null;
}

/**
 * Whether to open the what's-new dialog, and the bookkeeping that keeps it a
 * one-time event per version. A fresh install records silently.
 */
export async function takeWhatsNew(store: UpdateStateStore): Promise<string | null> {
  const current = currentAppVersion();
  if (!current) return null;
  try {
    const lastSeen = await store.getItem(LAST_SEEN_KEY);
    if (lastSeen === current) return null;
    await store.setItem(LAST_SEEN_KEY, current);
    return lastSeen === null ? null : current;
  } catch {
    return null;
  }
}
