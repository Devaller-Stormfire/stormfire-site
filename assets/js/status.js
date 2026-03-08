// status.js — lädt Realm-Live-Daten aus Supabase statt aus /data/status.json
(async function () {
  const $ = (id) => document.getElementById(id);

  const SUPABASE_URL = "https://furuovwvtbbgedxqukzz.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_GmsSvpE-8xoRVsgePDIrsQ_p-jH5gQ2";

  function setBadge(state, text) {
    const dot = $("statusDot");
    const label = $("statusText");
    if (!dot || !label) return;

    dot.classList.remove("good", "warn", "bad");

    if (state === "online") dot.classList.add("good");
    else if (state === "maintenance") dot.classList.add("warn");
    else dot.classList.add("bad");

    label.textContent = text;
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("de-DE").format(Number(value || 0));
  }

  function formatTime(value) {
    try {
      return new Date(value).toLocaleString("de-DE");
    } catch {
      return "—";
    }
  }

  async function fetchRealmData() {
    const url =
      `${SUPABASE_URL}/rest/v1/realm_live_status` +
      `?select=realm_key,realm_name,status,players_online,updated_at` +
      `&realm_key=eq.ewiger-bund`;

    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!res.ok) {
      throw new Error(`Supabase HTTP ${res.status}`);
    }

    const rows = await res.json();
    return rows?.[0] || null;
  }

  try {
    const data = await fetchRealmData();

    if (!data) {
      setBadge("offline", "KEINE DATEN");
      $("lastUpdated").textContent = "Keine Realm-Daten gefunden.";
      return;
    }

    const state = String(data.status || "offline").toLowerCase();

    if (state === "online") setBadge("online", "ONLINE");
    else if (state === "maintenance") setBadge("maintenance", "MAINTENANCE");
    else setBadge("offline", "OFFLINE");

    if ($("lastUpdated")) {
      $("lastUpdated").textContent = "Letztes Update: " + formatTime(data.updated_at);
    }

    if ($("serverName")) $("serverName").textContent = "STORMFIRE Login";
    if ($("realmName")) $("realmName").textContent = data.realm_name || "—";
    if ($("region")) $("region").textContent = "EU";
    if ($("mode")) $("mode").textContent = "Live";
    if ($("playersOnline")) $("playersOnline").textContent = formatNumber(data.players_online);
    if ($("capacity")) $("capacity").textContent = "—";

    // Optional: Fraktionsblöcke unverändert lassen oder später separat anbinden
    if ($("faction1")) $("faction1").textContent = "Drachenbund";
    if ($("faction2")) $("faction2").textContent = "Wolfsmark";
    if ($("faction1Sub")) $("faction1Sub").textContent = "Live-Daten separat";
    if ($("faction2Sub")) $("faction2Sub").textContent = "Live-Daten separat";
  } catch (err) {
    console.error(err);
    setBadge("offline", "DATENFEHLER");
    if ($("lastUpdated")) {
      $("lastUpdated").textContent = "Konnte Live-Daten aus Supabase nicht laden.";
    }
  }
})();
