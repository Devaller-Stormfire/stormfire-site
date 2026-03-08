// site.js — Navigation + kleine Live-Anzeige aus Supabase (site_realm_status)

(async function () {
  try {
    const path = location.pathname.replace(/\/+$/, "") || "/index.html";
    document.querySelectorAll(".sideNav a.navbtn").forEach((a) => {
      const href = (a.getAttribute("href") || "").replace(/\/+$/, "");
      if (href && href === path) {
        a.classList.add("active");
      }
    });
  } catch {}

  const SUPABASE_URL = "https://furuovwvtbbgedxqukzz.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_GmsSvpE-8xoRVsgePDIrsQ_p-jH5gQ2";

  const liveDot = document.getElementById("liveDot");
  const liveTxt = document.getElementById("liveTxt");

  function formatNumber(value) {
    return new Intl.NumberFormat("de-DE").format(Number(value || 0));
  }

  function setLive(state, label, online) {
    if (!liveDot || !liveTxt) return;

    liveDot.classList.remove("good", "warn", "bad");

    if (state === "online") liveDot.classList.add("good");
    else if (state === "maintenance") liveDot.classList.add("warn");
    else liveDot.classList.add("bad");

    liveTxt.textContent = `${label} • ${String(state).toUpperCase()} • ${formatNumber(online)} online`;
  }

  async function loadLive() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/site_realm_status?select=realm_key,online,players_online`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );

      if (!res.ok) {
        throw new Error(`Supabase HTTP ${res.status}`);
      }

      const rows = await res.json();

      if (!Array.isArray(rows) || rows.length === 0) {
        setLive("offline", "Realms", 0);
        return;
      }

      const onlineRealms = rows.filter((r) => !!r.online).length;
      const totalPlayers = rows.reduce((sum, r) => sum + Number(r.players_online || 0), 0);

      setLive(
        onlineRealms > 0 ? "online" : "offline",
        `${onlineRealms} Realm${onlineRealms === 1 ? "" : "s"}`,
        totalPlayers
      );
    } catch (err) {
      console.error("[site.js]", err);
      setLive("offline", "Realms", 0);
    }
  }

  await loadLive();

  setInterval(() => {
    if (document.visibilityState === "visible") {
      loadLive();
    }
  }, 15000);
})();
