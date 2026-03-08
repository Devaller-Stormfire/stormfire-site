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

  async function fetchMainRealm() {
    const url =
      `${SUPABASE_URL}/rest/v1/realm_live_status` +
      `?select=realm_key,realm_name,status,players_online,updated_at` +
      `&realm_key=eq.ewiger-bund`;

    const rows = await fetchJson(url);
    return rows?.[0] || null;
  }

  async function fetchAllRealms() {
    const url =
      `${SUPABASE_URL}/rest/v1/realm_live_status` +
      `?select=realm_key,realm_name,status,players_online,updated_at` +
      `&order=realm_name.asc`;

    return await fetchJson(url);
  }

  function renderRealmOverview(realms) {
    const onlineCount = realms.filter(
      (r) => String(r.status || "").toLowerCase() === "online"
    ).length;

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

    realms.forEach((realm) => {
      const state = String(realm.status || "offline").toLowerCase();
      const row = document.createElement("div");
      row.className = "realm-row";

      row.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06);">
          <div style="display:flex;align-items:center;gap:10px;min-width:0;">
            <span style="width:10px;height:10px;border-radius:50%;display:inline-block;"
                  class="${state === "online" ? "good" : state === "maintenance" ? "warn" : "bad"}"></span>
            <span style="font-weight:600;">${realm.realm_name || "—"}</span>
          </div>
          <div style="text-align:right;white-space:nowrap;">
            <div>${formatNumber(realm.players_online)} online</div>
            <div style="opacity:.7;font-size:12px;">${state.toUpperCase()}</div>
          </div>
        </div>
      `;

      list.appendChild(row);
    });
  }

  try {
    const [mainRealm, allRealms] = await Promise.all([
      fetchMainRealm(),
      fetchAllRealms()
    ]);

    if (!mainRealm) {
      setBadge("offline", "KEINE DATEN");
      if ($("lastUpdated")) {
        $("lastUpdated").textContent = "Keine Realm-Daten gefunden.";
      }
      renderRealmOverview(allRealms || []);
      return;
    }

    const state = String(mainRealm.status || "offline").toLowerCase();

    if (state === "online") setBadge("online", "ONLINE");
    else if (state === "maintenance") setBadge("maintenance", "MAINTENANCE");
    else setBadge("offline", "OFFLINE");

    if ($("lastUpdated")) {
      $("lastUpdated").textContent =
        "Letztes Update: " + formatTime(mainRealm.updated_at);
    }

    if ($("serverName")) $("serverName").textContent = "STORMFIRE Login";
    if ($("realmName")) $("realmName").textContent = mainRealm.realm_name || "—";
    if ($("region")) $("region").textContent = "EU";
    if ($("mode")) $("mode").textContent = "Live";
    if ($("playersOnline")) {
      $("playersOnline").textContent = formatNumber(mainRealm.players_online);
    }
    if ($("capacity")) $("capacity").textContent = "—";

    if ($("faction1")) $("faction1").textContent = "Drachenbund";
    if ($("faction2")) $("faction2").textContent = "Wolfsmark";
    if ($("faction1Sub")) $("faction1Sub").textContent = "Live-Daten separat";
    if ($("faction2Sub")) $("faction2Sub").textContent = "Live-Daten separat";

    renderRealmOverview(allRealms || []);
  } catch (err) {
    console.error("[status.js]", err);
    setBadge("offline", "DATENFEHLER");

    if ($("lastUpdated")) {
      $("lastUpdated").textContent =
        "Konnte Live-Daten aus Supabase nicht laden.";
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
