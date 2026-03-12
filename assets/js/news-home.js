(async function () {
  const container = document.getElementById("homeNewsContainer");
  if (!container) return;

  try {
    const res = await fetch("./data/news.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const posts = Array.isArray(data.posts) ? data.posts : [];

    posts
      .sort((a, b) => new Date(b.ts) - new Date(a.ts))
      .slice(0, 3)
      .forEach((post) => {
        const card = document.createElement("div");
        card.className = "postCard";

        const shortBody =
          String(post.body || "").replace(/\n+/g, " ").trim().slice(0, 260) +
          (String(post.body || "").length > 260 ? "..." : "");

        card.innerHTML = `
          <div class="meta">${post.date} • ${post.type} • ${post.author}</div>
          <h2>${post.title}</h2>
          <p>${shortBody}</p>
          <div class="tags">
            ${(post.tags || []).map(tag => `<span class="tag">${tag}</span>`).join("")}
          </div>
        `;

        container.appendChild(card);
      });

    if (!posts.length) {
      container.innerHTML = `
        <div class="postCard">
          <h2>Noch keine Devlogs</h2>
          <p>Hier erscheinen später automatisch die neuesten Entwicklungsupdates.</p>
        </div>
      `;
    }
  } catch (err) {
    console.error("[home-news.js]", err);
    container.innerHTML = `
      <div class="postCard">
        <h2>Fehler beim Laden der Devlogs</h2>
        <p>Die neuesten Entwicklungsupdates konnten gerade nicht geladen werden.</p>
      </div>
    `;
  }
})();
