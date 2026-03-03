(async function () {
  const grid = document.getElementById("realmGrid");
  const pageDot = document.getElementById("pageDot");
  const pageState = document.getElementById("pageState");

  function dotClass(status){
    const s = String(status || "offline").toLowerCase();
    if(s === "online") return "good";
    if(s === "maintenance") return "warn";
    return "bad";
  }

  function pretty(status){
    const s = String(status || "offline").toLowerCase();
    if(s === "online") return "ONLINE";
    if(s === "maintenance") return "MAINTENANCE";
    return "OFFLINE";
  }

  function realmCard(r){
    const f1 = r?.factions?.[0] || { name:"Drachenbund", players:0 };
    const f2 = r?.factions?.[1] || { name:"Wolfsmark", players:0 };
    return `
      <article class="card">
        <div class="hd">
          <h2>${window.sf.escapeHtml(r?.name || "Realm")}</h2>
          <span class="pill">
            <span class="dot ${dotClass(r?.status)}"></span>
            <b>${pretty(r?.status)}</b>
          </span>
        </div>

        <div class="kpi">
          <div class="box">
            <div class="label">Region</div>
            <div class="value">${window.sf.escapeHtml(r?.region || "—")}</div>
          </div>
          <div class="box">
            <div class="label">Modus</div>
            <div class="value">${window.sf.escapeHtml(r?.type || "—")}</div>
          </div>
          <div class="box">
            <div class="label">Online</div>
            <div class="value glow">${window.sf.formatNumber(r?.playersOnline || 0)}</div>
          </div>
          <div class="box">
            <div class="label">Capacity</div>
            <div class="value">${window.sf.formatNumber(r?.capacity || 0)}</div>
          </div>
          <div class="box">
            <div class="label">${window.sf.escapeHtml(f1.name)}</div>
            <div class="value">${window.sf.formatNumber(f1.players)}</div>
          </div>
          <div class="box">
            <div class="label">${window.sf.escapeHtml(f2.name)}</div>
            <div class="value">${window.sf.formatNumber(f2.players)}</div>
          </div>
        </div>
      </article>
    `;
  }

  async function load(){
    try{
      pageDot.className = "dot warn";
      pageState.textContent = "Lädt…";

      const data = await window.sf.fetchJSON("/data/status.json");
      const realms = Array.isArray(data?.realms) ? data.realms : [];

      const anyOnline = realms.some(r => String(r?.status).toLowerCase() === "online");
      pageDot.className = "dot " + (anyOnline ? "good" : "bad");
      pageState.textContent = anyOnline ? "ONLINE" : "OFFLINE";

      grid.innerHTML = realms.map(realmCard).join("") || `
        <article class="card" style="grid-column: span 12;">
          <div class="hd"><h2>Keine Realms</h2></div>
          <div class="small">Bitte /data/status.json prüfen.</div>
        </article>
      `;
    }catch(e){
      pageDot.className = "dot bad";
      pageState.textContent = "OFFLINE";
      grid.innerHTML = `
        <article class="card" style="grid-column: span 12;">
          <div class="hd"><h2>Status nicht verfügbar</h2></div>
          <div class="small">Konnte /data/status.json nicht laden. Offline-Fallback greift, falls Cache existiert.</div>
        </article>
      `;
    }
  }

  await load();

  setInterval(() => {
    if(document.visibilityState === "visible") load();
  }, 60_000);
})();