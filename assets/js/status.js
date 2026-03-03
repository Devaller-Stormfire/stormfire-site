(async function () {
  document.getElementById("year").textContent = new Date().getFullYear();

  const grid = document.querySelector("section.grid");
  const pill = document.getElementById("pageState");
  const dot = document.getElementById("pageDot");
  const updated = document.getElementById("lastUpdated");

  function dotClass(status) {
    const s = String(status || "offline").toLowerCase();
    if (s === "online") return "good";
    if (s === "maintenance") return "warn";
    return "bad";
  }

  function prettyStatus(status){
    const s = String(status || "offline").toLowerCase();
    if (s === "online") return "ONLINE";
    if (s === "maintenance") return "MAINTENANCE";
    return "OFFLINE";
  }

  function realmCard(r) {
    const f1 = r.factions?.[0] || { name: "Fraktion 1", players: 0 };
    const f2 = r.factions?.[1] || { name: "Fraktion 2", players: 0 };

    return `
      <article class="card">
        <div class="hd">
          <h2>${window.sf.escapeHtml(r.name)}</h2>
          <span class="pill">
            <span class="dot ${dotClass(r.status)}"></span>
            <b>${prettyStatus(r.status)}</b>
          </span>
        </div>
        <div class="bd">
          <div class="kpi">
            <div class="box">
              <div class="label">Region</div>
              <div class="value">${window.sf.escapeHtml(r.region || "—")}</div>
            </div>
            <div class="box">
              <div class="label">Modus</div>
              <div class="value">${window.sf.escapeHtml(r.type || "—")}</div>
            </div>
            <div class="box">
              <div class="label">Online</div>
              <div class="value glow">${window.sf.formatNumber(r.playersOnline || 0)}</div>
            </div>
            <div class="box">
              <div class="label">Capacity</div>
              <div class="value">${window.sf.formatNumber(r.capacity || 0)}</div>
            </div>
            <div class="box">
              <div class="label">${window.sf.escapeHtml(f1.name)}</div>
              <div class="value">${window.sf.formatNumber(f1.players || 0)}</div>
            </div>
            <div class="box">
              <div class="label">${window.sf.escapeHtml(f2.name)}</div>
              <div class="value">${window.sf.formatNumber(f2.players || 0)}</div>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  async function load() {
    try {
      dot.className = "dot warn";
      pill.textContent = "Lädt…";
      if (updated) updated.textContent = "—";

      const data = await window.sf.fetchJSON("/data/status.json");
      const realms = Array.isArray(data.realms) ? data.realms : [];

      if (updated) updated.textContent = "Update: " + window.sf.formatTime(data.lastUpdated);

      const anyOnline = realms.some(r => String(r.status).toLowerCase() === "online");
      dot.className = "dot " + (anyOnline ? "good" : "bad");
      pill.textContent = anyOnline ? "ONLINE" : "OFFLINE";

      grid.innerHTML = realms.map(realmCard).join("") || `
        <article class="card" style="grid-column: span 12;">
          <div class="hd"><h2>Keine Realms</h2></div>
          <div class="bd small">In /data/status.json sind noch keine Realms eingetragen.</div>
        </article>
      `;
    } catch (e) {
      console.warn(e);
      dot.className = "dot bad";
      pill.textContent = "OFFLINE";
      grid.innerHTML = `
        <article class="card" style="grid-column: span 12;">
          <div class="hd"><h2>Status nicht verfügbar</h2></div>
          <div class="bd small">Konnte /data/status.json nicht laden. Offline-Fallback greift, wenn Cache vorhanden ist.</div>
        </article>
      `;
    }
  }

  await load();

  // Optional: alle 60s aktualisieren
  setInterval(() => {
    if (document.visibilityState === "visible") load();
  }, 60_000);
})();