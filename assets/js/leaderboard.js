// leaderboard.js — renders /data/leaderboard.json onto leaderboard.html

(async function () {
  const $ = (id) => document.getElementById(id);

  function fillTable(tableId, rows, cols) {
    const tbody = $(tableId).querySelector("tbody");
    tbody.innerHTML = "";

    rows.slice(0, 5).forEach((r, i) => {
      const tr = document.createElement("tr");

      const tdRank = document.createElement("td");
      tdRank.className = "rank";
      tdRank.textContent = String(i + 1);
      tr.appendChild(tdRank);

      for (const c of cols) {
        const td = document.createElement("td");
        td.textContent = r[c] ?? "—";
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    });

    if (!rows || rows.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = cols.length + 1;
      td.className = "small";
      td.textContent = "Keine Daten.";
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
  }

  try {
    const data = await window.sf.fetchJSON("/data/leaderboard.json");
    $("lbUpdated").textContent = "Letztes Update: " + window.sf.formatTime(data.lastUpdated);

    // PvP
    fillTable("tblPvp", data.pvpTop5 || [], ["name", "faction", "rating"]);

    // Damage
    const dmg = (data.mostDamageTop5 || []).map(x => ({
      ...x,
      damage: window.sf.formatNumber(x.damage)
    }));
    fillTable("tblDmg", dmg, ["name", "class", "damage"]);

    // Gold
    const gold = (data.mostGoldTop5 || []).map(x => ({
      ...x,
      gold: window.sf.formatNumber(x.gold)
    }));
    fillTable("tblGold", gold, ["name", "realm", "gold"]);

    // Playtime
    const play = (data.mostPlaytimeTop5 || []).map(x => ({
      ...x,
      hours: window.sf.formatNumber(x.hours)
    }));
    fillTable("tblPlaytime", play, ["name", "level", "hours"]);
  } catch (err) {
    console.error(err);
    $("lbUpdated").textContent = "Konnte /data/leaderboard.json nicht laden.";
  }
})();
