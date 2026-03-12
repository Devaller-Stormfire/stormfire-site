(function () {
  const SUPABASE_URL = "https://furuovwvtbbgedxqukzz.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_GmsSvpE-8xoRVsgePDIrsQ_p-jH5gQ2";

  const $ = (id) => document.getElementById(id);

  const REALM_DISPLAY = {
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

  function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
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
      },
      cache: "no-store"
    });

    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  }

  function renderRealmList(realms) {
    const list = $("realmList");
    if (!list) return;

    list.innerHTML = "";

    const sorted = [...realms].sort((a, b) => {
      const an = REALM_DISPLAY[a.realm_key] || a.realm_key || "";
      const bn = REALM_DISPLAY[b.realm_key] || b.realm_key || "";
      return an.localeCompare(bn, "de");
    });

    sorted.forEach((realm) => {
      const row = document.createElement("div");
      row.className = "realmRow";

      const left = document.createElement("div");
      left.className = "realmLeft";

      const dot = document.createElement("span");
      dot.className = realm.online ? "good" : "bad";

      const name = document.createElement("span");
      name.className = "realmName";
      name.textContent = REALM_DISPLAY[realm.realm_key] || realm.realm_key;

      left.appendChild(dot);
      left.appendChild(name);

      const right = document.createElement("div");
      right.className = "realmRight";
      right.innerHTML = `
        <div>${formatNumber(realm.players_online)} online</div>
        <div class="realmState">${realm.online ? "ONLINE" : "OFFLINE"}</div>
      `;

      row.appendChild(left);
      row.appendChild(right);
      list.appendChild(row);
    });
  }

  async function loadStatus() {
    try {
      const [realms, characters, drachenbund, wolfsmark] = await Promise.all([
        fetchJson(`${SUPABASE_URL}/rest/v1/site_realm_status?select=realm_key,online,players_online,queue_size,last_heartbeat,updated_at`),
        fetchJson(`${SUPABASE_URL}/rest/v1/characters?select=id`),
        fetchJson(`${SUPABASE_URL}/rest/v1/characters?select=id&faction=eq.Drachenbund`),
        fetchJson(`${SUPABASE_URL}/rest/v1/characters?select=id&faction=eq.Wolfsmark`)
      ]);

      const onlineRealms = realms.filter(r => !!r.online).length;
      const offlineRealms = realms.length - onlineRealms;
      const totalOnlinePlayers = realms.reduce((sum, r) => sum + Number(r.players_online || 0), 0);
      const mainRealm = realms.find(r => r.online) || realms[0];

      setBadge(onlineRealms > 0 ? "online" : "offline", onlineRealms > 0 ? "ONLINE" : "OFFLINE");
      setText("loginStatus", "ONLINE");
      setText("realmName", mainRealm ? (REALM_DISPLAY[mainRealm.realm_key] || mainRealm.realm_key) : "—");
      setText("playersTotal", formatNumber(characters.length));
      setText("faction1", formatNumber(drachenbund.length));
      setText("faction2", formatNumber(wolfsmark.length));
      setText("playersOnline", formatNumber(totalOnlinePlayers));
      setText("capacity", mainRealm ? formatNumber(mainRealm.queue_size || 0) : "0");
      setText("onlineRealms", formatNumber(onlineRealms));
      setText("offlineRealms", formatNumber(offlineRealms));

      const last = mainRealm?.updated_at || mainRealm?.last_heartbeat;
      setText("lastUpdated", "Letztes Update: " + (last ? new Date(last).toLocaleString("de-DE") : new Date().toLocaleString("de-DE")));

      renderRealmList(realms);
    } catch (err) {
      console.error("[status.js] error", err);
      setBadge("offline", "DATENFEHLER");
      setText("lastUpdated", "Letztes Update: Fehler beim Laden");
    }
  }

  loadStatus();
  setInterval(loadStatus, 15000);
})();