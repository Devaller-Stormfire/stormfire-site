// STORMFIRE site.js — sidebar active link + live status + astral init
(async function(){
  // Active link
  try{
    const path = location.pathname.replace(/\/+$/, "") || "/index.html";
    document.querySelectorAll(".sideNav a.navbtn").forEach(a => {
      const href = (a.getAttribute("href") || "").replace(/\/+$/, "");
      if (href && href === path) a.classList.add("active");
    });
  }catch{}

  // Live status in sidebar
  const liveDot = document.getElementById("liveDot");
  const liveTxt = document.getElementById("liveTxt");

  function setLive(state, realmName, online){
    if(!liveDot || !liveTxt) return;

    liveDot.classList.remove("good","warn","bad");

    if(state === "online") liveDot.classList.add("good");
    else if(state === "maintenance") liveDot.classList.add("warn");
    else liveDot.classList.add("bad");

    const name = realmName || "Realm";
    const on = (online ?? 0);
    liveTxt.textContent = `${name} • ${String(state).toUpperCase()} • ${window.sf.formatNumber(on)} online`;
  }

  async function loadLive(){
    try{
      setLive("offline", "Realm", 0);
      const data = await window.sf.fetchJSON("/data/status.json");
      const realms = Array.isArray(data?.realms) ? data.realms : [];

      // Prefer Ewiger Bund for the sidebar display
      const main = realms.find(r => r?.id === "ewiger-bund") || realms[0];
      if(!main){
        setLive("offline", "Realm", 0);
        return;
      }

      setLive(String(main.status || "offline").toLowerCase(), main.name, main.playersOnline || 0);
    }catch{
      setLive("offline", "Realm", 0);
    }
  }

  await loadLive();
  setInterval(() => { if(document.visibilityState === "visible") loadLive(); }, 60_000);

  // Astral background (if script exists)
  // (astral.js runs by itself)
})();