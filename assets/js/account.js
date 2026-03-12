(function () {
  const gate = document.getElementById("accountGate");
  const content = document.getElementById("accountContent");
  const nameEl = document.getElementById("accountName");
  const killsEl = document.getElementById("accountKills");
  const deathsEl = document.getElementById("accountDeaths");
  const levelEl = document.getElementById("accountLevel");
  const realmEl = document.getElementById("accountRealm");

  if (!gate || !content) return;

  const isLoggedIn = localStorage.getItem("stormfire_logged_in") === "true";

  if (!isLoggedIn) {
    gate.style.display = "block";
    content.style.display = "none";
    return;
  }

  gate.style.display = "none";
  content.style.display = "block";

  if (nameEl) nameEl.textContent = localStorage.getItem("stormfire_account_name") || "Stormfire Spieler";
  if (killsEl) killsEl.textContent = localStorage.getItem("stormfire_kills") || "0";
  if (deathsEl) deathsEl.textContent = localStorage.getItem("stormfire_deaths") || "0";
  if (levelEl) levelEl.textContent = localStorage.getItem("stormfire_level") || "1";
  if (realmEl) realmEl.textContent = localStorage.getItem("stormfire_realm") || "Ewiger Bund";
})();
