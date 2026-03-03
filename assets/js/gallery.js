(async function(){
  document.getElementById("year").textContent = new Date().getFullYear();

  const galGrid = document.getElementById("galGrid");
  const galUpdated = document.getElementById("galUpdated");
  const uploadHint = document.getElementById("uploadHint");

  function getSession(){
    try{ return JSON.parse(localStorage.getItem("sf_session")||"null"); }catch{ return null; }
  }
  const s = getSession();
  uploadHint.textContent = s ? `Eingeloggt als: ${s.user} (Upload kommt später)` : "Bitte einloggen, um später hochzuladen.";

  try{
    const data = await window.sf.fetchJSON("/data/gallery.json");
    galUpdated.textContent = "Update: " + window.sf.formatTime(data.lastUpdated);

    const items = Array.isArray(data.items) ? data.items : [];
    if(items.length === 0){
      galGrid.innerHTML = `<div class="small">Noch keine Bilder.</div>`;
      return;
    }

    galGrid.innerHTML = items.map(it => {
      return `<div class="galleryItem">
        <img src="${window.sf.escapeHtml(it.url)}" alt="Galerie Bild" loading="lazy" />
        <div class="cap">${window.sf.escapeHtml(it.caption || "")}<div class="small">${window.sf.escapeHtml(it.by || "")}</div></div>
      </div>`;
    }).join("");
  }catch(e){
    console.warn(e);
    galGrid.innerHTML = `<div class="small">Konnte Galerie nicht laden.</div>`;
  }
})();
