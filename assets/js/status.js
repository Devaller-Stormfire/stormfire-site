// status.js — lädt Realm-Live-Daten aus Supabase aus site_realm_status

// status.js — lädt Realm-Live-Daten aus Supabase aus site_realm_status

(async function () {
  const $ = (id) => document.getElementById(id);

  // ...
})();

  const SUPABASE_URL = "https://furuovwvtbbgedxqukzz.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_GmsSvpE-8xoRVsgePDIrsQ_p-jH5gQ2";

  const REALM_LABELS = {
    "Aschepakt": "Aschepakt",
    "Blutpfad": "Blutpfad",
    "Ewiger Bund": "Ewiger Bund",
    "Schattenpfad": "Schattenpfad",
    "Sturmklippe": "Sturmklippe",
    "Sturmkrone": "Sturmkrone"
  };

  function formatNumber(value) {
    return new Intl.NumberFormat("de-DE").format(Number(value || 0));
  }

  function formatTime(value) {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleString("de-DE");
    } catch {
      return "—";
    }
  }

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

  async function fetchJson(url) {
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!res.ok) {
      throw new Error(`Supabase HTTP ${res.status}`);
    }

    return await res.json();
  }

  async function fetchAllRealmStatus() {
    const url =
      `${SUPABASE_URL}/rest/v1/site_realm_status` +
      `?select=realm_key,online,players_online,queue_size,last_heartbeat,updated_at`;

    return await fetchJson(url);
  }

  async function fetchCharacterCounts() {
    const totalUrl =
      `${SUPABASE_URL}/rest/v1/characters?select=id`;

    const drachenbundUrl =
      `${SUPABASE_URL}/rest/v1/characters?select=id&faction=eq.Drachenbund`;

    const wolfsmarkUrl =
      `${SUPABASE_URL}/rest/v1/characters?select=id&faction=eq.Wolfsmark`;

    const [totalRows, drachenbundRows, wolfsmarkRows] = await Promise.all([
      fetchJson(totalUrl),
      fetchJson(drachenbundUrl),
      fetchJson(wolfsmarkUrl)
    ]);

    return {
      total: Array.isArray(totalRows) ? totalRows.length : 0,
      drachenbund: Array.isArray(drachenbundRows) ? drachenbundRows.length : 0,
      wolfsmark: Array.isArray(wolfsmarkRows) ? wolfsmarkRows.length : 0
    };
  }

  function getMainRealm(realms) {
    if (!Array.isArray(realms) || realms.length === 0) return null;

    return (
      realms.find((r) => r.realm_key === "Ewiger Bund") ||
      realms.find((r) => r.realm_key === "Blutpfad") ||
      realms[0]
    );
  }

  function renderRealmOverview(realms) {
    const onlineCount = realms.filter((r) => !!r.online).length;
    const offlineCount = realms.length - onlineCount;

    if ($("onlineRealms")) $("onlineRealms").textContent = formatNumber(onlineCount);
    if ($("offlineRealms")) $("offlineRealms").textContent = formatNumber(offlineCount);

    const list =
      $("realmList") ||
      $("allRealmsList") ||
      $("realmsList") ||
      $("realmOverviewList");

    if (!list) return;

    list.innerHTML = "";

    if (!realms.length) {
      list.innerHTML = `<div class="muted">Keine Realm-Daten gefunden.</div>`;
      return;
    }

    const sorted = [...realms].sort((a, b) => {
      const an = REALM_LABELS[a.realm_key] || a.realm_key || "";
      const bn = REALM_LABELS[b.realm_key] || b.realm_key || "";
      return an.localeCompare(bn, "de");
    });

    for (const realm of sorted) {
      const state = realm.online ? "online" : "offline";
      const dotClass = realm.online ? "good" : "bad";
      const displayName = REALM_LABELS[realm.realm_key] || realm.realm_key || "—";

      const row = document.createElement("div");
      row.className = "realm-row";
      row.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06);">
          <div style="display:flex;align-items:center;gap:10px;min-width:0;">
            <span class="${dotClass}" style="width:10px;height:10px;border-radius:50%;display:inline-block;"></span>
            <span style="font-weight:600;">${displayName}</span>
          </div>
          <div style="text-align:right;white-space:nowrap;">
            <div>${formatNumber(realm.players_online)} online</div>
            <div style="opacity:.7;font-size:12px;">${state.toUpperCase()}</div>
          </div>
        </div>
      `;
      list.appendChild(row);
    }
  }

  try {
    const [realms, counts] = await Promise.all([
      fetchAllRealmStatus(),
      fetchCharacterCounts().catch(() => ({
        total: 0,
        drachenbund: 0,
        wolfsmark: 0
      }))
    ]);

    const mainRealm = getMainRealm(realms);

    if (!mainRealm) {
      setBadge("offline", "KEINE DATEN");
      if ($("lastUpdated")) {
        $("lastUpdated").textContent = "Keine Realm-Daten gefunden.";
      }
      renderRealmOverview([]);
      return;
    }

    const mainState = mainRealm.online ? "online" : "offline";
    const mainRealmName = REALM_LABELS[mainRealm.realm_key] || mainRealm.realm_key || "—";

    setBadge(mainState, mainState === "online" ? "ONLINE" : "OFFLINE");

    if ($("lastUpdated")) {
      $("lastUpdated").textContent =
        "Letztes Update: " + formatTime(mainRealm.updated_at || mainRealm.last_heartbeat);
    }

    if ($("serverName")) $("serverName").textContent = "STORMFIRE Login";
    if ($("realmName")) $("realmName").textContent = mainRealmName;
    if ($("region")) $("region").textContent = "EU";
    if ($("mode")) $("mode").textContent = "Live";

    if ($("playersOnline")) {
      const totalOnline = realms.reduce((sum, r) => sum + Number(r.players_online || 0), 0);
      $("playersOnline").textContent = formatNumber(totalOnline);
    }

    if ($("capacity")) $("capacity").textContent = formatNumber(mainRealm.queue_size || 0);

    if ($("totalPlayers")) $("totalPlayers").textContent = formatNumber(counts.total);
    if ($("playersTotal")) $("playersTotal").textContent = formatNumber(counts.total);

    if ($("faction1")) $("faction1").textContent = formatNumber(counts.drachenbund);
    if ($("faction2")) $("faction2").textContent = formatNumber(counts.wolfsmark);

    if ($("faction1Sub")) $("faction1Sub").textContent = "Drachenbund";
    if ($("faction2Sub")) $("faction2Sub").textContent = "Wolfsmark";

    renderRealmOverview(realms);
  } catch (err) {
    console.error("[status.js]", err);

    setBadge("offline", "DATENFEHLER");

    if ($("lastUpdated")) {
      $("lastUpdated").textContent = "Konnte Live-Daten aus Supabase nicht laden.";
    }

    const list =
      $("realmList") ||
      $("allRealmsList") ||
      $("realmsList") ||
      $("realmOverviewList");

    if (list) {
      list.innerHTML = `<div class="muted">Verbindung zu Supabase fehlgeschlagen.</div>`;
    }

    if ($("onlineRealms")) $("onlineRealms").textContent = "0";
    if ($("offlineRealms")) $("offlineRealms").textContent = "0";
  }
})();
