// STORMFIRE Core (safe fetch + offline fallback)

window.sf = window.sf || {};

window.sf.__memCache = window.sf.__memCache || new Map();
window.sf.__failState = window.sf.__failState || new Map();

const memCache = window.sf.__memCache;
const failState = window.sf.__failState;

const TTL_MS = 60000;
const MAX_BACKOFF_MS = 300000;
const BASE_BACKOFF_MS = 5000;

function now() {
  return Date.now();
}

window.sf.fetchJSON = async function (path) {

  const cache = memCache.get(path);
  if (cache && (now() - cache.ts) < TTL_MS) {
    return cache.data;
  }

  const fs = failState.get(path);
  if (fs && now() < fs.nextTryTs) {
    if (cache) return cache.data;
    throw new Error("Backoff active");
  }

  try {
    const res = await fetch(path, { cache: "default" });

    if (!res.ok) {
      throw new Error("Fetch failed: " + res.status);
    }

    const data = await res.json();

    memCache.set(path, { ts: now(), data });
    failState.delete(path);

    return data;

  } catch (e) {

    const prev = failState.get(path)?.failCount || 0;
    const failCount = prev + 1;
    const wait = Math.min(
      MAX_BACKOFF_MS,
      BASE_BACKOFF_MS * Math.pow(2, failCount)
    );

    failState.set(path, {
      failCount,
      nextTryTs: now() + wait
    });

    if (cache) return cache.data;

    throw e;
  }
};

// Helpers
window.sf.formatNumber = function (n) {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("de-DE").format(n);
};

window.sf.formatTime = function (iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short"
  });
};

window.sf.escapeHtml = function (str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};