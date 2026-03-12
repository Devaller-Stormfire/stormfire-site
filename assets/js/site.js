(function () {
  try {
    const path = location.pathname.replace(/\/+$/, "") || "/index.html";
    document.querySelectorAll(".navbtn").forEach((a) => {
      const href = (a.getAttribute("href") || "").replace(/\/+$/, "");
      if (href === path) a.classList.add("active");
    });
  } catch (err) {
    console.error("[site.js]", err);
  }
})();