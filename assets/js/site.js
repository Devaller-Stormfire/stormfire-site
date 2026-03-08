// site.js — Navigation + Live Realm Status aus Supabase

(async function () {

  const SUPABASE_URL = "https://furuovwvtbbgedxqukzz.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_GmsSvpE-8xoRVsgePDIrsQ_p-jH5gQ2";

  function formatNumber(value) {
    return new Intl.NumberFormat("de-DE").format(Number(value || 0));
  }

  const liveDot = document.getElementById("liveDot");
  const liveTxt = document.getElementById("liveTxt");

  function setLive(state, realmName, online) {

    if (!liveDot || !liveTxt) return;

    liveDot.classList.remove("good", "warn", "bad");

    if (state === "online") liveDot.classList.add("good");
    else if (state === "maintenance") liveDot.classList.add("warn");
    else liveDot.classList.add("bad");

    liveTxt.textContent =
      `${realmName} • ${state.toUpperCase()} • ${formatNumber(online)} online`;
  }

  async function loadRealmStatus() {

    try {

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/realm_live_status?select=realm_name,status,players_online&realm_key=eq.ewiger-bund`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );

      if (!res.ok) throw new Error("Supabase Fehler");

      const data = await res.json();

      const realm = data?.[0];

      if (!realm) {
        setLive("offline", "Realm", 0);
        return;
      }

      setLive(
        String(realm.status || "offline").toLowerCase(),
        realm.realm_name,
        realm.players_online
      );

    } catch (err) {

      console.error("[site.js]", err);

      setLive("offline", "Realm", 0);

    }

  }

  // Seite laden
  await loadRealmStatus();

  // Auto Update alle 15 Sekunden
  setInterval(() => {

    if (document.visibilityState === "visible") {
      loadRealmStatus();
    }

  }, 15000);

})();
