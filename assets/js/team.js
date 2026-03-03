(async function () {
  document.getElementById("year").textContent = new Date().getFullYear();

  const coreWrap = document.getElementById("coreTeam");
  const gmWrap = document.getElementById("gmTeam");
  const adminCard = document.getElementById("adminCard");
  const adminWrap = document.getElementById("adminTeam");
  const updatedEl = document.getElementById("teamUpdated");

  const isLoggedIn = localStorage.getItem("sf_logged_in") === "1";

  function esc(s){ return window.sf.escapeHtml(s); }

  function badgeClass(tag){
    const t = String(tag || "").toUpperCase();
    if (t === "DEV") return "badgeTag dev";
    if (t === "GM") return "badgeTag gm";
    if (t === "ADMIN") return "badgeTag admin";
    return "badgeTag";
  }

  function onlinePill(online){
    const isOn = !!online;
    return `
      <span class="statusPill ${isOn ? "on" : "off"}">
        <span class="dot ${isOn ? "good" : "bad"}"></span>
        <span>${isOn ? "ONLINE" : "OFFLINE"}</span>
      </span>
    `;
  }

  function memberBox(m){
    const tag = String(m?.tag || "").toUpperCase();
    const showOnline = tag === "GM"; // Online-Status nur bei GM
    return `
      <div class="memberBox">
        <div class="memberTop">
          <span class="${badgeClass(tag)}">${esc(tag || "TEAM")}</span>
          ${showOnline ? onlinePill(m?.online) : ""}
        </div>

        <div class="memberName">${esc(m?.name || "—")}</div>
        <div class="memberRole">${esc(m?.role || "")}</div>
      </div>
    `;
  }

  async function load(){
    try{
      const data = await window.sf.fetchJSON("/data/team.json");

      updatedEl.textContent = data?.updated_at ? ("Update: " + window.sf.formatTime(data.updated_at)) : "Update: —";

      const core = Array.isArray(data?.core) ? data.core : [];
      const gm = Array.isArray(data?.gm) ? data.gm : [];
      const admin = Array.isArray(data?.admin) ? data.admin : [];

      coreWrap.innerHTML = core.map(memberBox).join("") || `<div class="small">Keine Daten.</div>`;
      gmWrap.innerHTML = gm.map(memberBox).join("") || `<div class="small">Keine Daten.</div>`;

      // Admin nur wenn eingeloggt
      if(isLoggedIn){
        adminCard.style.display = "";
        adminWrap.innerHTML = admin.map(memberBox).join("") || `<div class="small">Keine Daten.</div>`;
      }else{
        adminCard.style.display = "none";
      }

    }catch(e){
      console.warn(e);
      updatedEl.textContent = "Update: —";
      coreWrap.innerHTML = `<div class="small">Team konnte nicht geladen werden.</div>`;
      gmWrap.innerHTML = `<div class="small">GM Team konnte nicht geladen werden.</div>`;
      adminCard.style.display = "none";
    }
  }

  await load();
})();