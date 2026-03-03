(async function(){
  const wrap = document.getElementById("homeNews");
  const updated = document.getElementById("homeUpdated");

  function postCard(p){
    const title = window.sf.escapeHtml(p?.title || "Ohne Titel");
    const date = window.sf.escapeHtml(p?.date || "");
    const type = window.sf.escapeHtml(String(p?.type || "news").toUpperCase());
    const body = window.sf.escapeHtml(p?.body || "").slice(0, 280) + (String(p?.body||"").length > 280 ? "…" : "");
    return `
      <div style="border:1px solid rgba(255,255,255,0.10); border-radius:16px; background:rgba(0,0,0,0.16); padding:12px; margin-top:10px;">
        <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap;">
          <div style="font-weight:900;">${title}</div>
          <div class="small">${date} • ${type}</div>
        </div>
        <div class="small" style="margin-top:8px; white-space:pre-wrap;">${body}</div>
      </div>
    `;
  }

  try{
    const data = await window.sf.fetchJSON("/data/news.json");
    updated.textContent = data?.updated_at ? ("Update: " + window.sf.formatTime(data.updated_at)) : "Update: —";

    const posts = Array.isArray(data?.posts) ? data.posts.slice() : [];
    posts.sort((a,b)=> String(b?.date ?? "").localeCompare(String(a?.date ?? "")));
    const last3 = posts.slice(0,3);

    if(!last3.length){
      wrap.innerHTML = `<div class="small">Noch keine Posts.</div>`;
      return;
    }

    wrap.innerHTML = last3.map(postCard).join("") + `
      <div style="margin-top:12px;">
        <a class="navbtn" href="/news.html">→ Alle News öffnen</a>
      </div>
    `;
  }catch(e){
    updated.textContent = "Update: —";
    wrap.innerHTML = `<div class="small">News konnten gerade nicht geladen werden.</div>`;
  }
})();