// status.js — STORMFIRE Server Status aus Supabase (site_realm_status)

(function () {
  console.log("[status.js] loaded");

  const SUPABASE_URL = "https://furuovwvtbbgedxqukzz.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_GmsSvpE-8xoRVsgePDIrsQ_p-jH5gQ2";

  const $ = (id) => document.getElementById(id);

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

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${url}`);
    }

    return await res.json();
  }

  async function loadStatus() {
    try {
      console.log("[status.js] fetching...");

      const [realms, characters, drachenbund, wolfsmark] = await Promise.all([
        fetchJson(
          `${SUPABASE_URL}/rest/v1/site_realm_status?select=realm_key,online,players_online,queue_size,last_heartbeat,updated_at`
        ),
        fetchJson(
          `${SUPABASE_URL}/rest/v1/characters?select=id`
        ),
        fetchJson(
          `${SUPABASE_URL}/rest/v1/characters?select=id&faction=eq.Drachenbund`
        ),
        fetchJson(
          `${SUPABASE_URL}/rest/v1/characters?select=id&faction=eq.Wolfsmark`
        )
      ]);

      const onlineRealms = realms.filter(r => !!r.online).length;
      const offlineRealms = realms.length - onlineRealms;
      const totalOnlinePlayers = realms.reduce((sum, r) => sum + Number(r.players_online || 0), 0);

      setBadge(onlineRealms > 0 ? "online" : "offline", onlineRealms > 0 ? "ONLINE" : "OFFLINE");

      setText("playersOnline", formatNumber(totalOnlinePlayers));
      setText("onlineRealms", formatNumber(onlineRealms));
      setText("offlineRealms", formatNumber(offlineRealms));

      setText("playersTotal", formatNumber(characters.length));
      setText("totalPlayers", formatNumber(characters.length));

      setText("faction1", formatNumber(drachenbund.length));
      setText("faction2", formatNumber(wolfsmark.length));

      if ($("faction1Sub")) $("faction1Sub").textContent = "Drachenbund";
      if ($("faction2Sub")) $("faction2Sub").textContent = "Wolfsmark";

      const loginStatus = $("loginStatus");
      if (loginStatus) loginStatus.textContent = "ONLINE";

      const mainRealm = realms.find(r => r.online) || realms[0];
      if ($("realmName")) $("realmName").textContent = mainRealm ? mainRealm.realm_key : "—";
      if ($("serverName")) $("serverName").textContent = "STORMFIRE Login";
      if ($("region")) $("region").textContent = "EU";
      if ($("mode")) $("mode").textContent = "Live";
      if ($("capacity")) $("capacity").textContent = mainRealm ? formatNumber(mainRealm.queue_size || 0) : "0";

      if ($("lastUpdated")) {
        $("lastUpdated").textContent =
          "Letztes Update: " + new Date().toLocaleString("de-DE");
      }

      const list = $("realmList");
      if (list) {
        list.innerHTML = "";

        realms.forEach((realm) => {
          const row = document.createElement("div");
          row.className = "realmRow";
          row.style.display = "flex";
          row.style.justifyContent = "space-between";
          row.style.alignItems = "center";
          row.style.padding = "10px 0";
          row.style.borderBottom = "1px solid rgba(255,255,255,.06)";

          const left = document.createElement("div");
          left.style.display = "flex";
          left.style.alignItems = "center";
          left.style.gap = "10px";

          const dot = document.createElement("span");
          dot.style.width = "10px";
          dot.style.height = "10px";
          dot.style.borderRadius = "50%";
          dot.className = realm.online ? "good" : "bad";

          const name = document.createElement("span");
          name.style.fontWeight = "600";
          name.textContent = realm.realm_key;

          left.appendChild(dot);
          left.appendChild(name);

          const right = document.createElement("div");
          right.style.textAlign = "right";
          right.innerHTML = `
            <div>${formatNumber(realm.players_online)} online</div>
            <div style="opacity:.7;font-size:12px;">${realm.online ? "ONLINE" : "OFFLINE"}</div>
          `;

          row.appendChild(left);
          row.appendChild(right);
          list.appendChild(row);
        });
      }

      console.log("[status.js] success", {
        onlineRealms,
        offlineRealms,
        totalOnlinePlayers,
        characters: characters.length
      });
    } catch (err) {
      console.error("[status.js] error", err);
      setBadge("offline", "DATENFEHLER");
      if ($("lastUpdated")) {
        $("lastUpdated").textContent = "Konnte Live-Daten nicht laden.";
      }
    }
  }

  loadStatus();
  setInterval(loadStatus, 15000);
})();
