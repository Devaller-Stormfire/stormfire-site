(() => {
  const SUPABASE_URL = "https://furuovwvtbbgedxqukzz.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "DEIN_PUBLISHABLE_KEY_HIER";

  const CHARACTERS_TABLE = "characters";
  const SITE_REALM_STATUS_TABLE = "site_realm_status";
  const FACTION_COLUMN = "faction";
  const FACTION_1 = "Drachenbund";
  const FACTION_2 = "Wolfsmark";
  const NEWS_JSON_PATH = "./data/news.json";

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
    if (className) el.classList.add(className);
  }

  function setStatusNote(text) {
    const el = getEl("status-note");
    if (el) el.textContent = text;
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
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  function updateVisitCounter() {
    let visits = localStorage.getItem("stormfire_visits");
    visits = visits ? parseInt(visits, 10) : 0;
    if (Number.isNaN(visits)) visits = 0;
    visits += 1;
    localStorage.setItem("stormfire_visits", String(visits));
    setText("visit-count", visits);
  }

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
      console.error("News Fehler:", error);
    }
  }

  function createSupabaseClient() {
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error("Supabase Browser Client wurde nicht geladen.");
    }

    if (
      !SUPABASE_PUBLISHABLE_KEY ||
      SUPABASE_PUBLISHABLE_KEY.includes("DEIN_PUBLISHABLE_KEY_HIER")
    ) {
      throw new Error("Publishable Key fehlt.");
    }

    return window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  }

  function renderRealmList(rows) {
    const listEl = getEl("realm-list");
    if (!listEl) return;

    if (!Array.isArray(rows) || rows.length === 0) {
      listEl.innerHTML = `<div class="realm-list-empty">Keine Realm-Daten vorhanden.</div>`;
      return;
    }

    listEl.innerHTML = rows.map((row) => {
      const realmName = escapeHtml(row.realm_key || "Unbekannter Realm");
      const online = row.online === true;
      const playersOnline = Number(row.players_online || 0);

      return `
        <div class="realm-row">
          <div class="realm-name">${realmName}</div>
          <div class="realm-meta">
            <span>${playersOnline} Spieler</span>
            <span class="realm-state ${online ? "realm-state-online" : "realm-state-offline"}">
              <span class="dot ${online ? "dot-green" : "dot-red"}"></span>
              ${online ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      `;
    }).join("");
  }

  async function loadRealmStatus(client) {
    const { data, error } = await client
      .from(SITE_REALM_STATUS_TABLE)
      .select("realm_key, online, players_online, queue_size, last_heartbeat, updated_at")
      .order("realm_key", { ascending: true });

    if (error) throw error;

    const rows = Array.isArray(data) ? data : [];
    const realmsOnline = rows.filter((row) => row.online === true).length;
    const realmsOffline = Math.max(0, rows.length - realmsOnline);
    const playersOnline = rows.reduce((sum, row) => sum + Number(row.players_online || 0), 0);

    setText("realms-online", realmsOnline);
    setText("realms-offline", realmsOffline);
    setText("players-online-live", playersOnline);

    renderRealmList(rows);

    if (rows.length === 0) {
      setStatus("realm-status", "Keine Daten", "status-dev");
      return rows;
    }

    setStatus(
      "realm-status",
      realmsOnline > 0 ? "Online" : "Offline",
      realmsOnline > 0 ? "status-online" : "status-offline"
    );

    return rows;
  }

  async function loadCharacterCounts(client) {
    const totalResult = await client
      .from(CHARACTERS_TABLE)
      .select("*", { count: "exact", head: true });

    if (totalResult.error) throw totalResult.error;

    const faction1Result = await client
      .from(CHARACTERS_TABLE)
      .select("*", { count: "exact", head: true })
      .eq(FACTION_COLUMN, FACTION_1);

    if (faction1Result.error) throw faction1Result.error;

    const faction2Result = await client
      .from(CHARACTERS_TABLE)
      .select("*", { count: "exact", head: true })
      .eq(FACTION_COLUMN, FACTION_2);

    if (faction2Result.error) throw faction2Result.error;

    const totalPlayers = totalResult.count || 0;
    const faction1Players = faction1Result.count || 0;
    const faction2Players = faction2Result.count || 0;

    setText("player-count", totalPlayers);
    setText("drachenbund-count", faction1Players);
    setText("wolfsmark-count", faction2Players);

    return { totalPlayers, faction1Players, faction2Players };
  }

  function renderFactionBalance(drachenbund, wolfsmark) {
    const wrap = getEl("faction-balance");
    if (!wrap) return;

    const total = Number(drachenbund || 0) + Number(wolfsmark || 0);

    if (total <= 0) {
      wrap.innerHTML = `<div class="faction-balance-empty">Noch keine Fraktionsdaten verfügbar.</div>`;
      return;
    }

    const drachenPercent = ((drachenbund / total) * 100).toFixed(1);
    const wolfsPercent = ((wolfsmark / total) * 100).toFixed(1);

    wrap.innerHTML = `
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
    `;
  }

  async function loadSupabaseStats() {
    try {
      setStatus("login-status", "Verbinde…", "status-dev");
      setStatus("realm-status", "Lädt…", "status-dev");
      setStatusNote("Live-Daten werden geladen…");

      const client = createSupabaseClient();

      const realmRows = await loadRealmStatus(client);
      const counts = await loadCharacterCounts(client);

      renderFactionBalance(counts.faction1Players, counts.faction2Players);
      setStatus("login-status", "Verbunden", "status-online");

      let note = "Live-Daten erfolgreich geladen.";

      if (realmRows.length > 0) {
        const newestUpdate = realmRows
          .map((row) => row.updated_at || row.last_heartbeat)
          .filter(Boolean)
          .sort()
          .pop();

        if (newestUpdate) {
          note += ` Letztes Realm-Update: ${formatDate(newestUpdate)}.`;
        }
      }

      if (counts.totalPlayers === 0) {
        note += " Aktuell sind noch keine Charaktere vorhanden.";
      }

      setStatusNote(note);
    } catch (error) {
      console.error("Supabase Fehler:", error);
      setStatus("login-status", "Fehler", "status-offline");
      setStatus("realm-status", "Fehler", "status-offline");
      setStatusNote("Fehler beim Laden der Live-Daten. Prüfe Key, Policies und Spaltennamen.");
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    updateVisitCounter();
    await loadNews();
    await loadSupabaseStats();
  });
})();
