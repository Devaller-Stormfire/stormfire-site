// /assets/js/discord-counter.js
// Zeigt "Online" + "Members" über Invite-Code (mit Cache), ohne GitHub API.

(function(){
  const INVITE_CODE = "wvpdyZ6wW";
  const API_URL = `https://discord.com/api/v9/invites/${INVITE_CODE}?with_counts=true&with_expiration=true`;

  const elOnline = document.getElementById("discordOnline");
  const elMembers = document.getElementById("discordMembers");
  const elStatus = document.getElementById("discordCounterStatus");
  if (!elOnline && !elMembers && !elStatus) return;

  const CACHE_KEY = "sf_discord_counts_v1";
  const TTL_MS = 60_000;

  function setText(node, txt){ if(node) node.textContent = txt; }
  function format(n){
    if (n === null || n === undefined) return "—";
    try { return new Intl.NumberFormat("de-DE").format(n); }
    catch { return String(n); }
  }

  function apply(data){
    const online = data?.approximate_presence_count;
    const members = data?.approximate_member_count;

    setText(elOnline, format(online));
    setText(elMembers, format(members));
    if (elStatus) {
      elStatus.classList.remove("bad","warn","good");
      elStatus.classList.add("good");
      elStatus.textContent = "LIVE";
    }
  }

  async function load(){
    // 1) Cache
    try{
      const c = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (c && (Date.now() - c.ts) < TTL_MS && c.data) apply(c.data);
    }catch{}

    // 2) Fetch
    try{
      const res = await fetch(API_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      try{ localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); }catch{}
      apply(data);
    }catch{
      if (elStatus) {
        elStatus.classList.remove("good","warn","bad");
        elStatus.classList.add("warn");
        elStatus.textContent = "—";
      }
      // Wenn Cache da war: ok. Wenn nicht: bleibt "—"
    }
  }

  load();
  setInterval(() => {
    if (document.visibilityState === "visible") load();
  }, 120_000);
})();