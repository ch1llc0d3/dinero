// Interactive Telebingo simulator — browser port of telebingo.py.
// Same rules as the reglamento: cartones with 3 independent series of
// distinct 01–25 numbers. Three sorteos per drawing — GRANDIOSO (12 balls,
// especie placeholders), PODEROSO (12 balls, cash) and DOBLE CHANCE (15
// balls, cash; each column scored separately). Only the highest winning
// tier of a series pays. Runs live until a POZO tier lands (PODEROSO
// 12 hits or DOBLE CHANCE 15 hits) or the user presses "Cash out".
//
// Prize amounts are the same placeholders as telebingo.py — the
// reglamento does not publish amounts. Sorteo frequency assumed weekly
// (52/year), matching the Telebingo TV show cadence.

(function () {
  "use strict";

  var POOL_SIZE = 25;      // numbers 01–25
  var SERIES_SIZE = 15;    // numbers per series (same assumption as telebingo.py)
  var CARTON_SERIES = 3;   // series per cartón
  var SORTEOS_PER_YEAR = 52; // weekly TV show (assumption)

  // Prize tables (Gs.) — placeholders, mirroring telebingo.py.
  var GRANDIOSO_PRIZES = { 12: 0, 11: 0 }; // ESPECIE — valued at 0
  var PODEROSO_PRIZES = {
    12: 50000000, // POZO (divisible)
    11: 5000000,
    10: 1000000,
    9: 500000,
    3: 100000,
    2: 50000,
    1: 25000,
    0: 25000,
  };
  var DOBLE_CHANCE_PRIZES = {
    15: 100000000, // POZO (divisible)
    14: 5000000,
    13: 1000000,
    12: 500000,
  };

  // Tier metadata for the summary table (order = display order).
  var TIERS = [
    { game: "doble_chance", hits: 15, prizes: DOBLE_CHANCE_PRIZES },
    { game: "doble_chance", hits: 14, prizes: DOBLE_CHANCE_PRIZES },
    { game: "doble_chance", hits: 13, prizes: DOBLE_CHANCE_PRIZES },
    { game: "doble_chance", hits: 12, prizes: DOBLE_CHANCE_PRIZES },
    { game: "poderoso", hits: 12, prizes: PODEROSO_PRIZES },
    { game: "poderoso", hits: 11, prizes: PODEROSO_PRIZES },
    { game: "poderoso", hits: 10, prizes: PODEROSO_PRIZES },
    { game: "poderoso", hits: 9,  prizes: PODEROSO_PRIZES },
    { game: "poderoso", hits: 3,  prizes: PODEROSO_PRIZES },
    { game: "poderoso", hits: 2,  prizes: PODEROSO_PRIZES },
    { game: "poderoso", hits: 1,  prizes: PODEROSO_PRIZES },
    { game: "poderoso", hits: 0,  prizes: PODEROSO_PRIZES },
    { game: "grandioso", hits: 12, prizes: GRANDIOSO_PRIZES },
    { game: "grandioso", hits: 11, prizes: GRANDIOSO_PRIZES },
  ];

  // ---------- i18n (kept here so the sim is self-contained) ----------
  var simStrings = {
    en: {
      pozoHit: "🎉 POZO HIT!",
      pozoHitSub: "After {years} years and {sorteos} sorteos, a POZO tier finally landed.",
      pozoHitSub1: "After {years} years and 1 sorteo, a POZO tier finally landed.",
      cashedOut: "🛑 Cashed out early",
      cashedOutSub: "Here's what you walked away with.",
      cartonesPerSorteo: "Cartones per sorteo",
      cartonCost: "Cost per cartón (₲)",
      sorteosPlayed: "Sorteos played",
      timePlaying: "Time playing",
      totalInvested: "Total invested",
      totalEarnings: "Total won",
      netResult: "Net result",
      profit: "PROFIT",
      loss: "LOSS",
      bestSingleWin: "Best single win",
      roi: "Return on spending",
      winsBreakdown: "Prize breakdown",
      game: "Game",
      hits: "Hits",
      wins: "Wins",
      prizeEach: "Prize each",
      tierTotal: "Total won",
      noWins: "Not a single winning series — brutal.",
      grandioso: "GRANDIOSO",
      poderoso: "PODEROSO",
      dobleChance: "DOBLE CHANCE",
      especie: "ESPECIE (in kind)",
      pozo: "POZO (divisible)",
      years: "years",
      sorteos: "sorteos",
      invalidInput: "Cartones must be ≥ 1, cost ≥ ₲1.",
    },
    es: {
      pozoHit: "🎉 ¡CAYÓ EL POZO!",
      pozoHitSub: "Tras {years} años y {sorteos} sorteos, por fin cayó un nivel POZO.",
      pozoHitSub1: "Tras {years} años y 1 sorteo, por fin cayó un nivel POZO.",
      cashedOut: "🛑 Retirado antes de tiempo",
      cashedOutSub: "Esto es lo que te llevas.",
      cartonesPerSorteo: "Cartones por sorteo",
      cartonCost: "Costo por cartón (₲)",
      sorteosPlayed: "Sorteos jugados",
      timePlaying: "Tiempo jugando",
      totalInvested: "Total invertido",
      totalEarnings: "Total ganado",
      netResult: "Resultado neto",
      profit: "GANANCIA",
      loss: "PÉRDIDA",
      bestSingleWin: "Mejor premio único",
      roi: "Retorno sobre lo gastado",
      winsBreakdown: "Desglose de premios",
      game: "Juego",
      hits: "Aciertos",
      wins: "Veces",
      prizeEach: "Premio",
      tierTotal: "Total",
      noWins: "Ni una sola serie ganadora — brutal.",
      grandioso: "GRANDIOSO",
      poderoso: "PODEROSO",
      dobleChance: "DOBLE CHANCE",
      especie: "ESPECIE (en especie)",
      pozo: "POZO (divisible)",
      years: "años",
      sorteos: "sorteos",
      invalidInput: "Los cartones deben ser ≥ 1, el costo ≥ ₲1.",
    },
  };

  var GAME_KEYS = { grandioso: "grandioso", poderoso: "poderoso", doble_chance: "dobleChance" };

  function lang() {
    return document.documentElement.lang === "es" ? "es" : "en";
  }
  function t(key) {
    return simStrings[lang()][key];
  }

  // ---------- formatting ----------
  // Guaraníes: no decimals, dot thousands separator (es-PY style).
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
    var p = n * 100;
    if (Math.abs(p) >= 1000) {
      var sign = p < 0 ? "−" : "+";
      var abs = Math.abs(p);
      if (abs >= 1e9) return sign + trimZeros((abs / 1e9).toFixed(1)) + "B%";
      if (abs >= 1e6) return sign + trimZeros((abs / 1e6).toFixed(1)) + "M%";
      if (abs >= 1e3) return sign + trimZeros((abs / 1e3).toFixed(1)) + "K%";
    }
    return p.toFixed(1) + "%";
  }

  // ---------- helpers (mirror telebingo.py) ----------
  function drawBalls(n) {
    // random.sample(range(1, 26), k=n) equivalent
    var pool = [];
    for (var i = 1; i <= POOL_SIZE; i++) pool.push(i);
    var out = [];
    for (var j = 0; j < n; j++) {
      var idx = Math.floor(Math.random() * pool.length);
      out.push(pool.splice(idx, 1)[0]);
    }
    return out;
  }

  function makeCarton() {
    var carton = [];
    for (var s = 0; s < CARTON_SERIES; s++) {
      carton.push(drawBalls(SERIES_SIZE));
    }
    return carton;
  }

  function countHits(series, balls) {
    var hits = 0;
    for (var i = 0; i < series.length; i++) {
      if (balls.indexOf(series[i]) !== -1) hits++;
    }
    return hits;
  }

  function tierKey(game, hits) {
    return game + ":" + hits;
  }

  // Score one series against one game's drawn balls. Only the highest
  // tier of a series pays — for a single series that is simply its
  // table entry (same as telebingo.py's score_series).
  function scoreSeries(hits, prizeTable) {
    return prizeTable[hits] || 0;
  }

  // ---------- DOM ----------
  var el = {
    cartones: document.getElementById("tb-cartones"),
    cost: document.getElementById("tb-cost"),
    start: document.getElementById("tb-start"),
    stop: document.getElementById("tb-stop"),
    live: document.getElementById("tb-live"),
    liveYears: document.getElementById("tb-live-years"),
    liveDrawings: document.getElementById("tb-live-drawings"),
    liveSpent: document.getElementById("tb-live-spent"),
    liveWon: document.getElementById("tb-live-won"),
    liveNet: document.getElementById("tb-live-net"),
    output: document.getElementById("tb-output"),
    section: document.getElementById("telebingo-sim"),
  };
  if (!el.start) return; // sim section not present

  var running = false;
  var stopRequested = false;
  var state = null;
  var timer = null;

  function resetState(cartones, cost) {
    var timesWon = {};
    TIERS.forEach(function (tier) {
      timesWon[tierKey(tier.game, tier.hits)] = 0;
    });
    return {
      cartones: cartones,
      cost: cost,
      timesWon: timesWon,
      totalSpent: 0,
      earnings: 0,
      bestWin: 0,
      sorteos: 0,
      hitPozo: false,
    };
  }

  function updateLive() {
    el.liveYears.textContent = (state.sorteos / SORTEOS_PER_YEAR).toFixed(1);
    el.liveDrawings.textContent = state.sorteos.toLocaleString("en-US");
    el.liveSpent.textContent = moneyCompact(state.totalSpent);
    el.liveWon.textContent = moneyCompact(state.earnings);
    var net = state.earnings - state.totalSpent;
    el.liveNet.textContent = moneyCompact(net);
    el.liveNet.classList.toggle("net-negative", net < 0);
    el.liveNet.classList.toggle("net-positive", net >= 0);

    // Money rain intensity follows how fast we're burning cash
    if (window.MoneyRain) {
      var burn = state.cartones * state.cost * SORTEOS_PER_YEAR; // ₲ per sim-year
      var rate = Math.min(1, Math.log10(Math.max(burn, 1)) / 9); // ₲1 .. ₲1B+/yr
      window.MoneyRain.setIntensity(rate);
    }
  }

  // One simulated sorteo per tick batch. With the placeholder prize
  // tables a POZO lands every ~380 sorteos at the default 10 cartones
  // (a 12-hit PODEROSO is C(15,12)/C(25,12) ≈ 1 in 11.4k per series),
  // so keep the batch small: ~240 sorteos/sec — live stats stay
  // readable and "Cash out" is reachable before the pozo lands.
  function tick() {
    for (var batch = 0; batch < 4 && !stopRequested; batch++) {
      state.sorteos++;
      state.totalSpent += state.cost * state.cartones;

      var ballsG = drawBalls(12);
      var ballsP = drawBalls(12);
      var ballsD = drawBalls(15);

      for (var c = 0; c < state.cartones; c++) {
        var carton = makeCarton();
        for (var s = 0; s < carton.length; s++) {
          var series = carton[s];

          var hitsG = countHits(series, ballsG);
          var amtG = scoreSeries(hitsG, GRANDIOSO_PRIZES);
          if (amtG) {
            state.earnings += amtG;
            if (amtG > state.bestWin) state.bestWin = amtG;
            state.timesWon[tierKey("grandioso", hitsG)]++;
          }

          var hitsP = countHits(series, ballsP);
          var amtP = scoreSeries(hitsP, PODEROSO_PRIZES);
          if (amtP) {
            state.earnings += amtP;
            if (amtP > state.bestWin) state.bestWin = amtP;
            state.timesWon[tierKey("poderoso", hitsP)]++;
            if (hitsP === 12) state.hitPozo = true;
          }

          // DOBLE CHANCE — each column scored independently
          var hitsD = countHits(series, ballsD);
          var amtD = scoreSeries(hitsD, DOBLE_CHANCE_PRIZES);
          if (amtD) {
            state.earnings += amtD;
            if (amtD > state.bestWin) state.bestWin = amtD;
            state.timesWon[tierKey("doble_chance", hitsD)]++;
            if (hitsD === 15) state.hitPozo = true;
          }
        }
      }

      if (state.hitPozo) break;
    }

    updateLive();

    if (state.hitPozo || stopRequested) {
      finish();
    }
  }

  function finish() {
    clearInterval(timer);
    timer = null;
    running = false;
    el.start.disabled = false;
    el.stop.disabled = true;
    el.cartones.disabled = false;
    el.cost.disabled = false;

    if (state.hitPozo) {
      el.section.classList.add("jackpot");
      if (window.MoneyRain) window.MoneyRain.celebrate();
      // Let the gold rain fall for a moment, then stop it
      setTimeout(function () {
        if (window.MoneyRain) window.MoneyRain.stop();
      }, 5000);
    } else {
      if (window.MoneyRain) window.MoneyRain.stop();
    }
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
    var years = (state.sorteos / SORTEOS_PER_YEAR).toFixed(1);

    var verdictClass = state.hitPozo ? "verdict-jackpot" : net >= 0 ? "verdict-win" : "verdict-loss";
    var sub = state.hitPozo
      ? (state.sorteos === 1 ? t("pozoHitSub1") : t("pozoHitSub"))
          .replace("{years}", years).replace("{sorteos}", state.sorteos.toLocaleString("en-US"))
      : t("cashedOutSub");

    var html = "";
    html += '<div class="verdict ' + verdictClass + '">';
    html += '<span class="verdict-title">' + (state.hitPozo ? t("pozoHit") : t("cashedOut")) + "</span>";
    html += '<span class="verdict-sub">' + sub + "</span>";
    html += "</div>";

    html +=
      '<div class="net-card ' + (net >= 0 ? "net-positive" : "net-negative") + '">' +
      '<span class="net-card-value">' + money(net) + "</span>" +
      '<span class="net-card-label">' + t("netResult") + " · " + (net >= 0 ? t("profit") : t("loss")) + "</span>" +
      "</div>";

    html += '<div class="summary-stats">';
    html += statCard(t("sorteosPlayed"), state.sorteos.toLocaleString("en-US"));
    html += statCard(t("timePlaying"), years + " " + t("years"));
    html += statCard(t("totalInvested"), money(state.totalSpent));
    html += statCard(t("totalEarnings"), money(state.earnings));
    html += statCard(t("bestSingleWin"), money(state.bestWin));
    html += statCard(t("roi"), pct(roi), roi >= 0 ? "sstat-pos" : "sstat-neg");
    html += "</div>";

    // Tier breakdown table
    var rows = "";
    TIERS.forEach(function (tier) {
      var count = state.timesWon[tierKey(tier.game, tier.hits)];
      if (!count) return;
      var prize = tier.prizes[tier.hits];
      var prizeEach = prize === 0 ? t("especie") : money(prize);
      var tierTotal = prize === 0 ? "—" : money(prize * count);
      rows +=
        "<tr>" +
        '<td class="tier-key">' + t(GAME_KEYS[tier.game]) + "</td>" +
        '<td class="num">' + tier.hits + "</td>" +
        '<td class="num">' + count.toLocaleString("en-US") + "</td>" +
        '<td class="num">' + prizeEach + "</td>" +
        '<td class="num">' + tierTotal + "</td>" +
        "</tr>";
    });

    html += '<div class="tier-wrap">';
    html += '<h3 class="tier-heading">' + t("winsBreakdown") + "</h3>";
    if (rows) {
      html +=
        '<table class="tier-table"><thead><tr>' +
        "<th>" + t("game") + "</th><th>" + t("hits") + "</th>" +
        "<th>" + t("wins") + "</th><th>" + t("prizeEach") + "</th>" +
        "<th>" + t("tierTotal") + "</th>" +
        "</tr></thead><tbody>" + rows + "</tbody></table>";
    } else {
      html += '<p class="tier-empty">' + t("noWins") + "</p>";
    }
    html += "</div>";

    el.output.innerHTML = html;
    el.output.hidden = false;
  }

  function readInputs() {
    var cartones = parseInt(el.cartones.value, 10);
    var cost = parseFloat(el.cost.value);
    if (!(cartones >= 1) || !(cost >= 1)) {
      el.output.innerHTML = '<div class="verdict verdict-warn">⚠️ ' + t("invalidInput") + "</div>";
      el.output.hidden = false;
      return null;
    }
    return { cartones: cartones, cost: cost };
  }

  el.start.addEventListener("click", function () {
    if (running) return;
    var inputs = readInputs();
    if (!inputs) return;

    state = resetState(inputs.cartones, inputs.cost);
    stopRequested = false;
    running = true;

    el.start.disabled = true;
    el.stop.disabled = false;
    el.cartones.disabled = true;
    el.cost.disabled = true;

    el.output.hidden = true;
    el.output.innerHTML = "";
    el.live.hidden = false;
    el.section.classList.remove("jackpot");
    el.section.classList.add("sim-running");
    if (window.MoneyRain) window.MoneyRain.start();
    updateLive();

    timer = setInterval(tick, 16);
  });

  el.stop.addEventListener("click", function () {
    if (!running) return;
    stopRequested = true;
  });

  // Re-render the summary when the user switches language mid-run or
  // after a run (same fix as powerball-sim.js).
  var langObserver = new MutationObserver(function () {
    if (!state) return;
    if (!running && !el.output.hidden && el.output.innerHTML) {
      renderSummary();
    }
  });
  langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
})();
