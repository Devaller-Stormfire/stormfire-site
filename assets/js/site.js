(function () {
  try {
    const path = location.pathname.replace(/\/+$/, "") || "/index.html";

    document.querySelectorAll(".navbtn").forEach((a) => {
      const href = (a.getAttribute("href") || "").replace(/\/+$/, "");
      if (href === path) a.classList.add("active");
    });

    document.documentElement.lang = (navigator.language || "de").toLowerCase().startsWith("en") ? "en" : "de";
  } catch (err) {
    console.error("[site.js]", err);
  }
})();
