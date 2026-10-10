// dinero landing page interactions

// ---------- i18n ----------
const translations = {
  en: {
    title: "dinero — Lottery Probability Simulations",
    tagline: "Lottery probability simulations — how much money do you actually make (or lose) playing?",
    cta: "Explore the project ↓",
    whatsInside: "What's inside",
    powerballDesc:
      "US Powerball simulation: 5 white balls (1–69) + 1 red Powerball (1–26), $2/ticket. Buys 100 tickets per drawing, 2 drawings/week, until the $2B jackpot is hit — then reports spent vs. earnings and a win-tier breakdown.",
    binguitoDesc:
      "Paraguayan Binguito simulation — scaffold. Waiting on the actual game rules (ball pools, prize table, ticket cost, drawing frequency) before implementing.",
    readmeDesc: "Project documentation: how each simulation works and how to run it.",
    viewSource: "View source →",
    runItYourself: "Run it yourself",
    builtWith: "Built with",
    simsInPython: "simulations in Python",
  },
  es: {
    title: "dinero — Simulaciones de Probabilidad de Lotería",
    tagline: "Simulaciones de probabilidad de lotería — ¿cuánto dinero ganas (o pierdes) realmente jugando?",
    cta: "Explora el proyecto ↓",
    whatsInside: "Qué hay dentro",
    powerballDesc:
      "Simulación de Powerball (EE.UU.): 5 bolas blancas (1–69) + 1 Powerball roja (1–26), $2 por boleto. Compra 100 boletos por sorteo, 2 sorteos por semana, hasta ganar el pozo de $2 mil millones — luego reporta lo gastado vs. lo ganado y el desglose por nivel de premio.",
    binguitoDesc:
      "Simulación del Binguito paraguayo — estructura base. Esperando las reglas reales del juego (bolilleros, tabla de premios, costo del cartón, frecuencia de sorteos) antes de implementarlo.",
    readmeDesc: "Documentación del proyecto: cómo funciona cada simulación y cómo ejecutarla.",
    viewSource: "Ver código →",
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
