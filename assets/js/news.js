(async function(){
  document.getElementById("year").textContent = new Date().getFullYear();

  const elUpdated = document.getElementById("updatedPill");
  const elCount = document.getElementById("countPill");
  const elGrid = document.getElementById("postsGrid");
  const elSearch = document.getElementById("searchInput");
  const elType = document.getElementById("typeSelect");
  const btnReload = document.getElementById("reloadBtn");

  let allPosts = [];
  let lastManualReload = 0;

  function render(){
    const q = String(elSearch.value ?? "").trim().toLowerCase();
    const type = String(elType.value ?? "all").toLowerCase();

    let filtered = allPosts;

    if(type !== "all"){
      filtered = filtered.filter(p => String(p?.type ?? "").toLowerCase() === type);
    }

    if(q){
      filtered = filtered.filter(p => {
        const title = String(p?.title ?? "").toLowerCase();
        const body = String(p?.body ?? "").toLowerCase();
        const tags = Array.isArray(p?.tags) ? p.tags.join(" ").toLowerCase() : "";
        return title.includes(q) || body.includes(q) || tags.includes(q);
      });
    }

    elCount.textContent = filtered.length + " Posts";

    if(filtered.length === 0){
      elGrid.innerHTML = `<div class="small">Keine Treffer.</div>`;
      return;
    }

    elGrid.innerHTML = filtered.map(p => {
      const title = window.sf.escapeHtml(p?.title ?? "Ohne Titel");
      const date = window.sf.escapeHtml(p?.date ?? "");
      const author = window.sf.escapeHtml(p?.author ?? "");
      const typeUp = window.sf.escapeHtml(String(p?.type ?? "news").toUpperCase());
      const body = window.sf.escapeHtml(p?.body ?? "");
      const tags = Array.isArray(p?.tags) ? p.tags : [];

      const meta = [date, author, typeUp].filter(Boolean).join(" • ");

      const tagHtml = tags.length
        ? `<div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;">
            ${tags.map(t => `<span class="pill"><b>${window.sf.escapeHtml(t)}</b></span>`).join("")}
           </div>`
        : "";

      return `
        <article style="margin-bottom:14px; padding:14px; border:1px solid rgba(255,255,255,0.10); border-radius:16px; background: rgba(0,0,0,0.18);">
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

  async function loadNews(){
    elGrid.textContent = "News werden geladen…";
    try{
      const data = await window.sf.fetchJSON("/data/news.json");
      elUpdated.textContent = data?.updated_at ? ("Update: " + data.updated_at) : "Update: —";

      const posts = Array.isArray(data?.posts) ? data.posts.slice() : [];
      posts.sort((a,b)=> String(b?.date ?? "").localeCompare(String(a?.date ?? "")));

      allPosts = posts;
      render();
    }catch(e){
      console.warn(e);
      elUpdated.textContent = "Update: —";
      elGrid.innerHTML = `<div class="small">Konnte News gerade nicht laden. (Offline-Fallback greift, wenn Cache vorhanden.)</div>`;
    }
  }

  elSearch.addEventListener("input", render);
  elType.addEventListener("change", render);

  btnReload.addEventListener("click", async () => {
    const t = Date.now();
    if(t - lastManualReload < 5000) return; // Anti-Spam
    lastManualReload = t;
    await loadNews();
  });

  await loadNews();

  setInterval(() => { if(document.visibilityState === "visible") loadNews(); }, 60_000);
  document.addEventListener("visibilitychange", () => {
    if(document.visibilityState === "visible") loadNews();
  });
})();