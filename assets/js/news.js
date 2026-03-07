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

        ${post.tags && post.tags.length
