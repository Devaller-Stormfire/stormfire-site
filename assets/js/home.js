// /assets/js/home.js — Last 3 News teaser (stable sort)
(async function(){
  const wrap = document.getElementById("homeNews");
  const updated = document.getElementById("homeUpdated");
  if(!wrap || !updated || !window.sf?.fetchJSON) return;

  function toTime(v){
    if(!v) return 0;
    const t = Date.parse(String(v));
    return Number.isFinite(t) ? t : 0;
  }

  function cmpDesc(a,b){
    const ta = toTime(a?.ts || a?.date);
    const tb = toTime(b?.ts || b?.date);
    if(tb !== ta) return tb - ta;

    const ida = String(a?.id ?? "");
    const idb = String(b?.id ?? "");
    if(idb !== ida) return idb.localeCompare(ida);

    return (a?._i ?? 0) - (b?._i ?? 0);
  }

  function postCard(p){
    const title = window.sf.escapeHtml(p?.title || "Ohne Titel");
    const date = window.sf.escapeHtml(p?.date || "");
    const type = window.sf.escapeHtml(String(p?.type || "news").toUpperCase());
    const rawBody = String(p?.body || "");
    const body = window.sf.escapeHtml(rawBody).slice(0, 280) + (rawBody.length > 280 ? "…" : "");

    return `
      <article class="card" style="grid-column: span 12;">
        <div class="hd">
          <h2>${title}</h2>
          <span class="small">${date} • ${type}</span>
        </div>
        <div class="small" style="white-space:pre-wrap; line-height:1.65;">${body}</div>
      </article>
    `;
  }

  try{
    const data = await window.sf.fetchJSON("/data/news.json");
    updated.textContent = data?.updated_at ? ("Update: " + window.sf.formatTime(data.updated_at)) : "Update: —";

    const posts = Array.isArray(data?.posts) ? data.posts.slice() : [];
    for(let i=0;i<posts.length;i++) posts[i]._i = i;
    posts.sort(cmpDesc);

    const last3 = posts.slice(0,3);

    if(!last3.length){
      wrap.innerHTML = `<div class="small">Noch keine Posts.</div>`;
      return;
    }

    wrap.innerHTML = last3.map(postCard).join("") + `
      <div style="margin-top:10px;">
        <a class="navbtn" href="/news.html">→ Alle News öffnen</a>
      </div>
    `;
  }catch(e){
    updated.textContent = "Update: —";
    wrap.innerHTML = `<div class="small">News konnten gerade nicht geladen werden.</div>`;
  }
})();