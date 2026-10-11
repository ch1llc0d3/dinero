// Interactive Seneté sim — REAL 2026 RULES (see docs/senete-rules-2026.md).
// Numbers 1–25, no animals. A cartón has two independent 12-number grids
// (GRANDIOSO / PODEROSO) and two independent 15-number grids (DOBLE CHANCE).
// Four jugadas per weekly sorteo; progressive pozos; 8% IRP on prizes
// ≥ ₲500.000. Assumed values (pozo bases, growth, vehicle value) are
// labeled ASSUMED in the UI.

(function () {
  "use strict";

  var POOL = 25;
  var GRIDS_12 = 2;
  var GRIDS_15 = 2;
  var PRICE = 10_000;
  var CARTON_VALUE = 10_000;

  // --- Prize tables (Gs.) — from published 2026 results ---
  var PODEROSO = {
    12: 1_000_000_000, // base; +100M per unwon week (inferred)
    11: 2_000_000,
    10: 50_000,
    9: CARTON_VALUE, 3: CARTON_VALUE, 2: CARTON_VALUE, 1: CARTON_VALUE,
    0: 2_000_000,
  };
  var GRANDIOSO_11 = 2_000_000;
  var DOBLE = { 14: 2_000_000, 13: 50_000, 12: CARTON_VALUE };

  // --- Pozos (ASSUMED bases/growth) ---
  var POZO_BASE = 100_000_000;
  var POZO_GROWTH = 10_000_000;
  var PODEROSO_STEP = 100_000_000;

  // --- Jugada 4: cartones al azar (menu from 2026 draws; vehicle ASSUMED) ---
  var AZAR_P = 116 / 175_000;
  var AZAR_MENU = [];
  for (var i = 0; i < 100; i++) AZAR_MENU.push(500_000);
  for (i = 0; i < 10; i++) AZAR_MENU.push(10_000_000);
  for (i = 0; i < 5; i++) AZAR_MENU.push(20_000_000);
  AZAR_MENU.push(150_000_000); // vehicle, ASSUMED value

  var TAX_THRESHOLD = 500_000;
  var TAX_RATE = 0.08;

  // ---------- i18n (kept here so the sim is self-contained) ----------
  var simStrings = {
    en: {
      cashedOut: "🛑 Cashed out early",
      cashedOutSub: "Here's what you walked away with.",
      cartonesPerSorteo: "Cartones per sorteo (₲10.000 each)",
      weeks: "sorteos (weeks)",
      cartonesPlayed: "cartones played",
      totalInvested: "Total invested",
      totalEarnings: "Total won",
      netResult: "Net result",
      profit: "PROFIT",
      loss: "LOSS",
      roi: "Return on spend",
      bestTier: "Best tier won",
      none: "none",
      grandioso: "GRANDIOSO — 12 of 25",
      poderoso: "PODEROSO — 12 of 25",
      doble: "DOBLE CHANCE — 15 of 25",
      pozo: "POZO",
      jackpot: "JACKPOT",
      pozoNow: "Current pozos",
      grandiosoPozo: "Grandioso POZO",
      doblePozo: "Doble Chance POZO",
      poderosoJackpot: "Poderoso jackpot",
      assumed: "assumed values",
      hitsLabel: "hits",
      zeroHits: "0-hits consolations",
      freeCartons: "free cartons won",
      azarWins: "cartones-al-azar wins",
      invalidInput: "Buy at least 1 cartón per sorteo.",
      taxNote: "8% IRP withheld on prizes ≥ ₲500.000 (Ley 6380/2019).",
    },
    es: {
      cashedOut: "🛑 Retirado antes de tiempo",
      cashedOutSub: "Esto es lo que te llevas.",
      cartonesPerSorteo: "Cartones por sorteo (₲10.000 c/u)",
      weeks: "sorteos (semanas)",
      cartonesPlayed: "cartones jugados",
      totalInvested: "Total invertido",
      totalEarnings: "Total ganado",
      netResult: "Resultado neto",
      profit: "GANANCIA",
      loss: "PÉRDIDA",
      roi: "Retorno sobre lo invertido",
      bestTier: "Mejor tier ganado",
      none: "ninguno",
      grandioso: "GRANDIOSO — 12 de 25",
      poderoso: "PODEROSO — 12 de 25",
      doble: "DOBLE CHANCE — 15 de 25",
      pozo: "POZO",
      jackpot: "JACKPOT",
      pozoNow: "Pozos actuales",
      grandiosoPozo: "POZO Grandioso",
      doblePozo: "POZO Doble Chance",
      poderosoJackpot: "Jackpot Poderoso",
      assumed: "valores supuestos",
      hitsLabel: "aciertos",
      zeroHits: "consolaciones de 0 aciertos",
      freeCartons: "cartones gratis ganados",
      azarWins: "premios cartones al azar",
      invalidInput: "Compra al menos 1 cartón por sorteo.",
      taxNote: "8% de IRP retenido en premios ≥ ₲500.000 (Ley 6380/2019).",
    },
  };

  function lang() {
    return document.documentElement.lang === "es" ? "es" : "en";
  }
  function t(key) {
    return simStrings[lang()][key];
  }

  // ---------- formatting ----------
  function money(n) {
    var sign = n < 0 ? "−" : "";
    return sign + "₲" + Math.abs(Math.round(n)).toLocaleString("es-PY");
  }
  function moneyCompact(n) {
    var abs = Math.abs(n);
    var sign = n < 0 ? "−" : "";
    if (abs >= 1e9) return sign + "₲" + trimZeros((abs / 1e9).toFixed(2)) + "B";
    if (abs >= 1e6) return sign + "₲" + trimZeros((abs / 1e6).toFixed(1)) + "M";
    if (abs >= 1e4) return sign + "₲" + trimZeros((abs / 1e3).toFixed(1)) + "K";
    return money(n);
  }
  function trimZeros(s) {
    return s.replace(/\.?0+$/, "");
  }
  function pct(n) {
    return (n * 100).toFixed(2) + "%";
  }

  // ---------- DOM ----------
  var el = {
    bet: document.getElementById("sn-cartones"),
    start: document.getElementById("sn-start"),
    stop: document.getElementById("sn-stop"),
    draws: document.getElementById("sn-draws"),
    drawG: document.getElementById("sn-balls-g"),
    drawP: document.getElementById("sn-balls-p"),
    drawD: document.getElementById("sn-balls-d"),
    live: document.getElementById("sn-live"),
    liveWeeks: document.getElementById("sn-live-weeks"),
    liveCartones: document.getElementById("sn-live-cartones"),
    liveSpent: document.getElementById("sn-live-spent"),
    liveWon: document.getElementById("sn-live-won"),
    liveNet: document.getElementById("sn-live-net"),
    pozos: document.getElementById("sn-pozos"),
    pozoG: document.getElementById("sn-pozo-g"),
    pozoD: document.getElementById("sn-pozo-d"),
    pozoP: document.getElementById("sn-pozo-p"),
    output: document.getElementById("sn-output"),
  };
  if (!el.drawG) return; // sim section not present

  var running = false;
  var stopRequested = false;
  var state = null;
  var timer = null;

  function sample(n) {
    // Fisher-Yates partial shuffle over 1..25 — fast distinct sample
    var pool = new Array(POOL);
    for (var i = 0; i < POOL; i++) pool[i] = i + 1;
    for (i = 0; i < n; i++) {
      var j = i + Math.floor(Math.random() * (POOL - i));
      var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    return pool.slice(0, n);
  }

  function makeGrid(size) {
    return sample(size);
  }

  function countHits(grid, ballsSet) {
    var hits = 0;
    for (var i = 0; i < grid.length; i++) {
      if (ballsSet.has(grid[i])) hits++;
    }
    return hits;
  }

  function afterTax(amount) {
    return amount >= TAX_THRESHOLD ? Math.round(amount * (1 - TAX_RATE)) : amount;
  }

  function renderBalls(container, balls) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < balls.length; i++) {
      var b = document.createElement("span");
      b.className = "sn-ball";
      b.textContent = String(balls[i]).padStart(2, "0");
      frag.appendChild(b);
    }
    container.replaceChildren(frag);
  }

  // ---------- state ----------
  function resetState(cartones) {
    return {
      cartones: cartones,
      weeks: 0,
      cartonesPlayed: 0,
      totalSpent: 0,
      earnings: 0,
      grandiosoPozo: POZO_BASE,
      doblePozo: POZO_BASE,
      poderosoJackpot: PODEROSO[12],
      tiers: {},          // "jugada:tier" -> count
      bestTier: null,     // {jugada, hits, amount}
      zeroHits: 0,
      freeCartons: 0,
      azarWins: 0,
    };
  }

  function tierKey(jugada, hits) {
    return jugada + ":" + hits;
  }

  function award(st, jugada, hits, amount, isPozo) {
    st.earnings += amount;
    var key = tierKey(jugada, hits);
    st.tiers[key] = (st.tiers[key] || 0) + 1;
    var label = isPozo ? (jugada === "poderoso" ? t("jackpot") : t("pozo"))
      : hits + " " + t("hitsLabel");
    var value = amount;
    if (!st.bestTier || value > st.bestTier.amount) {
      st.bestTier = { jugada: jugada, label: label, amount: value };
    }
  }

  function playWeek(st) {
    st.weeks++;
    st.cartonesPlayed += st.cartones;
    st.totalSpent += st.cartones * PRICE;

    var ballsG = sample(12), ballsP = sample(12), ballsD = sample(15);
    var setG = new Set(ballsG), setP = new Set(ballsP), setD = new Set(ballsD);

    for (var c = 0; c < st.cartones; c++) {
      for (var g = 0; g < GRIDS_12; g++) {
        var grid = makeGrid(12);
        // GRANDIOSO
        var hits = countHits(grid, setG);
        if (hits === 12) {
          award(st, "grandioso", 12, afterTax(st.grandiosoPozo), true);
          st.grandiosoPozo = POZO_BASE;
        } else if (hits === 11) {
          award(st, "grandioso", 11, afterTax(GRANDIOSO_11), false);
        }
        // PODEROSO
        hits = countHits(grid, setP);
        if (hits === 12) {
          award(st, "poderoso", 12, afterTax(st.poderosoJackpot), true);
          st.poderosoJackpot = PODEROSO[12];
        } else if (PODEROSO[hits]) {
          if (hits === 0) st.zeroHits++;
          award(st, "poderoso", hits, afterTax(PODEROSO[hits]), false);
        }
      }
      for (var d = 0; d < GRIDS_15; d++) {
        var grid15 = makeGrid(15);
        var hits15 = countHits(grid15, setD);
        if (hits15 === 15) {
          award(st, "doble", 15, afterTax(st.doblePozo), true);
          st.doblePozo = POZO_BASE;
        } else if (DOBLE[hits15]) {
          if (hits15 === 12) st.freeCartons++;
          award(st, "doble", hits15, afterTax(DOBLE[hits15]), false);
        }
      }
      // Jugada 4 — cartones al azar
      if (Math.random() < AZAR_P) {
        st.azarWins++;
        award(st, "azar", 0, afterTax(AZAR_MENU[Math.floor(Math.random() * AZAR_MENU.length)]), false);
      }
    }

    // Pozos grow when unwon this week
    st.grandiosoPozo += POZO_GROWTH;
    st.doblePozo += POZO_GROWTH;
    st.poderosoJackpot += PODEROSO_STEP;

    renderBalls(el.drawG, ballsG);
    renderBalls(el.drawP, ballsP);
    renderBalls(el.drawD, ballsD);
  }

  function updateLive() {
    el.liveWeeks.textContent = state.weeks.toLocaleString("en-US");
    el.liveCartones.textContent = state.cartonesPlayed.toLocaleString("en-US");
    el.liveSpent.textContent = moneyCompact(state.totalSpent);
    el.liveWon.textContent = moneyCompact(state.earnings);
    var net = state.earnings - state.totalSpent;
    el.liveNet.textContent = moneyCompact(net);
    el.liveNet.classList.toggle("net-negative", net < 0);
    el.liveNet.classList.toggle("net-positive", net >= 0);
    el.pozoG.textContent = moneyCompact(state.grandiosoPozo);
    el.pozoD.textContent = moneyCompact(state.doblePozo);
    el.pozoP.textContent = moneyCompact(state.poderosoJackpot);
  }

  function tick() {
    var batches = state.cartones > 200 ? 1 : 4;
    for (var b = 0; b < batches && !stopRequested; b++) {
      playWeek(state);
    }
    updateLive();
    if (stopRequested) finish();
  }

  function finish() {
    clearInterval(timer);
    timer = null;
    running = false;
    el.start.disabled = false;
    el.stop.disabled = true;
    el.bet.disabled = false;
    renderSummary();
  }

  // ---------- summary rendering ----------
  function statCard(label, value, cls) {
    return (
      '<div class="sstat' + (cls ? " " + cls : "") + '">' +
      '<span class="sstat-value">' + value + "</span>" +
      '<span class="sstat-label">' + label + "</span>" +
      "</div>"
    );
  }

  function renderSummary() {
    var net = state.earnings - state.totalSpent;
    var roi = state.totalSpent > 0 ? net / state.totalSpent : 0;

    var verdictClass = net >= 0 ? "verdict-win" : "verdict-loss";
    var html = "";
    html += '<div class="verdict ' + verdictClass + '">';
    html += '<span class="verdict-title">' + t("cashedOut") + "</span>";
    html += '<span class="verdict-sub">' + t("taxNote") + "</span>";
    html += "</div>";

    html +=
      '<div class="net-card ' + (net >= 0 ? "net-positive" : "net-negative") + '">' +
      '<span class="net-card-value">' + money(net) + "</span>" +
      '<span class="net-card-label">' + t("netResult") + " · " + (net >= 0 ? t("profit") : t("loss")) + "</span>" +
      "</div>";

    html += '<div class="summary-stats">';
    html += statCard(t("weeks"), state.weeks.toLocaleString("en-US"));
    html += statCard(t("cartonesPlayed"), state.cartonesPlayed.toLocaleString("en-US"));
    html += statCard(t("totalInvested"), money(state.totalSpent));
    html += statCard(t("totalEarnings"), money(state.earnings));
    html += statCard(t("roi"), pct(roi), roi >= 0 ? "sstat-pos" : "sstat-neg");
    html += statCard(t("bestTier"), state.bestTier ? state.bestTier.label + " · " + moneyCompact(state.bestTier.amount) : t("none"));
    if (state.zeroHits) html += statCard(t("zeroHits"), state.zeroHits.toLocaleString("en-US"));
    if (state.freeCartons) html += statCard(t("freeCartons"), state.freeCartons.toLocaleString("en-US"));
    if (state.azarWins) html += statCard(t("azarWins"), state.azarWins.toLocaleString("en-US"));
    html += "</div>";

    // per-jugada tier breakdown
    var keys = Object.keys(state.tiers).sort();
    if (keys.length) {
      html += '<div class="summary-stats">';
      keys.forEach(function (k) {
        var parts = k.split(":");
        var jugada = parts[0], hits = parts[1];
        var name = jugada === "grandioso" ? t("grandioso") : jugada === "poderoso" ? t("poderoso") : jugada === "doble" ? t("doble") : "Cartones al azar";
        html += statCard(name, state.tiers[k].toLocaleString("en-US") + " × " + (hits === "0" && jugada === "azar" ? "" : hits + " " + t("hitsLabel")));
      });
      html += "</div>";
    }

    html += '<p class="tier-empty">' + t("assumed") + "</p>";

    el.output.innerHTML = html;
    el.output.hidden = false;
  }

  function readInputs() {
    var cartones = parseInt(el.bet.value, 10);
    if (!(cartones >= 1)) {
      el.output.innerHTML = '<div class="verdict verdict-warn">⚠️ ' + t("invalidInput") + "</div>";
      el.output.hidden = false;
      return null;
    }
    return { cartones: Math.min(cartones, 500) };
  }

  el.start.addEventListener("click", function () {
    if (running) return;
    var inputs = readInputs();
    if (!inputs) return;

    state = resetState(inputs.cartones);
    stopRequested = false;
    running = true;

    el.start.disabled = true;
    el.stop.disabled = false;
    el.bet.disabled = true;

    el.output.hidden = true;
    el.output.innerHTML = "";
    el.live.hidden = false;
    el.draws.hidden = false;
    el.pozos.hidden = false;
    updateLive();

    timer = setInterval(tick, 16);
  });

  el.stop.addEventListener("click", function () {
    if (!running) return;
    stopRequested = true;
  });

  // Re-render the summary when the user switches language after a run
  // (same fix as powerball-sim.js / telebingo-sim.js).
  var langObserver = new MutationObserver(function () {
    if (!state) return;
    if (!running && !el.output.hidden && el.output.innerHTML) {
      renderSummary();
    }
  });
  langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
})();
