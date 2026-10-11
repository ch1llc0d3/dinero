// dinero landing page interactions

// ---------- i18n ----------
const translations = {
  en: {
    title: "dinero — Lottery Probability Simulations",
    tagline: "Lottery probability simulations — how much money do you actually make (or lose) playing?",
    cta: "Explore the project ↓",
    whatsInside: "What's inside",
    usaGames: "USA games",
    paraguayGames: "Paraguay games",
    docs: "Docs",
    powerballDesc:
      "US Powerball simulation: 5 white balls (1–69) + 1 red Powerball (1–26), $2/ticket (2026 price). Drawings every Mon/Wed/Sat — 156/year. The jackpot starts at $20M and rolls over until hit; the all-time record is $2.04B. Buys 100 tickets per drawing until the jackpot lands, then reports spent vs. earnings and a win-tier breakdown.",
    telebingoDesc:
      "Telebingo de Canal 9 TV Cerro Corá (GAMBLING S.A. / Conajzar): cartones with 01–25 numbers. GRANDIOSO, PODEROSO and DOBLE CHANCE draws — 12, 12 and 15 balls respectively, with per-tier wins and only the highest tier paying per drawing.",
    seneteDesc:
      "Seneté (Paraguay) — the animal-lottery game. Scaffold pending the actual rules: animal pool size, balls drawn per sorteo, ticket cost in Guaraníes, prize table and drawing frequency.",
    binguitoDesc:
      "Deprecated — the Telebingo reglamento arrived and the game was split into telebingo.py (implemented) and senete.py (scaffold). Kept for history.",
    readmeDesc: "Project documentation: how each simulation works and how to run it.",
    viewSource: "View source →",
    tryInBrowser: "Try it in the browser ↓",
    simHeading: "🎮 Try powerball.py in your browser",
    simIntro: "The same simulation as powerball.py, running right here: pick your settings, press Start, and watch the years roll by. Press Cash out any time to stop and see your results.",
    simTickets: "Tickets per drawing",
    simCost: "Cost per ticket ($)",
    simJackpot: "Jackpot ($)",
    simStart: "▶ Start",
    simStop: "🛑 Cash out",
    statYears: "years",
    statDrawings: "drawings",
    statSpent: "spent",
    statWon: "won",
    statNet: "net",
    factTicket: "per ticket — 2026 price",
    factDrawings: "drawings — Mon · Wed · Sat",
    factOddsJackpot: "odds of the jackpot",
    factOddsAny: "odds of winning any prize",
    presetMin: "Minimum starting jackpot ($20M)",
    presetTypical: "Typical winning jackpot (~$100M)",
    presetBig2026: "2026's biggest run ($600M, July)",
    presetBillion: "Billion-dollar jackpot ($1B, Aug 2026)",
    presetRecord: "All-time record — $2.04B, Nov 2022",
    runItYourself: "Run it yourself",
    builtWith: "Built with",
    simsInPython: "simulations in Python",
  },
  es: {
    title: "dinero — Simulaciones de Probabilidad de Lotería",
    tagline: "Simulaciones de probabilidad de lotería — ¿cuánto dinero ganas (o pierdes) realmente jugando?",
    cta: "Explora el proyecto ↓",
    whatsInside: "Qué hay dentro",
    usaGames: "Juegos de EE.UU.",
    paraguayGames: "Juegos de Paraguay",
    docs: "Documentación",
    powerballDesc:
      "Simulación de Powerball (EE.UU.): 5 bolas blancas (1–69) + 1 Powerball roja (1–26), $2 por boleto (precio 2026). Sorteos cada lunes/miércoles/sábado — 156 al año. El pozo arranca en $20M y acumula hasta que cae; el récord histórico es $2.04B. Compra 100 boletos por sorteo hasta ganar el pozo — luego reporta lo gastado vs. lo ganado y el desglose por nivel de premio.",
    telebingoDesc:
      "Telebingo de Canal 9 TV Cerro Corá (GAMBLING S.A. / Conajzar): cartones con números 01–25. Sorteos GRANDIOSO, PODEROSO y DOBLE CHANCE — 12, 12 y 15 bolillas respectivamente, con premios por nivel y solo el nivel más alto paga por sorteo.",
    seneteDesc:
      "Seneté (Paraguay) — el juego de la lotería de animales. Estructura base pendiente de las reglas reales: tamaño del pool de animales, bolillas por sorteo, costo del cartón en Guaraníes, tabla de premios y frecuencia de sorteos.",
    binguitoDesc:
      "Obsoleto — llegó el reglamento de Telebingo y el juego se dividió en telebingo.py (implementado) y senete.py (estructura base). Se conserva por historial.",
    readmeDesc: "Documentación del proyecto: cómo funciona cada simulación y cómo ejecutarla.",
    viewSource: "Ver código →",
    tryInBrowser: "Pruébalo en el navegador ↓",
    simHeading: "🎮 Prueba powerball.py en tu navegador",
    simIntro: "La misma simulación que powerball.py, corriendo aquí mismo: elige tus ajustes, pulsa Iniciar y mira pasar los años. Pulsa Retirarte en cualquier momento para detenerte y ver tus resultados.",
    simTickets: "Boletos por sorteo",
    simCost: "Costo por boleto ($)",
    simJackpot: "Pozo ($)",
    simStart: "▶ Iniciar",
    simStop: "🛑 Retirarme",
    statYears: "años",
    statDrawings: "sorteos",
    statSpent: "gastado",
    statWon: "ganado",
    statNet: "neto",
    factTicket: "por boleto — precio 2026",
    factDrawings: "sorteos — lun · mié · sáb",
    factOddsJackpot: "probabilidad del pozo",
    factOddsAny: "probabilidad de ganar algo",
    presetMin: "Pozo mínimo inicial ($20M)",
    presetTypical: "Pozo típico al ganar (~$100M)",
    presetBig2026: "El mayor pozo de 2026 ($600M, julio)",
    presetBillion: "Pozo de mil millones ($1B, ago 2026)",
    presetRecord: "Récord histórico — $2.04B, nov 2022",
    runItYourself: "Ejecútalo tú mismo",
    builtWith: "Construido con",
    simsInPython: "simulaciones en Python",
  },
};

function applyLang(lang) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) el.textContent = translations[lang][key];
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    if (translations[lang][key]) el.setAttribute("title", translations[lang][key]);
  });
  document.documentElement.lang = lang;
  localStorage.setItem("dinero-lang", lang);

  document.getElementById("lang-en").setAttribute("aria-pressed", lang === "en");
  document.getElementById("lang-es").setAttribute("aria-pressed", lang === "es");
  document.getElementById("lang-en").classList.toggle("active", lang === "en");
  document.getElementById("lang-es").classList.toggle("active", lang === "es");
}

document.getElementById("lang-en").addEventListener("click", () => applyLang("en"));
document.getElementById("lang-es").addEventListener("click", () => applyLang("es"));

// ---------- theme ----------
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("dinero-theme", theme);
  document.getElementById("theme-icon").textContent = theme === "dark" ? "☀️" : "🌙";
}

document.getElementById("theme-toggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

// ---------- restore preferences ----------
const savedLang = localStorage.getItem("dinero-lang") || "en";
applyLang(translations[savedLang] ? savedLang : "en");

const savedTheme = localStorage.getItem("dinero-theme") || "dark";
applyTheme(savedTheme);

// ---------- smooth scroll for the hero CTA ----------
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// ---------- subtle fade-in for cards ----------
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".card").forEach((card) => {
  card.style.opacity = "0";
  card.style.transform = "translateY(16px)";
  card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
  observer.observe(card);
});
