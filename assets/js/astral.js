// STORMFIRE astral.js — lightweight canvas fog/particles (no heavy GPU)
(function(){
  const canvas = document.getElementById("astral");
  if(!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if(!ctx) return;

  let w = 0, h = 0, dpr = 1;
  let particles = [];
  const COUNT = 60;

  function resize(){
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = Math.floor(window.innerWidth * dpr);
    h = Math.floor(window.innerHeight * dpr);
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
  }

  function rand(min,max){ return min + Math.random()*(max-min); }

  function seed(){
    particles = Array.from({length: COUNT}).map(() => ({
      x: rand(0,w),
      y: rand(0,h),
      r: rand(40*dpr, 140*dpr),
      vx: rand(-0.18, 0.18)*dpr,
      vy: rand(-0.14, 0.14)*dpr,
      a: rand(0.04, 0.10),
      hue: rand(185, 215) // storm-ish
    }));
  }

  function step(){
    if(document.visibilityState !== "visible"){
      requestAnimationFrame(step);
      return;
    }

    ctx.clearRect(0,0,w,h);

    for(const p of particles){
      p.x += p.vx;
      p.y += p.vy;

      if(p.x < -p.r) p.x = w + p.r;
      if(p.x > w + p.r) p.x = -p.r;
      if(p.y < -p.r) p.y = h + p.r;
      if(p.y > h + p.r) p.y = -p.r;

      const g = ctx.createRadialGradient(p.x,p.y, 0, p.x,p.y, p.r);
      g.addColorStop(0, `hsla(${p.hue}, 90%, 60%, ${p.a})`);
      g.addColorStop(1, `hsla(${p.hue}, 90%, 60%, 0)`);
      ctx.fillStyle = g;
      ctx.fillRect(p.x-p.r, p.y-p.r, p.r*2, p.r*2);
    }

    requestAnimationFrame(step);
  }

  resize();
  seed();
  step();

  window.addEventListener("resize", () => { resize(); seed(); }, { passive:true });
})();