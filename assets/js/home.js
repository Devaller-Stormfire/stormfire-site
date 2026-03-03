(async function(){
  document.getElementById("year").textContent = new Date().getFullYear();

  const $ = (id) => document.getElementById(id);

  // Status snapshot
  try{
    const s = await window.sf.fetchJSON("/data/status.json");
    $("homeStatusUpdated").textContent = "Update: " + window.sf.formatTime(s.lastUpdated);
    $("homeRealm").textContent = s.realm?.name || "—";
    $("homeOnline").textContent = window.sf.formatNumber(s.playersOnline);
    $("homeF1").textContent = s.factions?.[0]?.name || "—";
    $("homeF2").textContent = s.factions?.[1]?.name || "—";
  }catch{
    $("homeStatusUpdated").textContent = "Status nicht verfügbar";
  }

  // Last 3 news
  try{
    const n = await window.sf.fetchJSON("/data/news.json");
    $("homeNewsUpdated").textContent = "Update: " + (n.updated_at || "—");

    const posts = Array.isArray(n.posts) ? n.posts.slice() : [];
    posts.sort((a,b)=> String(b?.date ?? "").localeCompare(String(a?.date ?? "")));
    const top3 = posts.slice(0,3);

    if(top3.length === 0){
      $("homeNewsList").textContent = "Noch keine Posts.";
      return;
    }

    $("homeNewsList").innerHTML = top3.map(p => {
      const title = window.sf.escapeHtml(p.title || "Ohne Titel");
      const meta = window.sf.escapeHtml(`${p.date || ""}${p.author ? " • " + p.author : ""} • ${(p.type||"news").toUpperCase()}`);
      const preview = window.sf.escapeHtml((p.body || "").slice(0, 120)) + ((p.body||"").length > 120 ? "…" : "");
      return `<div style="margin-bottom:12px;">
        <div style="font-weight:900;">${title}</div>
        <div class="small">${meta}</div>
        <div style="margin-top:6px;">${preview}</div>
      </div>`;
    }).join("");
  }catch{
    $("homeNewsUpdated").textContent = "News nicht verfügbar";
    $("homeNewsList").textContent = "Konnte News nicht laden.";
  }
})();
