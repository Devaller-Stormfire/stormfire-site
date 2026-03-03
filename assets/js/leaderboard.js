(async function(){
  const grid = document.getElementById("lbGrid");
  const updated = document.getElementById("lbUpdated");

  function table(title, rows, cols){
    const head = cols.map(c => `<th>${window.sf.escapeHtml(c)}</th>`).join("");
    const body = rows.map((r,i)=>`
      <tr>
        <td class="rank">${i+1}</td>
        <td>${window.sf.escapeHtml(r.name||"—")}</td>
        <td>${window.sf.escapeHtml(r.realm||"—")}</td>
        <td>${window.sf.escapeHtml(String(r.value ?? "—"))}</td>
      </tr>
    `).join("");

    return `
      <article class="card" style="grid-column: span 6;">
        <div class="hd"><h2>${window.sf.escapeHtml(title)}</h2><span class="small">Top 5</span></div>
        <table class="table">
          <thead><tr><th>#</th>${head}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </article>
    `;
  }

  try{
    const data = await window.sf.fetchJSON("/data/leaderboard.json");
    updated.textContent = data?.updated_at ? ("Update: " + window.sf.formatTime(data.updated_at)) : "Update: —";

    const pvp = Array.isArray(data?.pvpTop5) ? data.pvpTop5 : [];
    const dmg = Array.isArray(data?.mostDamageTop5) ? data.mostDamageTop5 : [];
    const gold = Array.isArray(data?.mostGoldTop5) ? data.mostGoldTop5 : [];
    const play = Array.isArray(data?.mostPlaytimeTop5) ? data.mostPlaytimeTop5 : [];

    grid.innerHTML =
      table("Top 5 PvP", pvp, ["Name","Realm","Rating"]) +
      table("Most Damage", dmg, ["Name","Realm","Damage"]) +
      table("Most Gold", gold, ["Name","Realm","Gold"]) +
      table("Most Playtime", play, ["Name","Realm","Hours"]);
  }catch{
    updated.textContent = "Update: —";
    grid.innerHTML = `
      <article class="card" style="grid-column: span 12;">
        <div class="hd"><h2>Leaderboard nicht verfügbar</h2></div>
        <div class="small">Konnte <code>/data/leaderboard.json</code> nicht laden.</div>
      </article>
    `;
  }
})();