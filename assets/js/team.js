(async function () {
  const coreWrap = document.getElementById("coreTeam");
  const gmWrap = document.getElementById("gmTeam");
  const adminCard = document.getElementById("adminCard");
  const adminWrap = document.getElementById("adminTeam");
  const updatedEl = document.getElementById("teamUpdated");

  const isLoggedIn = window.sf.isLoggedIn();

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
      <span class="statusPill">
        <span class="dot ${isOn ? "good" : "bad"}"></span>
        <span>${isOn ? "ONLINE" : "OFFLINE"}</span>
      </span>
    `;
  }

  function memberBox(m){
    const tag = String(m?.tag || "").toUpperCase();
    const showOnline = tag === "GM";
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

  try{
    const data = await window.sf.fetchJSON("/data/team.json");
    updatedEl.textContent = data?.updated_at ? ("Update: " + window.sf.formatTime(data.updated_at)) : "Update: —";

    const core = Array.isArray(data?.core) ? data.core : [];
    const gm = Array.isArray(data?.gm) ? data.gm : [];
    const admin = Array.isArray(data?.admin) ? data.admin : [];

    coreWrap.innerHTML = core.map(memberBox).join("") || `<div class="small">Keine Daten.</div>`;
    gmWrap.innerHTML = gm.map(memberBox).join("") || `<div class="small">Keine Daten.</div>`;

    if(isLoggedIn){
      adminCard.style.display = "";
      adminWrap.innerHTML = admin.map(memberBox).join("") || `<div class="small">Keine Daten.</div>`;
    }else{
      adminCard.style.display = "none";
    }
  }catch(e){
    updatedEl.textContent = "Update: —";
    coreWrap.innerHTML = `<div class="small">Konnte Team nicht laden.</div>`;
    gmWrap.innerHTML = `<div class="small">Konnte GM Team nicht laden.</div>`;
    if(adminCard) adminCard.style.display = "none";
  }
})();