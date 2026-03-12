(async function () {
  const container = document.getElementById("newsContainer");
  if (!container) return;

  try {
    const res = await fetch("./data/news.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const posts = Array.isArray(data.posts) ? data.posts : [];

    posts
      .sort((a, b) => new Date(b.ts) - new Date(a.ts))
      .forEach((post) => {
        const card = document.createElement("div");
        card.className = "postCard";

        card.innerHTML = `
          <div class="meta">${post.date} • ${post.type} • ${post.author}</div>
          <h2>${post.title}</h2>
          <p style="white-space:pre-line;">${post.body}</p>
          <div class="tags">
            ${(post.tags || []).map(tag => `<span class="tag">${tag}</span>`).join("")}
          </div>
        `;

        container.appendChild(card);
      });

    if (!posts.length) {
      container.innerHTML = `
        <div class="postCard">
          <h2>Noch keine News</h2>
          <p>Hier erscheinen später automatisch neue Devlogs und Updates.</p>
        </div>
      `;
    }
  } catch (e) {
    console.error("[news.js]", e);
    container.innerHTML = `
      <div class="postCard">
        <h2>Fehler beim Laden der News</h2>
        <p>Die Devlogs konnten nicht geladen werden.</p>
      </div>
    `;
  }
})();