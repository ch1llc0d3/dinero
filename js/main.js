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
    tryDemo: "Try a demo in the browser ↓",
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
    tbHeading: "🎮 Try telebingo.py in your browser",
    tbIntro: "The same simulation as telebingo.py, running right here: pick your settings, press Start, and the sorteos roll week by week until a POZO lands. Press Cash out any time to stop and see your results.",
    tbFactPool: "bolilla pool per cartón series",
    tbFactBalls: "balls drawn — GRANDIOSO · PODEROSO · DOBLE CHANCE",
    tbFactOddsPozo: "odds of a 15-hit DOBLE CHANCE column",
    tbFactSeries: "independent series per cartón",
    tbCartones: "Cartones per sorteo",
    tbCost: "Cost per cartón (₲)",
    snHeading: "🎮 Seneté — real 2026 rules",
    snIntro: "The real game: numbers 1–25 (no animals). Each cartón (₲10.000) has two independent 12-number grids and two 15-number grids. Every Sunday sorteo has four jugadas — GRANDIOSO and DOBLE CHANCE feed progressive pozos, PODEROSO pays ₲1.000.000.000 for 12/12 and ₲2.000.000 for zero hits. Pick how many cartones you buy per week and watch the sorteos roll.",
    snFactPool: "number pool — no animals",
    snFactGrids: "independent grids per cartón",
    snFactPrice: "per cartón, sorteo every Sunday",
    snFactOdds: "odds of 12/12 on one grid",
    snCartones: "Cartones per sorteo (₲10.000 each)",
    snGrandioso: "GRANDIOSO — 12 of 25",
    snPoderoso: "PODEROSO — 12 of 25",
    snDoble: "DOBLE CHANCE — 15 of 25",
    snPozoG: "Grandioso POZO (assumed base)",
    snPozoD: "Doble Chance POZO (assumed base)",
    snPozoP: "Poderoso jackpot (+₲100M/wk)",
    snWeeks: "sorteos (weeks)",
    snCartonesPlayed: "cartones played",
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
      "Seneté (Paraguay) — el juego real 2026: números 1–25, cartones con grillas de 12 y 15 números, cuatro jugadas por sorteo dominical, pozos progresivos y consolación de ₲2M por cero aciertos.",
    binguitoDesc:
      "Obsoleto — llegó el reglamento de Telebingo y el juego se dividió en telebingo.py (implementado) y senete.py (estructura base). Se conserva por historial.",
    readmeDesc: "Documentación del proyecto: cómo funciona cada simulación y cómo ejecutarla.",
    viewSource: "Ver código →",
    tryInBrowser: "Pruébalo en el navegador ↓",
    tryDemo: "Prueba una demo en el navegador ↓",
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
    tbHeading: "🎮 Prueba telebingo.py en tu navegador",
    tbIntro: "La misma simulación que telebingo.py, corriendo aquí mismo: elige tus ajustes, pulsa Iniciar y los sorteos pasan semana a semana hasta que cae un POZO. Pulsa Retirarme en cualquier momento para detenerte y ver tus resultados.",
    tbFactPool: "bolillas del pool por serie del cartón",
    tbFactBalls: "bolillas sorteadas — GRANDIOSO · PODEROSO · DOBLE CHANCE",
    tbFactOddsPozo: "probabilidad de una columna de 15 aciertos en DOBLE CHANCE",
    tbFactSeries: "series independientes por cartón",
    tbCartones: "Cartones por sorteo",
    tbCost: "Costo por cartón (₲)",
    snHeading: "🎮 Seneté — reglas reales 2026",
    snIntro: "El juego real: números 1–25 (sin animales). Cada cartón (₲10.000) tiene dos grillas independientes de 12 números y dos de 15. Cada sorteo dominical tiene cuatro jugadas — GRANDIOSO y DOBLE CHANCE alimentan pozos progresivos, PODEROSO paga ₲1.000.000.000 por 12/12 y ₲2.000.000 por cero aciertos. Elige cuántos cartones compras por semana y mira pasar los sorteos.",
    snFactPool: "pool de números — sin animales",
    snFactGrids: "grillas independientes por cartón",
    snFactPrice: "por cartón, sorteo cada domingo",
    snFactOdds: "probabilidad de 12/12 en una grilla",
    snCartones: "Cartones por sorteo (₲10.000 c/u)",
    snGrandioso: "GRANDIOSO — 12 de 25",
    snPoderoso: "PODEROSO — 12 de 25",
    snDoble: "DOBLE CHANCE — 15 de 25",
    snPozoG: "POZO Grandioso (base supuesta)",
    snPozoD: "POZO Doble Chance (base supuesta)",
    snPozoP: "Jackpot Poderoso (+₲100M/sem)",
    snWeeks: "sorteos (semanas)",
    snCartonesPlayed: "cartones jugados",
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
