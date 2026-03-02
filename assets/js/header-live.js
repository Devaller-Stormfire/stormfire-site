// /assets/js/header-live.js
(async function () {
  const mount = document.getElementById("sfLiveHeader");
  if (!mount || !window.sf?.fetchJSON) return;

  function dotClass(status){
    if (status === "online") return "good";
    if (status === "maintenance") return "warn";
    return "bad";
  }

  // Render shell sofort (damit Header nicht springt)
  mount.innerHTML = `
    <div class="badge">
      <span class="dot warn" id="sfLiveDot"></span>
      <span class="small" id="sfLiveText">LIVE: lädt…</span>
    </div>
  `;

  async function load(){
    try{
      const s = await window.sf.fetchJSON("/data/status.json");
      const dot = mount.querySelector("#sfLiveDot");
      const txt = mount.querySelector("#sfLiveText");

      dot.classList.remove("good","warn","bad");
      dot.classList.add(dotClass(s.status));

      const realm = s.realm?.name || "—";
      const onl  = (s.playersOnline ?? 0);
      txt.textContent = `LIVE: ${realm} • ${window.sf.formatNumber(onl)} online`;
    }catch(e){
      const dot = mount.querySelector("#sfLiveDot");
      const txt = mount.querySelector("#sfLiveText");
      dot.classList.remove("good","warn","bad");
      dot.classList.add("bad");
      txt.textContent = "LIVE: offline";
    }
  }

  await load();
  setInterval(() => {
    if (document.visibilityState === "visible") load();
  }, 60_000);
})();
