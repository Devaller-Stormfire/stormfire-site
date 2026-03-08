// status.js — Stormfire Server Status (Supabase)

(async function () {

  const SUPABASE_URL = "https://furuovwvtbbgedxqukzz.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_GmsSvpE-8xoRVsgePDIrsQ_p-jH5gQ2";

  const $ = (id) => document.getElementById(id);

  function formatNumber(v) {
    return new Intl.NumberFormat("de-DE").format(Number(v || 0));
  }

  function setBadge(state) {

    const dot = $("statusDot");
    const text = $("statusText");

    if (!dot || !text) return;

    dot.classList.remove("good","warn","bad");

    if (state === "online") {
      dot.classList.add("good");
      text.textContent = "ONLINE";
    }
    else {
      dot.classList.add("bad");
      text.textContent = "OFFLINE";
    }

  }

  async function loadRealmStatus() {

    try {

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/site_realm_status?select=*`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`
          },
          cache: "no-store"
        }
      );

      if (!res.ok) throw new Error("Supabase request failed");

      const realms = await res.json();

      if (!realms || realms.length === 0) {
        setBadge("offline");
        return;
      }

      const onlineRealms = realms.filter(r => r.online).length;

      const totalPlayers =
        realms.reduce((sum,r)=>sum + (r.players_online || 0),0);

      if ($("playersOnline"))
        $("playersOnline").textContent = formatNumber(totalPlayers);

      if ($("onlineRealms"))
        $("onlineRealms").textContent = onlineRealms;

      if ($("offlineRealms"))
        $("offlineRealms").textContent = realms.length - onlineRealms;

      setBadge(onlineRealms > 0 ? "online" : "offline");

      const list = $("realmList");

      if (list) {

        list.innerHTML = "";

        realms.forEach(realm => {

          const row = document.createElement("div");

          row.className = "realmRow";

          row.innerHTML = `
            <span>${realm.realm_key}</span>
            <span>${formatNumber(realm.players_online)} online</span>
          `;

          list.appendChild(row);

        });

      }

      if ($("lastUpdated"))
        $("lastUpdated").textContent =
          "Letztes Update: " + new Date().toLocaleString("de-DE");

    }

    catch(err) {

      console.error("Status Fehler:",err);

      setBadge("offline");

      if ($("lastUpdated"))
        $("lastUpdated").textContent =
          "Fehler beim Laden des Serverstatus";

    }

  }

  await loadRealmStatus();

  setInterval(loadRealmStatus,15000);

})();