// /assets/js/home-teaser.js
(async function(){
  const box = document.getElementById("sfLast3");
  if (!box || !window.sf?.fetchJSON) return;

  function esc(str){
    return String(str ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll
