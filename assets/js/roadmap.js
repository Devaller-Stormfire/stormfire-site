(async function(){
  document.getElementById("year").textContent = new Date().getFullYear();
  const updated = document.getElementById("rmUpdated");
  const host = document.getElementById("rmGrid");

  try{
    const data = await window.sf.fetchJSON("/data/roadmap.json");
    updated.textContent = "Update: " + window.sf.formatTime(data.lastUpdated);

    const stages = Array.isArray(data.stages) ? data.stages : [];
    host.innerHTML = stages.map(s => {
      const st = (s.status || "todo").toLowerCase();
      const dot = st === "done" ? "good" : (st === "doing" ? "warn" : "bad");
      return `
        <article class="card" style="grid-column: span 6;">
          <div class="hd">
            <h2>${window.sf.escapeHtml(s.title)}</h2>
            <span class="pill"><span class="dot ${dot}"></span><b>${st.toUpperCase()}</b></span>
          </div>
          <div class="bd">
            <div class="small">${window.sf.escapeHtml(s.desc || "")}</div>
          </div>
        </article>
      `;
    }).join("");
  }catch(e){
    console.warn(e);
    updated.textContent = "Update: —";
    host.innerHTML = `<div class="small">Konnte Roadmap nicht laden.</div>`;
  }
})();
