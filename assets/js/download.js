(async function () {
  const byId = (id) => document.getElementById(id);

  const dlVersion = byId("dlVersion");
  const dlBuild = byId("dlBuild");
  const dlButton = byId("dlButton");
  const patchList = byId("patchList");

  try {
    const res = await fetch("data/downloads.json", { cache: "no-store" });
    const data = await res.json();

    // Header
    dlVersion.textContent = data.current.version || "-";
    dlBuild.textContent = data.current.build || "-";

    // Download button
    dlButton.href = data.current.url || "#";
    dlButton.textContent = data.current.buttonText || "Launcher herunterladen";

    // Patchnotes
    const patches = (data.patches || []);
    if (!patches.length) {
      patchList.textContent = "Noch keine Patchnotes vorhanden.";
      return;
    }

    patchList.innerHTML = patches.map(p => {
      const items = (p.items || []).map(i => `<li>${escapeHtml(i)}</li>`).join("");
      return `
        <article class="sf-patch">
          <div class="sf-patch-head">
            <div class="sf-patch-title">${escapeHtml(p.title || "Patch")}</div>
            <div class="sf-patch-meta">${escapeHtml(p.date || "")} • ${escapeHtml(p.version || "")}</div>
          </div>
          <ul class="sf-patch-items">${items}</ul>
        </article>
      `;
    }).join("");

  } catch (e) {
    dlVersion.textContent = "-";
    dlBuild.textContent = "-";
    patchList.textContent = "Fehler beim Laden der Downloads/Patchnotes. Prüfe data/downloads.json";
    console.error(e);
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
