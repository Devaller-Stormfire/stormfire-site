(() => {
  const NEWS_JSON_PATH = "./data/news.json";

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(dateString) {
    if (!dateString) return "Unbekannt";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  function renderTags(tags) {
    if (!Array.isArray(tags) || tags.length === 0) return "";
    return `
      <div class="stormfire-devlog-tags">
        ${tags.map(tag => `<span class="stormfire-devlog-tag">${escapeHtml(tag)}</span>`).join("")}
      </div>
    `;
  }

  async function loadAllNews() {
    const listEl = document.getElementById("news-list");
    if (!listEl) return;

    try {
      const response = await fetch(NEWS_JSON_PATH, { cache: "no-store" });
      if (!response.ok) {
        listEl.innerHTML = `
          <article class="stormfire-devlog-card">
            <div class="stormfire-devlog-meta">Fehler</div>
            <h3>News konnten nicht geladen werden</h3>
            <p>Die Datei data/news.json konnte nicht geöffnet werden.</p>
          </article>
        `;
        return;
      }

      const data = await response.json();
      const posts = Array.isArray(data.posts) ? data.posts : [];

      if (posts.length === 0) {
        listEl.innerHTML = `
          <article class="stormfire-devlog-card">
            <div class="stormfire-devlog-meta">Keine Einträge</div>
            <h3>Noch keine Devlogs vorhanden</h3>
            <p>Es wurden aktuell keine News-Einträge gefunden.</p>
          </article>
        `;
        return;
      }

      listEl.innerHTML = posts.map((post) => {
        const type = escapeHtml(post.type || "Devlog");
        const title = escapeHtml(post.title || "Ohne Titel");
        const date = escapeHtml(formatDate(post.date));
        const author = escapeHtml(post.author || "Stormfire Team");
        const body = escapeHtml(post.body || "").replace(/\n/g, "<br><br>");

        return `
          <article class="stormfire-devlog-card">
            <div class="stormfire-devlog-meta">${date} • ${type} • ${author}</div>
            <h3>${title}</h3>
            ${renderTags(post.tags)}
            <p>${body}</p>
          </article>
        `;
      }).join("");
    } catch (error) {
      console.error("News Fehler:", error);
      listEl.innerHTML = `
        <article class="stormfire-devlog-card">
          <div class="stormfire-devlog-meta">Fehler</div>
          <h3>News konnten nicht geladen werden</h3>
          <p>Beim Laden der Devlogs ist ein Fehler aufgetreten.</p>
        </article>
      `;
    }
  }

  document.addEventListener("DOMContentLoaded", loadAllNews);
})();
