const stormfireTranslations = {
  de: {
    nav_home: "Home",
    nav_news: "News",
    nav_status: "Realm Status",
    nav_leaderboard: "Leaderboard",
    nav_roadmap: "Roadmap",
    nav_gallery: "Galerie",
    nav_download: "Launcher",
    nav_imprint: "Impressum",
    nav_story: "Geschichte",

    footer_rights: "© STORMFIRE • Rechte: Denis Toni Güven (Projekt in Entwicklung)",

    story_title: "Die Welt von STORMFIRE",
    story_intro: "Jueria ist eine Welt im Ungleichgewicht – geformt von Astralkraft, gespalten durch das Juwel der Entstehung und gefangen zwischen Ordnung und Freiheit.",

    story_h2_world: "Jueria",
    story_world: "STORMFIRE spielt in Jueria, einer Welt, deren Herz von Astralkraft durchzogen ist. Diese uralte Energie durchdringt Länder, Kreaturen, Magie und selbst das Schicksal ihrer Bewohner.",

    story_h2_jewel: "Das Juwel der Entstehung",
    story_jewel: "Einst hielt das Juwel der Entstehung die Welt im Gleichgewicht. Als es zerbrach, wurde Jueria für immer verändert. Die Naturgesetze verschoben sich, die Astralkraft wurde instabil und ganze Regionen wandelten sich auf unnatürliche Weise.",

    story_h2_climate: "Eine verdrehte Welt",
    story_climate: "Seit dem Bruch des Juwels ist die Welt aus dem Gleichgewicht geraten: Der Norden wurde heiß und erbarmungslos, während der Süden in Kälte und Frost versank. Diese verdrehte Ordnung prägt das Leben, die Kulturen und die Konflikte aller Völker.",

    story_h2_continents: "Die Kontinente",
    story_continents: "Jueria besteht aus den großen Kontinenten Vorngar und Elyraen. Zwischen ihnen liegt Aetherion – eine neutrale Inselstadt und Handelsmacht, die als Treffpunkt, Zuflucht und Knotenpunkt der Welt gilt.",

    story_h2_factions: "Drachenbund und Wolfsmark",
    story_factions: "Die Welt ist nicht in Gut und Böse geteilt. Der Drachenbund steht für Ordnung, Struktur und Beständigkeit. Wolfsmark verkörpert Freiheit, Härte und Anpassung. Beide Seiten haben ihre eigene Wahrheit – und beide kämpfen um die Zukunft Juerias.",

    story_h2_player: "Die Rolle des Spielers",
    story_player: "Die Spieler sind keine gewöhnlichen Reisenden. In einer Welt voller Instabilitäten, Weltenbrüche und astraler Stürme gelten sie als stabile Variable im Astralstrom – Wesen, die dem Chaos standhalten und den Lauf der Welt beeinflussen können.",

    story_h2_future: "Stormfire Age",
    story_future: "STORMFIRE erzählt von einer Welt am Rand des Umbruchs. Alte Mächte erwachen, neue Konflikte entstehen und die Frage bleibt offen: Wird Jueria an der Ordnung festhalten oder in der Freiheit neu geformt werden?",

    story_back: "Zurück zur Startseite"
  },

  en: {
    nav_home: "Home",
    nav_news: "News",
    nav_status: "Realm Status",
    nav_leaderboard: "Leaderboard",
    nav_roadmap: "Roadmap",
    nav_gallery: "Gallery",
    nav_download: "Launcher",
    nav_imprint: "Imprint",
    nav_story: "Story",

    footer_rights: "© STORMFIRE • Rights: Denis Toni Güven (Project in development)",

    story_title: "The World of STORMFIRE",
    story_intro: "Jueria is a world out of balance — shaped by astral power, shattered by the Jewel of Creation, and trapped between order and freedom.",

    story_h2_world: "Jueria",
    story_world: "STORMFIRE takes place in Jueria, a world whose heart is woven through with astral power. This ancient energy flows through lands, creatures, magic, and even the fate of its inhabitants.",

    story_h2_jewel: "The Jewel of Creation",
    story_jewel: "Once, the Jewel of Creation kept the world in balance. When it shattered, Jueria was changed forever. The laws of nature shifted, astral power became unstable, and entire regions transformed in unnatural ways.",

    story_h2_climate: "A Twisted World",
    story_climate: "Since the Jewel shattered, the world has fallen out of balance: the north became hot and unforgiving, while the south sank into frost and cold. This twisted order shapes the lives, cultures, and conflicts of all peoples.",

    story_h2_continents: "The Continents",
    story_continents: "Jueria consists of the great continents of Vorngar and Elyraen. Between them lies Aetherion — a neutral island city and trade power that serves as meeting point, refuge, and central hub of the world.",

    story_h2_factions: "Drachenbund and Wolfsmark",
    story_factions: "The world is not divided into good and evil. Drachenbund stands for order, structure, and endurance. Wolfsmark represents freedom, hardship, and adaptation. Both sides hold their own truth — and both fight for Jueria’s future.",

    story_h2_player: "The Player’s Role",
    story_player: "Players are not ordinary travelers. In a world filled with instabilities, world fractures, and astral storms, they are seen as a stable variable within the astral stream — beings able to endure chaos and shape the fate of the world.",

    story_h2_future: "Stormfire Age",
    story_future: "STORMFIRE tells the story of a world on the edge of upheaval. Ancient powers awaken, new conflicts emerge, and one question remains: will Jueria cling to order or be reshaped through freedom?",

    story_back: "Back to home"
  }
};

function applyStormfireLanguage(lang) {
  const useLang = stormfireTranslations[lang] ? lang : "de";
  localStorage.setItem("stormfire_lang", useLang);
  document.documentElement.setAttribute("lang", useLang);

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = stormfireTranslations[useLang][key];
    if (value) el.textContent = value;
  });
}

function initStormfireLanguage() {
  const saved = localStorage.getItem("stormfire_lang") || "de";
  applyStormfireLanguage(saved);

  const switcher = document.getElementById("lang-switch");
  if (switcher) {
    switcher.value = saved;
    switcher.addEventListener("change", (e) => {
      applyStormfireLanguage(e.target.value);
    });
  }
}

document.addEventListener("DOMContentLoaded", initStormfireLanguage);
