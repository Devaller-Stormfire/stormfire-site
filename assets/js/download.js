(async function(){
  const upd = document.getElementById("dlUpdated");
  const ver = document.getElementById("dlVersion");
  const log = document.getElementById("dlChangelog");
  const btn = document.getElementById("dlBtn");
  const sha = document.getElementById("dlSha");

  try{
    const data = await window.sf.fetchJSON("/data/launcher.json");
    upd.textContent = data?.updated_at ? ("Update: " + window.sf.formatTime(data.updated_at)) : "Update: —";
    ver.textContent = data?.version ? ("v" + data.version) : "—";
    log.textContent = data?.changelog || "—";
    sha.textContent = data?.sha256 || "—";

    const url = data?.download_url || "#";
    btn.href = url;
    btn.textContent = url === "#" ? "Download (bald)" : "Download";
  }catch{
    upd.textContent = "Update: —";
    ver.textContent = "—";
    log.textContent = "Konnte /data/launcher.json nicht laden.";
    btn.href = "#";
    sha.textContent = "—";
  }
})();