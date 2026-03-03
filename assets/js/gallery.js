(async function(){
  const upd = document.getElementById("galUpdated");
  const cnt = document.getElementById("galCount");
  const grid = document.getElementById("galGrid");
  const loginState = document.getElementById("loginState");
  const fakeLoginBtn = document.getElementById("fakeLoginBtn");

  function setLoginLabel(){
    loginState.textContent = window.sf.isLoggedIn() ? "eingeloggt" : "offline";
  }
  setLoginLabel();

  fakeLoginBtn.addEventListener("click", () => {
    if(window.sf.isLoggedIn()) localStorage.removeItem("sf_logged_in");
    else localStorage.setItem("sf_logged_in","1");
    setLoginLabel();
    location.reload();
  });

  function itemCard(it){
    const title = window.sf.escapeHtml(it?.title || "Upload");
    const by = window.sf.escapeHtml(it?.by || "—");
    const date = window.sf.escapeHtml(it?.date || "");
    const img = window.sf.escapeHtml(it?.img || "");
    const note = window.sf.escapeHtml(it?.note || "");

    // images must be hosted in /assets/img/...
    const imgTag = img ? `<img src="${img}" alt="${title}" style="width:100%; border-radius:14px; border:1px solid rgba(255,255,255,0.10);" />` : "";

    return `
      <div style="border:1px solid rgba(255,255,255,0.10); border-radius:16px; background:rgba(0,0,0,0.16); padding:12px; margin-top:10px;">
        <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap;">
          <div style="font-weight:900;">${title}</div>
          <div class="small">${date} • ${by}</div>
        </div>
        <div style="margin-top:10px;">${imgTag}</div>
        <div class="small" style="margin-top:10px; white-space:pre-wrap;">${note}</div>
      </div>
    `;
  }

  try{
    const data = await window.sf.fetchJSON("/data/gallery.json");
    upd.textContent = data?.updated_at ? ("Update: " + window.sf.formatTime(data.updated_at)) : "Update: —";
    const items = Array.isArray(data?.items) ? data.items : [];
    cnt.textContent = String(items.length);

    if(!items.length){
      grid.innerHTML = `<div class="small">Noch keine Einträge.</div>`;
      return;
    }
    grid.innerHTML = items.map(itemCard).join("");
  }catch{
    upd.textContent = "Update: —";
    grid.innerHTML = `<div class="small">Konnte <code>/data/gallery.json</code> nicht laden.</div>`;
  }
})();