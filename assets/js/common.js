window.sf = window.sf || {};

const memCache = new Map();     // path -> {ts, data}
const failState = new Map();    // path -> {failCount, nextTryTs}

const TTL_MS = 60_000;            // 1 Minute Cache
const MAX_BACKOFF_MS = 300_000;   // max 5 Minuten
const BASE_BACKOFF_MS = 5_000;

function now(){ return Date.now(); }

window.sf.fetchJSON = async function(path){
  // Tab nicht sichtbar → nur Cache zurückgeben
  if (document.visibilityState !== "visible") {
    const c = memCache.get(path);
    if (c) return c.data;
  }

  // Backoff aktiv?
  const fs = failState.get(path);
  if (fs && now() < fs.nextTryTs) {
    const c = memCache.get(path);
    if (c) return c.data;
    throw new Error(`Backoff active for ${path}`);
  }

  // TTL Cache
  const c = memCache.get(path);
  if (c && (now() - c.ts) < TTL_MS) return c.data;

  // WICHTIG: NICHT cache:"no-store"
  const res = await fetch(path, { cache: "default" });

  if (res.status === 429 || !res.ok) {
    const prev = failState.get(path)?.failCount || 0;
    const failCount = prev + 1;
    const wait = Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * Math.pow(2, Math.min(6, failCount)));
    failState.set(path, { failCount, nextTryTs: now() + wait });

    if (c) return c.data;
    throw new Error(`Fetch error ${res.status} for ${path}`);
  }

  failState.delete(path);
  const data = await res.json();
  memCache.set(path, { ts: now(), data });
  return data;
};
