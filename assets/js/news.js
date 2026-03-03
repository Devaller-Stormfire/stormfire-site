<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>STORMFIRE – News</title>
  <link rel="icon" href="/assets/img/logo.png" />
  <link rel="stylesheet" href="/assets/css/style.css" />
</head>
<body>
  <canvas id="astral"></canvas>

  <div class="page">
    <header>
      <div class="brand">
        <img src="/assets/img/logo.png" alt="STORMFIRE Logo" />
        <div class="title">
          <strong>STORMFIRE</strong>
          <span>Dev Logs • News • Patchnotes</span>
        </div>
      </div>

      <div class="headerRight">
        <nav>
          <a class="navbtn" href="/index.html">Home</a>
          <a class="navbtn active" href="/news.html">News</a>
          <a class="navbtn" href="/status.html">Status</a>
          <a class="navbtn" href="/leaderboard.html">Leaderboard</a>
          <a class="navbtn" href="/roadmap.html">Roadmap</a>
          <a class="navbtn" href="/gallery.html">Galerie</a>
          <a class="navbtn" href="/download.html">Download</a>
          <a class="navbtn" href="/impressum.html">Impressum</a>
        </nav>

        <div class="liveStatus">
          <span class="dot warn" id="liveDot"></span>
          <span id="liveTxt">Lädt…</span>
        </div>
      </div>
    </header>

    <main>
      <div class="hero">
        <div>
          <h1>STORMFIRE News</h1>
          <p>Dev Logs, News und Patchnotes – kompakt und sauber.</p>
        </div>
        <div class="badge">
          <span class="dot good"></span>
          <span id="updatedPill">Lädt…</span>
        </div>
      </div>

      <section class="grid">
        <article class="card" style="grid-column: span 12;">
          <div class="hd">
            <h2>Filter</h2>
            <span class="small" id="countPill">0 Posts</span>
          </div>
          <div class="bd" style="display:flex; gap:10px; flex-wrap:wrap; justify-content:space-between; align-items:center;">
            <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
              <input class="input" id="searchInput" placeholder="Suchen (Titel, Text, Tags)..." />
              <select class="select" id="typeSelect">
                <option value="all">Alle Typen</option>
                <option value="devlog">Devlog</option>
                <option value="news">News</option>
                <option value="patch">Patch</option>
              </select>
            </div>
            <button class="navbtn" id="reloadBtn" type="button">Neu laden</button>
          </div>
        </article>

        <article class="card" style="grid-column: span 12;">
          <div class="hd"><h2>Posts</h2><span class="small">Chronologisch</span></div>
          <div class="bd">
            <div id="postsGrid" class="small">News werden geladen…</div>
          </div>
        </article>
      </section>
    </main>

    <footer>
      © <span id="year"></span> STORMFIRE • Rechte: Denis Toni Güven (Projekt in Entwicklung)
    </footer>
  </div>

  <script src="/assets/js/common.js"></script>
  <script src="/assets/js/site.js"></script>
  <script src="/assets/js/news.js"></script>
</body>
</html>
