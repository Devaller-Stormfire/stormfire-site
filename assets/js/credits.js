(async function () {
  const alphaWrap = document.getElementById("alphaTester");
  const betaWrap = document.getElementById("betaTester");
  const updated = document.getElementById("creditsUpdated");

  if (!alphaWrap || !betaWrap || !window.sf?.fetchJSON) return;

  try {
    const data = await window.sf.fetchJSON("/data/credits.json");

    updated.textContent = data?.updated_at
      ? "Update: " + window.sf.formatTime(data.updated_at)
      : "Update: —";

    const alpha = Array.isArray(data.alpha) ? data.alpha : [];
    const beta = Array.isArray(data.beta) ? data.beta : [];

    alphaWrap.innerHTML = alpha.map(n =>
      `<span class="badgeTag alpha">${window.sf.escapeHtml(n)}</span>`
    ).join("");

    betaWrap.innerHTML = beta.map(n =>
      `<span class="badgeTag beta">${window.sf.escapeHtml(n)}</span>`
    ).join("");

  } catch (e) {
    alphaWrap.innerHTML = `<span class="small">Lädt…</span>`;
    betaWrap.innerHTML = `<span class="small">Lädt…</span>`;
  }
})();