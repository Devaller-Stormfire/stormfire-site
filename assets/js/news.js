(async function () {
  const NEWS_PATH = "/data/news.json";

  const btnReload = document.getElementById("btnReload"); // falls du einen Button hast
  const elCount = document.getElementById("postCount");
  const elUpdate = document.getElementById("lastUpdate");
  const elList = document.getElementById("newsList");

  let timer = null;

  function safeText(x){ return (x ?? "").toString(); }

  function renderNews(data){
    const posts = Array.isArray(data.posts) ? data.posts : [];
    if (elCount) elCount.textContent = `${posts.length} Posts`;
    if (elUpdate) elUpdate.textContent = `Update: ${data.lastUpdated ?? "-"}`;

    if (!elList) return;
    elList.innerHTML = "";

    for (const p of posts) {
      const card = document.createElement("div");
      card.className = "post-card";

      card.innerHTML = `
        <div class="post-head">
          <div class="post-title">${safeText(p.title)}</div>
          <div class="post-meta">${safeText(p.date)} • ${safeText(p.author)} • ${safeText(p.type)}</div>
        </div>
        <div class="post-body">${safeText(p.body)}</div>
      `;

      elList.appendChild(card);
    }
  }

  async function loadNews(){
    try {
      const data = await window.sf.fetchJSON(NEWS_PATH);
      renderNews(data);
    } catch (e) {
      console.warn("News load failed:", e);
      // KEIN Retry-Loop hier! fetchJSON macht Backoff + Cache selbst.
    }
  }

  // 1) Initial laden
  await loadNews();

  // 2) Refresh maximal alle 60s – und nur wenn Tab sichtbar
  timer = setInterval(() => {
    if (document.visibilityState === "visible") loadNews();
  }, 60_000);

  // 3) Manuelles Neu laden
  if (btnReload) {
    btnReload.addEventListener("click", () => loadNews());
  }

  // 4) Wenn Tab wieder sichtbar wird: einmal laden
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") loadNews();
  });
})();
