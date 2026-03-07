(() => {
  // =========================================================
  // STORMFIRE Website Status
  // =========================================================

  // DEINE SUPABASE DATEN
  const SUPABASE_URL = "https://furuovwvtbbgedxqukzz.supabase.co";

  // WICHTIG:
  // HIER DEINEN PUBLISHABLE KEY EINFÜGEN.
  // Nicht service_role verwenden.
  const SUPABASE_PUBLISHABLE_KEY = "HIER_DEIN_PUBLISHABLE_KEY_EINFUEGEN";

  // TABELLEN / SPALTEN
  const CHARACTERS_TABLE = "characters";
  const FACTION_COLUMN = "faction"; // falls anders, hier ändern

  const SITE_REALM_STATUS_TABLE = "site_realm_status";

  // FRAKTIONSNAMEN
  const FACTION_1 = "Drachenbund";
  const FACTION_2 = "Wolfsmark";

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value);
  }

  function setStatus(id, text, className) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.classList.remove("status-online", "status-offline", "status-dev");
    if (className) el.classList.add(className);
  }

  function updateVisitCounter() {
    const visitEl = document.getElementById("visit-count");
    if (!visitEl) return;

    let visits = localStorage.getItem("stormfire_visits");
    visits = visits ? parseInt(visits, 10) + 1 : 1;
    localStorage.setItem("stormfire_visits", String(visits));
    visitEl.textContent = String(visits);
  }

  async function loadNews() {
    const listEl = document.getElementById("news-list");
    if (!listEl) return;

    try {
      const response = await fetch("./data/news.json", { cache: "no-store" });
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

  async function loadSupabaseStats() {
    const noteEl = document.getElementById("status-note");

    if (!window.supabase || !window.supabase.createClient) {
      setStatus("login-status", "Client fehlt", "status-offline");
      setStatus("realm-status", "Nicht verfügbar", "status-offline");
      if (noteEl) noteEl.textContent = "Der Supabase Browser Client konnte nicht geladen werden.";
      return;
    }

    if (!SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY.includes("HIER_DEIN")) {
      setStatus("login-status", "Key fehlt", "status-dev");
      setStatus("realm-status", "Wartet", "status-dev");
      if (noteEl) {
        noteEl.textContent = "Trage in assets/js/status.js noch deinen Publishable Key ein.";
      }
      return;
    }

    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

    try {
      // 1) Realm Status laden
      const realmResult = await client
        .from(SITE_REALM_STATUS_TABLE)
        .select("realm_key, online, players_online, updated_at")
        .order("realm_key", { ascending: true });

      if (realmResult.error) {
        throw realmResult.error;
      }

      const realmRows = Array.isArray(realmResult.data) ? realmResult.data : [];
      const realmsOnline = realmRows.filter(r => r.online === true).length;
      const totalPlayersOnline = realmRows.reduce((sum, row) => {
        return sum + Number(row.players_online || 0);
      }, 0);

      setText("realms-online", realmsOnline);
      setText("players-online-live", totalPlayersOnline);

      if (realmRows.length > 0) {
        setStatus("realm-status", realmsOnline > 0 ? "Online" : "Offline", realmsOnline > 0 ? "status-online" : "status-offline");
      } else {
        setStatus("realm-status", "Keine Daten", "status-dev");
      }

      // 2) Charaktere gesamt
      const totalResult = await client
        .from(CHARACTERS_TABLE)
        .select("*", { count: "exact", head: true });

      if (totalResult.error) {
        throw totalResult.error;
      }

      setText("player-count", totalResult.count || 0);

      // 3) Fraktion 1
      const faction1Result = await client
        .from(CHARACTERS_TABLE)
        .select("*", { count: "exact", head: true })
        .eq(FACTION_COLUMN, FACTION_1);

      if (faction1Result.error) {
        throw faction1Result.error;
      }

      setText("drachenbund-count", faction1Result.count || 0);

      // 4) Fraktion 2
      const faction2Result = await client
        .from(CHARACTERS_TABLE)
        .select("*", { count: "exact", head: true })
        .eq(FACTION_COLUMN, FACTION_2);

      if (faction2Result.error) {
        throw faction2Result.error;
      }

      setText("wolfsmark-count", faction2Result.count || 0);

      // Wenn alles klappt:
      setStatus("login-status", "Verbunden", "status-online");

      if (noteEl) {
        noteEl.textContent =
          "Live-Daten erfolgreich geladen. Realm-Zahlen stammen aus site_realm_status, Fraktionszahlen aus characters.";
      }
    } catch (error) {
      console.error("Supabase Fehler:", error);
      setStatus("login-status", "Fehler", "status-offline");
      setStatus("realm-status", "Fehler", "status-offline");

      if (noteEl) {
        noteEl.textContent =
          "Die Live-Daten konnten nicht geladen werden. Prüfe Publishable Key, RLS-Policies und den Fraktions-Spaltennamen.";
      }
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    updateVisitCounter();
    await loadNews();
    await loadSupabaseStats();
  });
})();
