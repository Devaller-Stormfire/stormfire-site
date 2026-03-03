// /assets/js/news.js
// News-Seite: lädt /data/news.json, filtert, rendert
// Fix: stabile Sortierung (Datum/Zeit + id) damit "News 3" wirklich oben steht.

(async function () {
  const updated = document.getElementById("newsUpdated");
  const count = document.getElementById("newsCount");
  const list = document.getElementById("newsList");
  const q = document.getElementById("q");
  const type = document.getElementById("type");
  const reload = document.getElementById("reload");

  // Falls die Seite andere IDs hat oder Elemente fehlen → nicht crashen
  if (!updated || !count || !list || !q || !type || !reload || !window.sf?.fetchJSON) return;

  let all = [];
  let lastManual = 0;

  function toTime(v) {
    // akzeptiert "2026-03-03" oder ISO "2026-03-03T16:00:00+01:00"
    if (!v) return 0;
    const t = Date.parse(String(v));
    return Number.isFinite(t) ? t : 0;
  }

  function cmpDesc(a, b) {
    // 1) date (oder ts) absteigend
    const ta = toTime(a?.ts || a?.date);
    const tb = toTime(b?.ts || b?.date);
    if (tb !== ta) return tb - ta;

    // 2) id absteigend (devlog-003 > devlog-002 etc.)
    const ida = String(a?.id ?? "");
    const idb = String(b?.id ?? "");
    if (idb !== ida) return idb.localeCompare(ida);

    // 3) fallback: Originalindex (stabil)
    return (a?._i ?? 0) - (b?._i ?? 0);
  }

  function render() {
    const query = String(q.value || "").trim().toLowerCase();
    const t = String(type.value || "all").toLowerCase();

    let filtered = all;

    if (t !== "all") {
      filtered = filtered.filter(p => String(p?.type || "").toLowerCase() === t);
    }

    if (query) {
      filtered = filtered.filter(p => {
        const title = String(p?.title || "").toLowerCase();
        const body = String(p?.body || "").toLowerCase();
        const tags = Array.isArray(p?.tags) ? p.tags.join(" ").toLowerCase() : "";
        return title.includes(query) || body.includes(query) || tags.includes(query);
      });
    }

    count.textContent = `${filtered.length} Posts`;

    if (!filtered.length) {
      list.innerHTML = `<div class="small">Keine Treffer.</div>`;
      return;
    }

    list.innerHTML = filtered.map(p => {
      const title = window.sf.escapeHtml(p?.title || "Ohne Titel");
      const date = window.sf.escapeHtml(p?.date || "");
      const author = window.sf.escapeHtml(p?.author || "");
      const typeUp = window.sf.escapeHtml(String(p?.type || "news").toUpperCase());
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

          <div class="small" style="margin-top:10px; white-space:pre-wrap;">${body}</div>
        </article>
      `;
    }).join("");
  }

  async function load() {
    list.textContent = "Lädt…";

    try {
      const data = await window.sf.fetchJSON("/data/news.json");

      updated.textContent = data?.updated_at
        ? ("Update: " + window.sf.formatTime(data.updated_at))
        : "Update: —";

      const posts = Array.isArray(data?.posts) ? data.posts.slice() : [];

      // stabiler index für fallback
      for (let i = 0; i < posts.length; i++) posts[i]._i = i;

      posts.sort(cmpDesc);
      all = posts;

      render();
    } catch (e) {
      updated.textContent = "Update: —";
      list.innerHTML = `<div class="small">Konnte News gerade nicht laden.</div>`;
    }
  }

  q.addEventListener("input", render);
  type.addEventListener("change", render);

  reload.addEventListener("click", async () => {
    const t = Date.now();
    if (t - lastManual < 5000) return; // anti-spam
    lastManual = t;
    await load();
  });

  await load();
})();