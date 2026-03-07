(() => {
  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function fetchJSON(path) {
    const response = await fetch(path, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while loading ${path}`);
    }

    return await response.json();
  }

  function formatDate(dateString) {
    if (!dateString) return "Unbekanntes Datum";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  function formatBody(text) {
    return escapeHtml(text).replace(/\n/g, "<br>");
  }

  function renderTags(tags) {
    if (!Array.isArray(tags) || tags.length === 0) return "";
    return tags
      .map(tag => `<span class="badge">${escapeHtml(tag)}</span>`)
      .join(" ");
  }

  function renderPost(post) {
    return `
      <article class="news-item">
        <div class="news-meta">
          ${escapeHtml(post.type || "Devlog")} • ${formatDate(post.date)}
          ${post.author ? `• ${escapeHtml(post.author)}` : ""}
        </div>

        <h3>${escapeHtml(post.title || "Ohne Titel")}</h3>

        ${post.tags && post.tags.length ? `<p style="margin-bottom:10px;">${renderTags(post.tags)}</p>` : ""}

        <p>${formatBody(post.body || "")}</p>
      </article>
    `;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  async function loadNews() {
    const listEl = document.getElementById("news-list");
    const countEl = document.getElementById("news-count");
    const updatedEl = document.getElementById("news-updated");

    if (!listEl) return;

    try {
      const data = await fetchJSON("./data/news.json");

      const posts = Array.isArray(data.posts) ? data.posts : [];

      if (countEl) {
        countEl.textContent = String(posts.length);
      }

      if (updatedEl) {
        updatedEl.textContent = data.updated_at
          ? formatDate(data.updated_at)
          : "Unbekannt";
      }

      if (posts.length === 0) {
        listEl.innerHTML = `
          <div class="news-item">
            <div class="news-meta">Keine Einträge</div>
            <h3>Noch keine News vorhanden</h3>
            <p>Aktuell sind noch keine News oder Devlogs eingetragen.</p>
          </div>
        `;
        return;
      }

      listEl.innerHTML = posts.map(renderPost).join("");
    } catch (error) {
      console.error("Fehler beim Laden der News:", error);

      if (countEl) countEl.textContent = "0";
      if (updatedEl) updatedEl.textContent = "Fehler";

      listEl.innerHTML = `
        <div class="news-item">
          <div class="news-meta">Fehler</div>
          <h3>News konnten nicht geladen werden</h3>
          <p>
            Die Datei <strong>data/news.json</strong> konnte nicht geladen werden.
            Prüfe Pfad, JSON-Inhalt und GitHub Pages Cache.
          </p>
        </div>
      `;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadNews();

    // Optional: gleiche Platzhalter wie auf den anderen Seiten
    setText("login-status", "In Entwicklung");
    setText("realm-status", "In Entwicklung");
    setText("player-count", "0");

    const visitEl = document.getElementById("visit-count");
    if (visitEl) {
      let visits = localStorage.getItem("stormfire_visits");
      visits = visits ? parseInt(visits, 10) + 1 : 1;
      localStorage.setItem("stormfire_visits", visits);
      visitEl.textContent = String(visits);
    }
  });
})();
