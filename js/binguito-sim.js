// Interactive Binguito sim — Telebingo Triple (Talismán S.A.), REAL 2026 RULES
// (see docs/telebingo-triple-rules-2026.md). "Binguito" is the nickname of
// Armando Acosta, the popular presenter of Telebingo Triple.
// Numbers 1–25. A cartón (₲10.000) has four scoring grids — 12, 13, 15 and
// 15 numbers. Four cantadas per weekly sorteo (1RA / 2DA / 3RA / REVENTÓN)
// plus El Dúo. 8% IRP on cash prizes ≥ ₲500.000. Assumed values (cartones
// sold, vehicle value) are labeled ASSUMED in the UI.

(function () {
  "use strict";

  var POOL = 25;
  var PRICE = 10_000;

  // --- Pozos — published values, sorteo del 18-10-2026 ---
  var POZO_1RA = 900_000_000;
  var POZO_2DA = 650_000_000;
  var POZO_3RA = 500_000_000;
  var POZO_REVENTON = 250_000_000;
  var VEHICLE_VALUE = 150_000_000; // ASSUMED (Citroën C4 Cactus, especie)

  // --- Fixed prize tables (Gs.) — from the reglamento ---
  var PRIZES_1RA = { 11: 2_200_000, 10: 50_000, 9: 10_000 };
  var PRIZES_2DA = { 12: 2_200_000, 11: 50_000, 10: 10_000 };
  var PRIZES_3RA = { 14: 2_200_000, 13: 50_000, 12: 10_000 };
  var PRIZES_REVENTON = { 13: 50_000, 12: 10_000 };

  // --- El Dúo ---
  var DUO_EXACT_PRIZE = 10_000_000;
  var DUO_ENDING_PRIZE = 50_000;

  // --- ASSUMED cartones sold per sorteo (drives sale-o-sale + Dúo odds) ---
  var ASSUMED_SOLD = 100_000;

  var TAX_THRESHOLD = 500_000;
  var TAX_RATE = 0.08;

  // REVENTÓN sale-o-sale: a 14-hit cartón takes the pozo only when no
  // other sold cartón scores 14+ (the pozo goes to the best scorer(s)).
  var COMB_25_15 = 3_268_760;
  var P14_TAKES_POZO = Math.pow(
    1 - (150 / COMB_25_15) - (1 / COMB_25_15),
    ASSUMED_SOLD - 1
  );

  // ---------- i18n (kept here so the sim is self-contained) ----------
  var simStrings = {
    en: {
      cashedOut: "🛑 Cashed out early",
      cashedOutSub: "Here's what you walked away with.",
      cartonesPerSorteo: "Cartones per sorteo (₲10.000 each)",
      sorteos: "sorteos (weeks)",
      cartonesPlayed: "cartones played",
      totalInvested: "Total invested",
      totalEarnings: "Total won",
      netResult: "Net result",
      profit: "PROFIT",
      loss: "LOSS",
      roi: "Return on spend",
      bestTier: "Best tier won",
      none: "none",
      cantada1: "1RA. CANTADA — 12 of 25",
      cantada2: "2DA. CANTADA — 13 of 25",
      cantada3: "3RA. CANTADA — 15 of 25",
      reventon: "REVENTÓN — 15 of 25",
      pozo: "POZO",
      pozo1: "1RA POZO",
      pozo2: "2DA POZO",
      pozo3: "3RA POZO + vehicle",
      pozoR: "REVENTÓN (sale o sale)",
      assumed: "assumed values",
      hitsLabel: "hits",
      duoExact: "El Dúo — exact cartón",
      duoEnding: "El Dúo — ending matches",
      invalidInput: "Buy at least 1 cartón per sorteo.",
      taxNote: "8% IRP withheld on cash prizes ≥ ₲500.000 (Ley 6380/19).",
    },
    es: {
      cashedOut: "🛑 Retirado antes de tiempo",
      cashedOutSub: "Esto es lo que te llevas.",
      cartonesPerSorteo: "Cartones por sorteo (₲10.000 c/u)",
      sorteos: "sorteos (semanas)",
      cartonesPlayed: "cartones jugados",
      totalInvested: "Total invertido",
      totalEarnings: "Total ganado",
      netResult: "Resultado neto",
      profit: "GANANCIA",
      loss: "PÉRDIDA",
      roi: "Retorno sobre lo invertido",
      bestTier: "Mejor tier ganado",
      none: "ninguno",
      cantada1: "1RA. CANTADA — 12 de 25",
      cantada2: "2DA. CANTADA — 13 de 25",
      cantada3: "3RA. CANTADA — 15 de 25",
      reventon: "REVENTÓN — 15 de 25",
      pozo: "POZO",
      pozo1: "POZO 1RA",
      pozo2: "POZO 2DA",
      pozo3: "POZO 3RA + vehículo",
      pozoR: "REVENTÓN (sale o sale)",
      assumed: "valores supuestos",
      hitsLabel: "aciertos",
      duoExact: "El Dúo — cartón exacto",
      duoEnding: "El Dúo — terminaciones",
      invalidInput: "Compra al menos 1 cartón por sorteo.",
      taxNote: "8% de IRP retenido en premios en efectivo ≥ ₲500.000 (Ley 6380/19).",
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
    bet: document.getElementById("bg-cartones"),
    start: document.getElementById("bg-start"),
    stop: document.getElementById("bg-stop"),
    draws: document.getElementById("bg-draws"),
    ball1: document.getElementById("bg-balls-1"),
    ball2: document.getElementById("bg-balls-2"),
    ball3: document.getElementById("bg-balls-3"),
    ballR: document.getElementById("bg-balls-r"),
    live: document.getElementById("bg-live"),
    liveSorteos: document.getElementById("bg-live-sorteos"),
    liveCartones: document.getElementById("bg-live-cartones"),
    liveSpent: document.getElementById("bg-live-spent"),
    liveWon: document.getElementById("bg-live-won"),
    liveNet: document.getElementById("bg-live-net"),
    pozos: document.getElementById("bg-pozos"),
    output: document.getElementById("bg-output"),
  };
  if (!el.ball1) return; // sim section not present

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
      sorteos: 0,
      cartonesPlayed: 0,
      totalSpent: 0,
      earnings: 0,
      tiers: {},          // "jugada:tier" -> count
      bestTier: null,     // {label, amount}
      duoExact: 0,
      duoEnding: 0,
    };
  }

  function tierKey(jugada, hits) {
    return jugada + ":" + hits;
  }

  var JUGADA_NAMES = {
    "1ra": "cantada1",
    "2da": "cantada2",
    "3ra": "cantada3",
    "reventon": "reventon",
  };

  function award(st, jugada, hits, amount, labelOverride) {
    st.earnings += amount;
    var key = tierKey(jugada, hits);
    st.tiers[key] = (st.tiers[key] || 0) + 1;
    var label = labelOverride || (hits + " " + t("hitsLabel"));
    if (!st.bestTier || amount > st.bestTier.amount) {
      st.bestTier = { jugada: jugada, label: label, amount: amount };
    }
  }

  function playSorteo(st) {
    st.sorteos++;
    st.cartonesPlayed += st.cartones;
    st.totalSpent += st.cartones * PRICE;

    var balls1 = sample(12), balls2 = sample(13);
    var balls3 = sample(15), ballsR = sample(15);
    var set1 = new Set(balls1), set2 = new Set(balls2);
    var set3 = new Set(balls3), setR = new Set(ballsR);

    for (var c = 0; c < st.cartones; c++) {
      // 1RA. CANTADA (12-number grid)
      var grid = sample(12);
      var hits = countHits(grid, set1);
      if (hits === 12) {
        award(st, "1ra", 12, afterTax(POZO_1RA), t("pozo"));
      } else if (PRIZES_1RA[hits]) {
        award(st, "1ra", hits, afterTax(PRIZES_1RA[hits]));
      }

      // 2DA. CANTADA (13-number grid)
      grid = sample(13);
      hits = countHits(grid, set2);
      if (hits === 13) {
        award(st, "2da", 13, afterTax(POZO_2DA), t("pozo"));
      } else if (PRIZES_2DA[hits]) {
        award(st, "2da", hits, afterTax(PRIZES_2DA[hits]));
      }

      // 3RA. CANTADA (15-number grid) — pozo + vehicle on 15 hits
      grid = sample(15);
      hits = countHits(grid, set3);
      if (hits === 15) {
        award(st, "3ra", 15, afterTax(POZO_3RA) + VEHICLE_VALUE, t("pozo") + " + 🚗");
      } else if (PRIZES_3RA[hits]) {
        award(st, "3ra", hits, afterTax(PRIZES_3RA[hits]));
      }

      // REVENTÓN (15-number grid) — sale o sale: best scorers take the
      // pozo; only the highest tier of the cartón pays.
      grid = sample(15);
      hits = countHits(grid, setR);
      if (hits === 15) {
        award(st, "reventon", 15, afterTax(POZO_REVENTON), t("pozo"));
      } else if (hits === 14) {
        if (Math.random() < P14_TAKES_POZO) {
          award(st, "reventon", 14, afterTax(POZO_REVENTON), t("pozo") + " (sale o sale)");
        } else {
          award(st, "reventon", 14, afterTax(2_200_000));
        }
      } else if (PRIZES_REVENTON[hits]) {
        award(st, "reventon", hits, afterTax(PRIZES_REVENTON[hits]));
      }

      // EL DÚO — exact cartón number + last-two-digits matches
      if (Math.random() < 1 / ASSUMED_SOLD) {
        st.duoExact++;
        award(st, "duo", 0, afterTax(DUO_EXACT_PRIZE), t("duoExact"));
      }
      if (Math.random() < 1 / 100) {
        st.duoEnding++;
        st.earnings += DUO_ENDING_PRIZE; // below the tax threshold
      }
    }

    renderBalls(el.ball1, balls1);
    renderBalls(el.ball2, balls2);
    renderBalls(el.ball3, balls3);
    renderBalls(el.ballR, ballsR);
  }

  function updateLive() {
    el.liveSorteos.textContent = state.sorteos.toLocaleString("en-US");
    el.liveCartones.textContent = state.cartonesPlayed.toLocaleString("en-US");
    el.liveSpent.textContent = moneyCompact(state.totalSpent);
    el.liveWon.textContent = moneyCompact(state.earnings);
    var net = state.earnings - state.totalSpent;
    el.liveNet.textContent = moneyCompact(net);
    el.liveNet.classList.toggle("net-negative", net < 0);
    el.liveNet.classList.toggle("net-positive", net >= 0);
  }

  function tick() {
    var batches = state.cartones > 200 ? 1 : 4;
    for (var b = 0; b < batches && !stopRequested; b++) {
      playSorteo(state);
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
    html += statCard(t("sorteos"), state.sorteos.toLocaleString("en-US"));
    html += statCard(t("cartonesPlayed"), state.cartonesPlayed.toLocaleString("en-US"));
    html += statCard(t("totalInvested"), money(state.totalSpent));
    html += statCard(t("totalEarnings"), money(state.earnings));
    html += statCard(t("roi"), pct(roi), roi >= 0 ? "sstat-pos" : "sstat-neg");
    html += statCard(t("bestTier"), state.bestTier ? state.bestTier.label + " · " + moneyCompact(state.bestTier.amount) : t("none"));
    if (state.duoExact) html += statCard(t("duoExact"), state.duoExact.toLocaleString("en-US"));
    if (state.duoEnding) html += statCard(t("duoEnding"), state.duoEnding.toLocaleString("en-US"));
    html += "</div>";

    // per-cantada tier breakdown
    var keys = Object.keys(state.tiers).sort();
    if (keys.length) {
      html += '<div class="summary-stats">';
      keys.forEach(function (k) {
        var parts = k.split(":");
        var jugada = parts[0], hits = parts[1];
        var name = JUGADA_NAMES[jugada] ? t(JUGADA_NAMES[jugada]) : "El Dúo";
        html += statCard(name, state.tiers[k].toLocaleString("en-US") + " × " + (hits === "0" ? "" : hits + " " + t("hitsLabel")));
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
  // (same fix as powerball-sim.js / telebingo-sim.js / senete-sim.js).
  var langObserver = new MutationObserver(function () {
    if (!state) return;
    if (!running && !el.output.hidden && el.output.innerHTML) {
      renderSummary();
    }
  });
  langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
})();
