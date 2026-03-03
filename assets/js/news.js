(async function(){
  const updated = document.getElementById("newsUpdated");
  const count = document.getElementById("newsCount");
  const list = document.getElementById("newsList");
  const q = document.getElementById("q");
  const type = document.getElementById("type");
  const reload = document.getElementById("reload");

  let all = [];
  let lastManual = 0;

  function render(){
    const query = String(q.value||"").trim().toLowerCase();
    const t = String(type.value||"all").toLowerCase();

    let filtered = all;

    if(t !== "all"){
      filtered = filtered.filter(p => String(p?.type||"").toLowerCase() === t);
    }
    if(query){
      filtered = filtered.filter(p => {
        const title = String(p?.title||"").toLowerCase();
        const body = String(p?.body||"").toLowerCase();
        const tags = Array.isArray(p?.tags) ? p.tags.join(" ").toLowerCase() : "";
        return title.includes(query) || body.includes(query) || tags.includes(query);
      });
    }

    count.textContent = `${filtered.length} Posts`;

    if(!filtered.length){
      list.innerHTML = `<div class="small">Keine Treffer.</div>`;
      return;
    }

    list.innerHTML = filtered.map(p => {
      const title = window.sf.escapeHtml(p?.title || "Ohne Titel");
      const date = window.sf.escapeHtml(p?.date || "");
      const author = window.sf.escapeHtml(p?.author || "");
      const typeUp = window.sf.escapeHtml(String(p?.type||"news").toUpperCase());
      const body = window.sf.escapeHtml(p?.body || "");
      const tags = Array.isArray(p?.tags) ? p.tags : [];

      const meta = [date, author, typeUp].filter(Boolean).join(" • ");
      const tagHtml = tags.length
        ? `<div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;">
            ${tags.map(t => `<span class="pill"><b>${window.sf.escapeHtml(t)}</b></span>`).join("")}
           </div>`
        : "";

      return `
        <article style="margin-top:12px; padding:14px; border:1px solid rgba(255,255,255,0.10); border-radius:16px; background: rgba(0,0,0,0.16);">
          <div style="display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap;">
            <div style="font-weight:900; font-size:16px;">${title}</div>
            <div class="small" style="white-space:nowrap;">${meta}</div>
          </div>
          ${tagHtml}
          <div style="margin-top:10px; white-space:pre-wrap; line-height:1.65;">${body}</div>
        </article>
      `;
    }).join("");
  }

  async function load(){
    list.textContent = "Lädt…";
    try{
      const data = await window.sf.fetchJSON("/data/news.json");
      updated.textContent = data?.updated_at ? ("Update: " + window.sf.formatTime(data.updated_at)) : "Update: —";
      const posts = Array.isArray(data?.posts) ? data.posts.slice() : [];
      posts.sort((a,b)=> String(b?.date ?? "").localeCompare(String(a?.date ?? "")));
      all = posts;
      render();
    }catch(e){
      updated.textContent = "Update: —";
      list.innerHTML = `<div class="small">Konnte News gerade nicht laden.</div>`;
    }
  }

  q.addEventListener("input", render);
  type.addEventListener("change", render);

  reload.addEventListener("click", async () => {
    const t = Date.now();
    if(t - lastManual < 5000) return; // anti spam
    lastManual = t;
    await load();
  });

  await load();
})();