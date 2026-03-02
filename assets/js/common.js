// common.js — SAFE fetch (TTL cache + backoff + tab-visibility throttle)
(function () {
  window.sf = window.sf || {};

  const memCache = new Map(); // path -> {ts, data}
  const failState = new Map(); // path -> {failCount, nextTryTs}

  const TTL_MS = 60_000;        // 1 Minute: reicht locker für Status/News/Leaderboard
  const MAX_BACKOFF_MS = 300_000; // max 5 Minuten
  const BASE_BACKOFF_MS = 5_000;

  function now() { return Date.now(); }

  window.sf.fetchJSON = async function (path) {
    // 1) wenn Tab nicht sichtbar: nicht pollen/keine neuen Requests
    if (document.visibilityState !== "visible") {
      const cached = memCache.get(path);
      if (cached) return cached.data;
      // falls kein Cache vorhanden, trotzdem einmal laden (aber nicht spammen)
    }

    // 2) Backoff, falls vorher Fehler / 429
    const fs = failState.get(path);
    if (fs && now() < fs.nextTryTs) {
      const cached = memCache.get(path);
      if (cached) return cached.data;
      throw new Error(`Backoff active for ${path}`);
    }

    // 3) TTL Cache (verhindert “reload-storm”)
    const c = memCache.get(path);
    if (c && (now() - c.ts) < TTL_MS) return c.data;

    // 4) Fetch normal (wichtig: NICHT no-store)
    const res = await fetch(path, { cache: "default" });

    // 5) Wenn 429: Backoff hochdrehen, Cache (falls vorhanden) zurückgeben
    if (res.status === 429) {
      const prev = failState.get(path)?.failCount || 0;
      const failCount = prev + 1;
      const wait = Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * Math.pow(2, Math.min(6, failCount)));
      failState.set(path, { failCount, nextTryTs: now() + wait });

      if (c) return c.data;
      throw new Error(`429 rate limited: ${path}`);
    }

    if (!res.ok) {
      // Fehler -> Backoff + Cache fallback
      const prev = failState.get(path)?.failCount || 0;
      const failCount = prev + 1;
      const wait = Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * Math.pow(2, Math.min(6, failCount)));
      failState.set(path, { failCount, nextTryTs: now() + wait });

      if (c) return c.data;
      throw new Error(`Fetch failed ${res.status}: ${path}`);
    }

    // success -> Failstate reset
    failState.delete(path);

    const data = await res.json();
    memCache.set(path, { ts: now(), data });
    return data;
  };
})();
