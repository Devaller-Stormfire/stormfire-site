(async function(){
  document.getElementById("year").textContent = new Date().getFullYear();

  const accUser = document.getElementById("accUser");
  const charList = document.getElementById("charList");

  function getSession(){
    try{ return JSON.parse(localStorage.getItem("sf_session")||"null"); }catch{ return null; }
  }

  const s = getSession();
  accUser.textContent = s ? s.user : "Nicht eingeloggt";

  if(!s){
    charList.innerHTML = `Bitte <a href="/login.html">einloggen</a>, um deine Charaktere zu sehen.`;
    return;
  }

  // Demo-Accounts (später API)
  try{
    const data = await window.sf.fetchJSON("/data/accounts_demo.json");
    const acc = (data.accounts || []).find(a => (a.username||"").toLowerCase() === s.user.toLowerCase());
    if(!acc){
      charList.textContent = "Kein Demo-Account gefunden. (Teste: Devaller)";
      return;
    }

    const chars = Array.isArray(acc.characters) ? acc.characters : [];
    if(chars.length === 0){
      charList.textContent = "Noch keine Charaktere.";
      return;
    }

    charList.innerHTML = chars.map(c => {
      return `<div style="margin-bottom:10px;">
        <div style="font-weight:900;">${window.sf.escapeHtml(c.name)} (Lv ${window.sf.escapeHtml(c.level)})</div>
        <div class="small">${window.sf.escapeHtml(c.faction)} • ${window.sf.escapeHtml(c.race)} • ${window.sf.escapeHtml(c.class)}</div>
      </div>`;
    }).join("");
  }catch(e){
    console.warn(e);
    charList.textContent = "Konnte Demo-Charaktere nicht laden.";
  }
})();
