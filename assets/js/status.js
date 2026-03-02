// status.js — renders /data/status.json onto status.html

(async function () {
  const $ = (id) => document.getElementById(id);

  function setBadge(state, text) {
    const dot = $("statusDot");
    const label = $("statusText");

    dot.classList.remove("good", "warn", "bad");
    if (state === "online") dot.classList.add("good");
    else if (state === "maintenance") dot.classList.add("warn");
    else dot.classList.add("bad");

    label.textContent = text;
  }

  try {
    const data = await window.sf.fetchJSON("/data/status.json");

    // Badge state logic
    if (data.status === "online") setBadge("online", "ONLINE");
    else if (data.status === "maintenance") setBadge("maintenance", "MAINTENANCE");
    else setBadge("offline", "OFFLINE");

    $("lastUpdated").textContent = "Letztes Update: " + window.sf.formatTime(data.lastUpdated);

    $("serverName").textContent = data.server?.name || "—";
    $("realmName").textContent = data.realm?.name || "—";
    $("region").textContent = data.server?.region || "—";
    $("mode").textContent = data.realm?.type || "—";

    $("playersOnline").textContent = window.sf.formatNumber(data.playersOnline);
    $("capacity").textContent = window.sf.formatNumber(data.capacity);

    const f1 = data.factions?.[0];
    const f2 = data.factions?.[1];

    $("faction1").textContent = f1?.name || "—";
    $("faction2").textContent = f2?.name || "—";

    $("faction1Sub").textContent = f1 ? `${window.sf.formatNumber(f1.players)} Spieler • ${f1.percent}%` : "—";
    $("faction2Sub").textContent = f2 ? `${window.sf.formatNumber(f2.players)} Spieler • ${f2.percent}%` : "—";
  } catch (err) {
    console.error(err);
    setBadge("offline", "DATENFEHLER");
    $("lastUpdated").textContent = "Konnte /data/status.json nicht laden.";
  }
})();
