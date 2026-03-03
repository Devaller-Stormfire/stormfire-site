(async function () {

  document.getElementById("year").textContent = new Date().getFullYear();

  const coreContainer = document.getElementById("coreTeam");
  const gmContainer = document.getElementById("gmTeam");

  function memberCard(member){
    return `
      <div class="box">
        <div class="label">${window.sf.escapeHtml(member.role)}</div>
        <div class="value glow">${window.sf.escapeHtml(member.name)}</div>
        <div class="small">${window.sf.escapeHtml(member.tag)}</div>
      </div>
    `;
  }

  try{
    const data = await window.sf.fetchJSON("/data/team.json");

    coreContainer.innerHTML = data.core.map(memberCard).join("");
    gmContainer.innerHTML = data.gm.map(memberCard).join("");

  }catch(e){
    console.warn(e);
    coreContainer.innerHTML = `<div class="small">Team konnte nicht geladen werden.</div>`;
    gmContainer.innerHTML = `<div class="small">GM Team konnte nicht geladen werden.</div>`;
  }

})();