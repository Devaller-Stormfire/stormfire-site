(function(){
  document.getElementById("year").textContent = new Date().getFullYear();

  const user = document.getElementById("user");
  const pass = document.getElementById("pass");
  const msg  = document.getElementById("msg");

  function setMsg(t){ msg.textContent = t; }

  function getSession(){
    try{ return JSON.parse(localStorage.getItem("sf_session")||"null"); }catch{ return null; }
  }
  function setSession(u){
    localStorage.setItem("sf_session", JSON.stringify({ user:u, ts: Date.now() }));
  }
  function clearSession(){
    localStorage.removeItem("sf_session");
  }

  const s = getSession();
  setMsg(s ? `Eingeloggt als: ${s.user}` : "Nicht eingeloggt.");

  document.getElementById("btnLogin").addEventListener("click", () => {
    const u = (user.value || "").trim();
    if(!u){ setMsg("Bitte Username eingeben."); return; }
    // Demo: Passwort wird nicht geprüft (Backend kommt später)
    setSession(u);
    setMsg(`Eingeloggt als: ${u}`);
  });

  document.getElementById("btnLogout").addEventListener("click", () => {
    clearSession();
    setMsg("Logout. Nicht eingeloggt.");
  });
})();
