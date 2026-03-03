// /assets/js/site.js — header live status + astral canvas

(function(){
  const $ = (id) => document.getElementById(id);

  // ===== 1) Astral Canvas (leicht, CPU-schonend) =====
  const canvas = document.getElementById("astral");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let w=0,h=0, t=0;
    const dots = Array.from({length: 60}, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.8 + Math.random()*1.8,
      s: 0.12 + Math.random()*0.35
    }));

    function resize(){
      w = canvas.width = Math.floor(window.innerWidth * devicePixelRatio);
      h = canvas.height = Math.floor(window.innerHeight * devicePixelRatio);
    }
    window.addEventListener("resize", resize);
    resize();

    function draw(){
      t += 0.01;
      ctx.clearRect(0,0,w,h);

      // soft nebula
      const g = ctx.createRadialGradient(w*0.2, h*0.2, 0, w*0.2, h*0.2, Math.max(w,h)*0.7);
      g.addColorStop(0, "rgba(106,230,255,0.07)");
      g.addColorStop(0.5, "rgba(154,107,255,0.05)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0,0,w,h);

      // drifting stars
      ctx.save();
      ctx.globalAlpha = 0.7;
      for(const d of dots){
        const x = (d.x + Math.sin(t*d.s)*0.002) * w;
        const y = (d.y + Math.cos(t*d.s)*0.002) * h;
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.beginPath();
        ctx.arc(x,y,d.r*devicePixelRatio,0,Math.PI*2);
        ctx.fill();
      }
      ctx.restore();

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  // ===== 2) Live Status Pill im Header =====
  async function updateLive(){
    const dot = $("liveDot");
    const txt = $("liveTxt");

    if (!dot || !txt) return;

    try{
      const s = await window.sf.fetchJSON("/data/status.json");
      dot.classList.remove("good","warn","bad");
      const st = (s.status || "offline").toLowerCase();
      if (st === "online") dot.classList.add("good");
      else if (st === "maintenance") dot.classList.add("warn");
      else dot.classList.add("bad");

      const realm = s.realm?.name || "—";
      const online = window.sf.formatNumber(s.playersOnline);
      txt.innerHTML = `<b>${st.toUpperCase()}</b> <span class="txt">• ${realm} • ${online} online</span>`;
    }catch{
      dot.classList.remove("good","warn","bad");
      dot.classList.add("bad");
      txt.innerHTML = `<b>OFFLINE</b> <span class="txt">• keine Daten</span>`;
    }
  }

  updateLive();
  setInterval(() => { if(document.visibilityState === "visible") updateLive(); }, 60_000);
  document.addEventListener("visibilitychange", () => {
    if(document.visibilityState === "visible") updateLive();
  });
})();
