document.getElementById("year").textContent = new Date().getFullYear();

const elUpdated = document.getElementById("updatedPill");
const elCount = document.getElementById("countPill");
const elGrid = document.getElementById("postsGrid");
const elSearch = document.getElementById("searchInput");
const elType = document.getElementById("typeSelect");
const btnReload = document.getElementById("reloadBtn");

let allPosts = [];
let lastManualReload = 0;

function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function render(){
  const q = String(elSearch.value ?? "").trim().toLowerCase();
  const type = String(elType.value ?? "all").toLowerCase();

  let filtered = allPosts;

  if (type !== "all") {
    filtered = filtered.filter(p => String(p?.type ?? "").toLowerCase() === type);
  }

  if (q) {
    filtered = filtered.filter(p => {
      const title = String(p?.title ?? "").toLowerCase();
      const body  = String(p?.body ?? "").toLowerCase();
      const tags  = Array.isArray(p?.tags) ? p.tags.join(" ").toLowerCase() : "";
      return title.includes(q) || body.includes(q) || tags.includes(q);
    });
  }

  elCount.textContent = filtered.length + " Posts";

  if (filtered.length === 0) {
    elGrid.innerHTML = `<div class="small">Keine Treffer.</div>`;
    return;
  }

  elGrid.innerHTML = filtered.map(p => {
    const title = escapeHtml(p?.title ?? "Ohne Titel");
    const date = escapeHtml(p?.date ?? "");
    const author = escapeHtml(p?.author ?? "");
    const typeUp = escapeHtml(String(p?.type ?? "news").toUpperCase());
    const body = escapeHtml(p?.body ?? "");
    const tags = Array.isArray(p?.tags) ? p.tags : [];

    const metaParts = [];
    if (date) metaParts.push(date);
    if (author) metaParts.push(author);
    metaParts.push(typeUp);

    return `
      <article style="margin-bottom:14px; padding:14px; border:1px solid rgba(255,255,255,0.10); border-radius:16px; background: rgba(0,0,0,0.18);">
        <div style="display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap;">
          <div style="font-weight:900; font-size:16px;">${title}</div>
          <div class="small" style="white-space:nowrap;">${escapeHtml(metaParts.join(" • "))}</div>
        </div>

        ${tags.length ? `
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;">
            ${tags.map(t => `<span class="pill"><b>${escapeHtml(t)}</b></span>`).join("")}
          </div>
        ` : ""}

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
    posts.sort((a,b) => String(b?.date ?? "").localeCompare(String(a?.date ?? "")));

    allPosts = posts;
    render();
  }catch(e){
    console.warn(e);
    elUpdated.textContent = "Update: —";
    elGrid.innerHTML = `<div class="small">Konnte News gerade nicht laden. Bitte später erneut versuchen.</div>`;
  }
}

// Events
elSearch.addEventListener("input", render);
elType.addEventListener("change", render);

btnReload.addEventListener("click", async () => {
  // Anti-Spam: Button max alle 5 Sekunden
  const t = Date.now();
  if (t - lastManualReload < 5000) return;
  lastManualReload = t;
  await loadNews();
});

// Initial
loadNews();

// Optional: Auto-Refresh max alle 60s und nur wenn Tab sichtbar
setInterval(() => {
  if (document.visibilityState === "visible") loadNews();
}, 60_000);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") loadNews();
});
