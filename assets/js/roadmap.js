(async function(){
  const grid = document.getElementById("rmGrid");
  const updated = document.getElementById("rmUpdated");

  function stageCard(s){
    const title = window.sf.escapeHtml(s?.title || "Stage");
    const desc = window.sf.escapeHtml(s?.desc || "");
    const status = String(s?.status || "planned").toLowerCase();
    const badge = status === "done" ? "good" : (status === "wip" ? "warn" : "bad");
    const label = status === "done" ? "DONE" : (status === "wip" ? "WIP" : "PLANNED");

    return `
      <article class="card" style="grid-column: span 6;">
        <div class="hd">
          <h2>${title}</h2>
          <span class="pill"><span class="dot ${badge}"></span><b>${label}</b></span>
        </div>
        <div class="small">${desc}</div>
      </article>
    `;
  }

  try{
    const data = await window.sf.fetchJSON("/data/roadmap.json");
    updated.textContent = data?.updated_at ? ("Update: " + window.sf.formatTime(data.updated_at)) : "Update: —";
    const stages = Array.isArray(data?.stages) ? data.stages : [];
    grid.innerHTML = stages.map(stageCard).join("") || `<article class="card" style="grid-column: span 12;"><div class="small">Keine Stages.</div></article>`;
  }catch{
    updated.textContent = "Update: —";
    grid.innerHTML = `<article class="card" style="grid-column: span 12;"><div class="small">Konnte <code>/data/roadmap.json</code> nicht laden.</div></article>`;
  }
})();