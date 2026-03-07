(() => {
  // =========================================================
  // STORMFIRE Website Status
  // =========================================================

  // SUPABASE
  const SUPABASE_URL = "https://furuovwvtbbgedxqukzz.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "HIER_DEIN_PUBLISHABLE_KEY_EINFUEGEN";

  // TABELLEN
  const CHARACTERS_TABLE = "characters";
  const SITE_REALM_STATUS_TABLE = "site_realm_status";

  // WICHTIG:
  // Falls deine Fraktionsspalte anders heißt, hier ändern.
  const FACTION_COLUMN = "faction";

  // FRAKTIONEN
  const FACTION_1 = "Drachenbund";
  const FACTION_2 = "Wolfsmark";

  // NEWS DATEI
  const NEWS_JSON_PATH = "./data/news.json";

  // =========================================================
  // HELPERS
  // =========================================================

  function getEl(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    const el = getEl(id);
    if (el) el.textContent = String(value);
  }

  function setHtml(id, value) {
    const el = getEl(id);
    if (el) el.innerHTML = value;
  }

  function setStatus(id, text, className = "") {
    const el = getEl(id);
    if (!el) return;

    el.textContent = text;
    el.classList.remove("status-online", "status-offline", "status-dev");

    if (className) {
      el.classList.add(className);
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(dateString) {
    if (!dateString) return "Unbekannt";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  function setStatusNote(text) {
    const noteEl = getEl("status-note");
    if (noteEl) noteEl.textContent = text;
  }

  // =========================================================
  // DEVICE VISITS
  // =========================================================

  function updateVisitCounter() {
    const key = "stormfire_visits";
    let visits = localStorage.getItem(key);

    visits = visits ? parseInt(visits, 10) : 0;
    if (Number.isNaN(visits)) visits = 0;

    visits += 1;
    localStorage.setItem(key, String(visits));

    setText("visit-count", visits);
  }

  // =========================================================
  // NEWS
  // =========================================================

  async function loadNews() {
    const listEl = getEl("news-list");
    if (!listEl) return;

    try {
      const response = await fetch(NEWS_JSON_PATH, { cache: "no-store" });
      if (!response.ok) return;

      const data = await response.json();
      const posts = Array.isArray(data.posts) ? data.posts.slice(0, 3) : [];

      if (posts.length === 0) return;

      listEl.innerHTML = posts.map((post) => {
        const type = escapeHtml(post.type || "Devlog");
        const date = escapeHtml(formatDate(post.date));
        const title = escapeHtml(post.title || "Ohne Titel");
        const body = escapeHtml(post.body || "").replace(/\n/g, "<br>");

        return `
          <article class="news-item">
            <div class="news-meta">${date} • ${type}</div>
            <h3>${title}</h3>
            <p>${body}</p>
          </article>
        `;
      }).join("");
    } catch (error) {
      console.error("News konnten nicht geladen werden:", error);
    }
  }

  // =========================================================
  // SUPABASE
  // =========================================================

  function createSupabaseClient() {
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error("Supabase Browser Client wurde nicht geladen.");
    }

    if (
      !SUPABASE_PUBLISHABLE_KEY ||
      SUPABASE_PUBLISHABLE_KEY.includes("sb_publishable_GmsSvpE-8xoRVsgePDIrsQ_p-jH5gQ2")
    ) {
      throw new Error("Publishable Key fehlt in assets/js/status.js.");
    }

    return window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );
  }

  async function loadRealmStatus(client) {
    const result = await client
      .from(SITE_REALM_STATUS_TABLE)
      .select("realm_key, online, players_online, queue_size, last_heartbeat, updated_at")
      .order("realm_key", { ascending: true });

    if (result.error) {
      throw result.error;
    }

    const rows = Array.isArray(result.data) ? result.data : [];

    const realmsOnline = rows.filter(row => row.online === true).length;

    const playersOnline = rows.reduce((sum, row) => {
      return sum + Number(row.players_online || 0);
    }, 0);

    setText("realms-online", realmsOnline);
    setText("players-online-live", playersOnline);

    if (rows.length === 0) {
      setStatus("realm-status", "Keine Daten", "status-dev");
      return rows;
    }

    if (realmsOnline > 0) {
      setStatus("realm-status", "Online", "status-online");
    } else {
      setStatus("realm-status", "Offline", "status-offline");
    }

    return rows;
  }

  async function loadCharacterCounts(client) {
    const totalResult = await client
      .from(CHARACTERS_TABLE)
      .select("*", { count: "exact", head: true });

    if (totalResult.error) {
      throw totalResult.error;
    }

    const faction1Result = await client
      .from(CHARACTERS_TABLE)
      .select("*", { count: "exact", head: true })
      .eq(FACTION_COLUMN, FACTION_1);

    if (faction1Result.error) {
      throw faction1Result.error;
    }

    const faction2Result = await client
      .from(CHARACTERS_TABLE)
      .select("*", { count: "exact", head: true })
      .eq(FACTION_COLUMN, FACTION_2);

    if (faction2Result.error) {
      throw faction2Result.error;
    }

    const totalPlayers = totalResult.count || 0;
    const faction1Players = faction1Result.count || 0;
    const faction2Players = faction2Result.count || 0;

    setText("player-count", totalPlayers);
    setText("drachenbund-count", faction1Players);
    setText("wolfsmark-count", faction2Players);

    return {
      totalPlayers,
      faction1Players,
      faction2Players
    };
  }

  async function loadSupabaseStats() {
    try {
      const client = createSupabaseClient();

      setStatus("login-status", "Verbinde…", "status-dev");
      setStatus("realm-status", "Lädt…", "status-dev");
      setStatusNote("Live-Daten werden aus Supabase geladen…");

      const realmRows = await loadRealmStatus(client);
      const counts = await loadCharacterCounts(client);

      setStatus("login-status", "Verbunden", "status-online");

      let note = "Live-Daten erfolgreich geladen. Realm-Zahlen stammen aus site_realm_status, Fraktionszahlen aus characters.";

      if (realmRows.length > 0) {
        const newestUpdate = realmRows
          .map(row => row.updated_at || row.last_heartbeat)
          .filter(Boolean)
          .sort()
          .pop();

        if (newestUpdate) {
          note += ` Letztes Realm-Update: ${formatDate(newestUpdate)}.`;
        }
      }

      if (counts.totalPlayers === 0) {
        note += " Aktuell sind noch keine Charaktere in der Online-Auswertung vorhanden oder die Fraktionsspalte heißt anders.";
      }

      setStatusNote(note);
    } catch (error) {
      console.error("Supabase Fehler:", error);

      setStatus("login-status", "Fehler", "status-offline");
      setStatus("realm-status", "Fehler", "status-offline");

      setStatusNote(
        "Die Live-Daten konnten nicht geladen werden. Prüfe Publishable Key, RLS/Policies und den Namen der Fraktionsspalte in characters."
      );
    }
  }

  // =========================================================
  // OPTIONAL: Fraktionsbalken automatisch einfügen
  // Falls du später in HTML ein Element mit id='faction-balance' hast.
  // =========================================================

  function renderFactionBalance() {
    const wrap = getEl("faction-balance");
    if (!wrap) return;

    const drachenbund = Number(getEl("drachenbund-count")?.textContent || 0);
    const wolfsmark = Number(getEl("wolfsmark-count")?.textContent || 0);
    const total = drachenbund + wolfsmark;

    if (total <= 0) {
      setHtml("faction-balance", `
        <div class="faction-balance-empty">Noch keine Fraktionsdaten verfügbar.</div>
      `);
      return;
    }

    const drachenPercent = ((drachenbund / total) * 100).toFixed(1);
    const wolfsPercent = ((wolfsmark / total) * 100).toFixed(1);

    setHtml("faction-balance", `
      <div class="faction-balance-wrap">
        <div class="faction-balance-head">
          <span>Drachenbund ${drachenPercent}%</span>
          <span>Wolfsmark ${wolfsPercent}%</span>
        </div>
        <div class="faction-balance-bar">
          <div class="faction-balance-drachenbund" style="width:${drachenPercent}%"></div>
          <div class="faction-balance-wolfsmark" style="width:${wolfsPercent}%"></div>
        </div>
      </div>
    `);
  }

  // =========================================================
  // INIT
  // =========================================================

  document.addEventListener("DOMContentLoaded", async () => {
    updateVisitCounter();
    await loadNews();
    await loadSupabaseStats();
    renderFactionBalance();
  });
})();
