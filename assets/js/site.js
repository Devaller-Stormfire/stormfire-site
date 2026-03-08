// site.js — Sidebar Active Link + Live Realm Status aus Supabase
(async function () {
  try {
    const path = location.pathname.replace(/\/+$/, "") || "/index.html";
    document.querySelectorAll(".sideNav a.navbtn").forEach((a) => {
      const href = (a.getAttribute("href") || "").replace(/\/+$/, "");
      if (href && href === path) a.classList.add("active");
    });
  } catch {}

  const liveDot = document.getElementById("liveDot");
  const liveTxt = document.getElementById("liveTxt");

  const SUPABASE_URL = "https://furuovwvtbbgedxqukzz.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_GmsSvpE-8xoRVsgePDIrsQ_p-jH5gQ2";

  function formatNumber(value) {
    return new Intl.NumberFormat("de-DE").format(Number(value || 0));
  }

  function setLive(state, realmName, online) {
    if (!liveDot || !liveTxt) return;

    liveDot.classList.remove("good", "warn", "bad");

    if (state === "online") liveDot.classList.add("good");
    else if (state === "maintenance") liveDot.classList.add("warn");
    else liveDot.classList.add("bad");

    const name = realmName || "Realm";
    liveTxt.textContent = `${name} • ${String(state).toUpperCase()} • ${formatNumber(online)} online`;
  }

  async function loadLive() {
    try {
      const url =
        `${SUPABASE_URL}/rest/v1/realm_live_status` +
        `?select=realm_key,realm_name,status,players_online` +
        `&realm_key=eq.ewiger-bund`;

      const res = await fetch(url, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (!res.ok) throw new Error(`Supabase HTTP ${res.status}`);

      const rows = await res.json();
      const realm = rows?.[0];

      if (!realm) {
        setLive("offline", "Realm", 0);
        return;
      }

      setLive(
        String(realm.status || "offline").toLowerCase(),
        realm.realm_name || "Realm",
        realm.players_online || 0
      );
    } catch (err) {
      console.error(err);
      setLive("offline", "Realm", 0);
    }
  }

  await loadLive();

  setInterval(() => {
    if (document.visibilityState === "visible") {
      loadLive();
    }
  }, 15000);
})();
