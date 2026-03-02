// common.js — Astral Background + Utilities

(function () {
  // ---------- Helpers ----------
  window.sf = window.sf || {};

  window.sf.fetchJSON = async function (path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`Fetch failed: ${path} (${res.status})`);
    return await res.json();
  };

  window.sf.formatNumber = function (n) {
    if (n === null || n === undefined) return "-";
    return new Intl.NumberFormat("de-DE").format(n);
  };

  window.sf.formatTime = function (iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
  };

  // ---------- Astral Canvas ----------
  const canvas = document.getElementById("astral");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  let w = 0, h = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  function resize() {
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  // Stars + drifting “astral dust”
  const STAR_COUNT = Math.floor(Math.min(240, Math.max(120, (w * h) / 9000)));
  const stars = [];

  function rand(a, b) { return a + Math.random() * (b - a); }

  function makeStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: rand(0, w),
        y: rand(0, h),
        r: rand(0.6, 2.0),
        a: rand(0.10, 0.85),
        tw: rand(0.002, 0.010),
        vx: rand(-0.06, 0.06),
        vy: rand(-0.03, 0.08),
        hue: Math.random() < 0.5 ? "106,230,255" : "154,107,255"
      });
    }
  }
  makeStars();

  let t = 0;

  function draw() {
    t += 1;

    // background fade
    ctx.clearRect(0, 0, w, h);

    // subtle nebula gradients
    const g1 = ctx.createRadialGradient(w * 0.18, h * 0.12, 0, w * 0.18, h * 0.12, Math.max(w, h) * 0.65);
    g1.addColorStop(0, "rgba(106,230,255,0.12)");
    g1.addColorStop(1, "rgba(106,230,255,0)");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);

    const g2 = ctx.createRadialGradient(w * 0.82, h * 0.28, 0, w * 0.82, h * 0.28, Math.max(w, h) * 0.70);
    g2.addColorStop(0, "rgba(154,107,255,0.10)");
    g2.addColorStop(1, "rgba(154,107,255,0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);

    // stars
    for (const s of stars) {
      s.x += s.vx;
      s.y += s.vy;

      if (s.x < -10) s.x = w + 10;
      if (s.x > w + 10) s.x = -10;
      if (s.y < -10) s.y = h + 10;
      if (s.y > h + 10) s.y = -10;

      const twinkle = 0.5 + 0.5 * Math.sin((t * s.tw) + (s.x * 0.01));
      const alpha = s.a * (0.55 + 0.45 * twinkle);

      ctx.beginPath();
      ctx.fillStyle = `rgba(${s.hue},${alpha})`;
      ctx.arc(s.x, s.y, s.r * (0.7 + 0.6 * twinkle), 0, Math.PI * 2);
      ctx.fill();
    }

    // faint “rift lines”
    ctx.globalAlpha = 0.12;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    const y = (h * 0.72) + Math.sin(t * 0.003) * 26;
    ctx.moveTo(0, y);
    for (let x = 0; x <= w; x += 40) {
      ctx.lineTo(x, y + Math.sin((x * 0.02) + (t * 0.01)) * 10);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    requestAnimationFrame(draw);
  }

  draw();
})();
