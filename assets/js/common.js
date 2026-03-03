// STORMFIRE common.js — Safe JSON fetch with cache/backoff + helpers
window.sf = window.sf || {};

window.sf.__memCache = window.sf.__memCache || new Map();
window.sf.__failState = window.sf.__failState || new Map();

const memCache = window.sf.__memCache;
const failState = window.sf.__failState;

const TTL_MS = 60_000;                 // 1 min in-memory
const LS_TTL_MS = 6 * 60 * 60_000;     // 6h localStorage cache
const MAX_BACKOFF_MS = 300_000;        // 5 min
const BASE_BACKOFF_MS = 5_000;
const FETCH_TIMEOUT_MS = 10_000;

function now(){ return Date.now(); }

function withTimeout(promise, ms){
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("Fetch timeout")), ms);
    promise.then(v => { clearTimeout(t); resolve(v); })
           .catch(e => { clearTimeout(t); reject(e); });
  });
}

function lsKey(path){ return "sf_cache:" + path; }

function lsRead(path){
  try{
    const raw = localStorage.getItem(lsKey(path));
    if(!raw) return null;
    const obj = JSON.parse(raw);
    if(!obj || typeof obj.ts !== "number") return null;
    if((now() - obj.ts) > LS_TTL_MS) return null;
    return obj.data ?? null;
  }catch{ return null; }
}

function lsWrite(path, data){
  try{
    localStorage.setItem(lsKey(path), JSON.stringify({ ts: now(), data }));
  }catch{ /* ignore quota */ }
}

window.sf.fetchJSON = async function(path){
  // If tab hidden, prefer cache
  if (document.visibilityState !== "visible") {
    const c = memCache.get(path);
    if (c) return c.data;
    const ls = lsRead(path);
    if (ls) return ls;
  }

  // Backoff window
  const fs = failState.get(path);
  if (fs && now() < fs.nextTryTs) {
    const c = memCache.get(path);
    if (c) return c.data;
    const ls = lsRead(path);
    if (ls) return ls;
    throw new Error(`Backoff active for ${path}`);
  }

  // In-memory TTL
  const c = memCache.get(path);
  if (c && (now() - c.ts) < TTL_MS) return c.data;

  try{
    const res = await withTimeout(fetch(path, { cache: "default" }), FETCH_TIMEOUT_MS);

    if (res.status === 429 || !res.ok) {
      const prev = failState.get(path)?.failCount || 0;
      const failCount = prev + 1;
      const wait = Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * Math.pow(2, Math.min(6, failCount)));
      failState.set(path, { failCount, nextTryTs: now() + wait });

      const ls = lsRead(path);
      if (ls) return ls;
      if (c) return c.data;

      throw new Error(`Fetch error ${res.status} for ${path}`);
    }

    failState.delete(path);

    const data = await res.json();
    memCache.set(path, { ts: now(), data });
    lsWrite(path, data);
    return data;
  }catch(e){
    const ls = lsRead(path);
    if (ls) return ls;
    if (c) return c.data;
    throw e;
  }
};

// Helpers
window.sf.formatNumber = window.sf.formatNumber || (n =>
  (n === null || n === undefined) ? "—" : new Intl.NumberFormat("de-DE").format(n)
);

window.sf.formatTime = window.sf.formatTime || (iso => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
});

window.sf.escapeHtml = window.sf.escapeHtml || (str => String(str ?? "")
  .replaceAll("&","&amp;")
  .replaceAll("<","&lt;")
  .replaceAll(">","&gt;")
  .replaceAll('"',"&quot;")
  .replaceAll("'","&#039;")
);

// Login flag (frontend placeholder)
// Later: replace with real token/session from API
window.sf.isLoggedIn = window.sf.isLoggedIn || (() => localStorage.getItem("sf_logged_in") === "1");