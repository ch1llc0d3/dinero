// Interactive Powerball simulator — browser port of powerball.py.
// Same rules as the real 2026 game: 5 white balls (1-69) + 1 red Powerball
// (1-26), $2/ticket, drawings every Mon/Wed/Sat (156/year). Jackpot starts
// at $20M and rolls over; all-time record $2.04B. Runs live in the page
// until the jackpot is hit or the user presses "Cash out".

(function () {
  "use strict";

  var WHITE_MAX = 69;
  var RED_MAX = 26;
  var DRAWINGS_PER_YEAR = 156; // Mon + Wed + Sat, every week

  // Real 2026 Powerball prize table (fixed non-jackpot tiers).
  var TIERS = [
    { key: "5+P", whites: 5, red: true,  prize: null },      // jackpot
    { key: "5",   whites: 5, red: false, prize: 1000000 },
    { key: "4+P", whites: 4, red: true,  prize: 50000 },
    { key: "4",   whites: 4, red: false, prize: 100 },
    { key: "3+P", whites: 3, red: true,  prize: 100 },
    { key: "3",   whites: 3, red: false, prize: 7 },
    { key: "2+P", whites: 2, red: true,  prize: 7 },
    { key: "1+P", whites: 1, red: true,  prize: 4 },
    { key: "P",   whites: 0, red: true,  prize: 4 },
    { key: "0",   whites: 0, red: false, prize: 0 },
  ];

  // ---------- i18n (kept here so the sim is self-contained) ----------
  var simStrings = {
    en: {
      jackpotHit: "🎉 JACKPOT HIT!",
      jackpotHitSub: "After {years} years and {drawings} drawings, the jackpot finally landed.",
      jackpotHitSub1: "After {years} years and 1 drawing, the jackpot finally landed.",
      cashedOut: "🛑 Cashed out early",
      cashedOutSub: "Here's what you walked away with.",
      ticketsPerDrawing: "Tickets per drawing",
      ticketCost: "Cost per ticket",
      drawingsPlayed: "Drawings played",
      timePlaying: "Time playing",
      totalInvested: "Total invested",
      totalEarnings: "Total won",
      netResult: "Net result",
      profit: "PROFIT",
      loss: "LOSS",
      bestSingleWin: "Best single win",
      roi: "Return on spending",
      winsBreakdown: "Prize breakdown",
      tier: "Tier",
      match: "Match",
      wins: "Wins",
      prizeEach: "Prize each",
      tierTotal: "Total won",
      jackpotLabel: "Jackpot",
      noWins: "No winning tickets at all — brutal.",
      match5PB: "5 + Powerball",
      match5: "5 whites",
      match4PB: "4 + Powerball",
      match4: "4 whites",
      match3PB: "3 + Powerball",
      match3: "3 whites",
      match2PB: "2 + Powerball",
      match1PB: "1 + Powerball",
      matchP: "Powerball only",
      match0: "No match",
      years: "years",
      drawings: "drawings",
      invalidInput: "Tickets must be ≥ 1, cost ≥ $0.01, jackpot ≥ $1,000,000.",
    },
    es: {
      jackpotHit: "🎉 ¡GANASTE EL POZO!",
      jackpotHitSub: "Tras {years} años y {drawings} sorteos, el pozo por fin cayó.",
      jackpotHitSub1: "Tras {years} años y 1 sorteo, el pozo por fin cayó.",
      cashedOut: "🛑 Retirado antes de tiempo",
      cashedOutSub: "Esto es lo que te llevas.",
      ticketsPerDrawing: "Boletos por sorteo",
      ticketCost: "Costo por boleto",
      drawingsPlayed: "Sorteos jugados",
      timePlaying: "Tiempo jugando",
      totalInvested: "Total invertido",
      totalEarnings: "Total ganado",
      netResult: "Resultado neto",
      profit: "GANANCIA",
      loss: "PÉRDIDA",
      bestSingleWin: "Mejor premio único",
      roi: "Retorno sobre lo gastado",
      winsBreakdown: "Desglose de premios",
      tier: "Nivel",
      match: "Aciertos",
      wins: "Veces",
      prizeEach: "Premio",
      tierTotal: "Total",
      jackpotLabel: "Pozo",
      noWins: "Ni un solo boleto ganador — brutal.",
      match5PB: "5 + Powerball",
      match5: "5 blancas",
      match4PB: "4 + Powerball",
      match4: "4 blancas",
      match3PB: "3 + Powerball",
      match3: "3 blancas",
      match2PB: "2 + Powerball",
      match1PB: "1 + Powerball",
      matchP: "Solo Powerball",
      match0: "Sin aciertos",
      years: "años",
      drawings: "sorteos",
      invalidInput: "Los boletos deben ser ≥ 1, el costo ≥ $0.01, el pozo ≥ $1,000,000.",
    },
  };

  var MATCH_KEYS = {
    "5+P": "match5PB", "5": "match5", "4+P": "match4PB", "4": "match4",
    "3+P": "match3PB", "3": "match3", "2+P": "match2PB", "1+P": "match1PB",
    "P": "matchP", "0": "match0",
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
    return sign + "$" + Math.abs(Math.round(n)).toLocaleString("en-US");
  }

  // Compact money for big numbers: $2.04B, $600M, $20M
  function moneyCompact(n) {
    var abs = Math.abs(n);
    var sign = n < 0 ? "−" : "";
    if (abs >= 1e9) return sign + "$" + trimZeros((abs / 1e9).toFixed(2)) + "B";
    if (abs >= 1e6) return sign + "$" + trimZeros((abs / 1e6).toFixed(1)) + "M";
    if (abs >= 1e4) return sign + "$" + trimZeros((abs / 1e3).toFixed(1)) + "K";
    return money(n);
  }
  function trimZeros(s) {
    return s.replace(/\.?0+$/, "");
  }

  function pct(n) {
    var p = n * 100;
    if (Math.abs(p) >= 1000) {
      // Absurd ROI (e.g. hit the jackpot on ticket #1) — abbreviate
      var sign = p < 0 ? "−" : "+";
      var abs = Math.abs(p);
      if (abs >= 1e9) return sign + trimZeros((abs / 1e9).toFixed(1)) + "B%";
      if (abs >= 1e6) return sign + trimZeros((abs / 1e6).toFixed(1)) + "M%";
      if (abs >= 1e3) return sign + trimZeros((abs / 1e3).toFixed(1)) + "K%";
    }
    return p.toFixed(1) + "%";
  }

  // ---------- helpers (mirror powerball.py) ----------
  function sampleWhites() {
    // random.sample(range(1, 70), k=5) equivalent
    var pool = [];
    for (var i = 1; i <= WHITE_MAX; i++) pool.push(i);
    var out = [];
    for (var j = 0; j < 5; j++) {
      var idx = Math.floor(Math.random() * pool.length);
      out.push(pool.splice(idx, 1)[0]);
    }
    return out;
  }

  function calcWinAmt(myWhites, myRed, winWhites, winRed, timesWon, jackpot) {
    var winAmt = 0;
    var isJackpot = false;

    var whiteMatches = 0;
    for (var i = 0; i < 5; i++) {
      if (winWhites.indexOf(myWhites[i]) !== -1) whiteMatches++;
    }
    var powerMatch = myRed === winRed;

    if (whiteMatches === 5) {
      if (powerMatch) {
        winAmt = jackpot;
        isJackpot = true;
        timesWon["5+P"]++;
      } else {
        winAmt = 1000000;
        timesWon["5"]++;
      }
    } else if (whiteMatches === 4) {
      if (powerMatch) { winAmt = 50000; timesWon["4+P"]++; }
      else { winAmt = 100; timesWon["4"]++; }
    } else if (whiteMatches === 3) {
      if (powerMatch) { winAmt = 100; timesWon["3+P"]++; }
      else { winAmt = 7; timesWon["3"]++; }
    } else if (whiteMatches === 2 && powerMatch) {
      winAmt = 7; timesWon["2+P"]++;
    } else if (whiteMatches === 1 && powerMatch) {
      winAmt = 4; timesWon["1+P"]++;
    } else if (powerMatch) {
      winAmt = 4; timesWon["P"]++;
    } else {
      timesWon["0"]++;
    }

    return { winAmt: winAmt, isJackpot: isJackpot };
  }

  // ---------- DOM ----------
  var el = {
    tickets: document.getElementById("sim-tickets"),
    cost: document.getElementById("sim-cost"),
    jackpot: document.getElementById("sim-jackpot"),
    presets: document.getElementById("sim-presets"),
    start: document.getElementById("sim-start"),
    stop: document.getElementById("sim-stop"),
    live: document.getElementById("sim-live"),
    liveYears: document.getElementById("sim-live-years"),
    liveDrawings: document.getElementById("sim-live-drawings"),
    liveSpent: document.getElementById("sim-live-spent"),
    liveWon: document.getElementById("sim-live-won"),
    liveNet: document.getElementById("sim-live-net"),
    output: document.getElementById("sim-output"),
    section: document.getElementById("powerball-sim"),
  };
  if (!el.start) return; // sim section not present

  var running = false;
  var stopRequested = false;
  var state = null;
  var timer = null;

  function resetState(ticketsPerDrawing, ticketCost, jackpot) {
    var timesWon = {};
    TIERS.forEach(function (tier) { timesWon[tier.key] = 0; });
    return {
      ticketsPerDrawing: ticketsPerDrawing,
      ticketCost: ticketCost,
      jackpot: jackpot,
      timesWon: timesWon,
      totalSpent: 0,
      earnings: 0,
      bestWin: 0,
      drawings: 0,
      hitJackpot: false,
    };
  }

  function updateLive() {
    el.liveYears.textContent = (state.drawings / DRAWINGS_PER_YEAR).toFixed(1);
    el.liveDrawings.textContent = state.drawings.toLocaleString("en-US");
    el.liveSpent.textContent = moneyCompact(state.totalSpent);
    el.liveWon.textContent = moneyCompact(state.earnings);
    var net = state.earnings - state.totalSpent;
    el.liveNet.textContent = moneyCompact(net);
    el.liveNet.classList.toggle("net-negative", net < 0);
    el.liveNet.classList.toggle("net-positive", net >= 0);

    // Money rain intensity follows how fast we're burning cash
    if (window.MoneyRain) {
      var burn = state.ticketsPerDrawing * state.ticketCost * 156; // $ per sim-year
      var rate = Math.min(1, Math.log10(Math.max(burn, 1)) / 6); // $1 .. $1M+/yr
      window.MoneyRain.setIntensity(rate);
    }
  }

  // One simulated drawing per tick, a few ticks per frame — fast enough
  // to reach a $2B jackpot in seconds, slow enough to watch.
  function tick() {
    for (var batch = 0; batch < 12 && !stopRequested; batch++) {
      state.drawings++;
      var winWhites = sampleWhites();
      var winRed = 1 + Math.floor(Math.random() * RED_MAX);

      for (var i = 0; i < state.ticketsPerDrawing; i++) {
        state.totalSpent += state.ticketCost;
        var myWhites = sampleWhites();
        var myRed = 1 + Math.floor(Math.random() * RED_MAX);
        var res = calcWinAmt(myWhites, myRed, winWhites, winRed, state.timesWon, state.jackpot);
        state.earnings += res.winAmt;
        if (res.winAmt > state.bestWin) state.bestWin = res.winAmt;
        if (res.isJackpot) {
          state.hitJackpot = true;
          break;
        }
      }

      if (state.hitJackpot) break;
    }

    updateLive();

    if (state.hitJackpot || stopRequested) {
      finish();
    }
  }

  function finish() {
    clearInterval(timer);
    timer = null;
    running = false;
    el.start.disabled = false;
    el.stop.disabled = true;
    el.tickets.disabled = false;
    el.cost.disabled = false;
    el.jackpot.disabled = false;

    if (state.hitJackpot) {
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

  // ---------- summary rendering (real cards, not ASCII art) ----------
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
    var years = (state.drawings / DRAWINGS_PER_YEAR).toFixed(1);

    var verdictClass = state.hitJackpot ? "verdict-jackpot" : net >= 0 ? "verdict-win" : "verdict-loss";
    var sub = state.hitJackpot
      ? (state.drawings === 1 ? t("jackpotHitSub1") : t("jackpotHitSub"))
          .replace("{years}", years).replace("{drawings}", state.drawings.toLocaleString("en-US"))
      : t("cashedOutSub");

    var html = "";
    html += '<div class="verdict ' + verdictClass + '">';
    html += '<span class="verdict-title">' + (state.hitJackpot ? t("jackpotHit") : t("cashedOut")) + "</span>";
    html += '<span class="verdict-sub">' + sub + "</span>";
    html += "</div>";

    // Net result — the headline number
    html +=
      '<div class="net-card ' + (net >= 0 ? "net-positive" : "net-negative") + '">' +
      '<span class="net-card-value">' + money(net) + "</span>" +
      '<span class="net-card-label">' + t("netResult") + " · " + (net >= 0 ? t("profit") : t("loss")) + "</span>" +
      "</div>";

    // Stat grid
    html += '<div class="summary-stats">';
    html += statCard(t("drawingsPlayed"), state.drawings.toLocaleString("en-US"));
    html += statCard(t("timePlaying"), years + " " + t("years"));
    html += statCard(t("totalInvested"), money(state.totalSpent));
    html += statCard(t("totalEarnings"), money(state.earnings));
    html += statCard(t("bestSingleWin"), money(state.bestWin));
    html += statCard(t("roi"), pct(roi), roi >= 0 ? "sstat-pos" : "sstat-neg");
    html += "</div>";

    // Tier breakdown table
    var rows = "";
    TIERS.forEach(function (tier) {
      var count = state.timesWon[tier.key];
      if (!count) return;
      var prizeEach = tier.prize === null ? t("jackpotLabel") : money(tier.prize);
      var tierTotal = tier.prize === null ? money(state.jackpot) : money(tier.prize * count);
      rows +=
        "<tr>" +
        '<td class="tier-key">' + tier.key + "</td>" +
        "<td>" + t(MATCH_KEYS[tier.key]) + "</td>" +
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
        "<th>" + t("tier") + "</th><th>" + t("match") + "</th>" +
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
    var tickets = parseInt(el.tickets.value, 10);
    var cost = parseFloat(el.cost.value);
    var jackpot = parseFloat(el.jackpot.value);
    if (!(tickets >= 1) || !(cost >= 0.01) || !(jackpot >= 1000000)) {
      el.output.innerHTML = '<div class="verdict verdict-warn">⚠️ ' + t("invalidInput") + "</div>";
      el.output.hidden = false;
      return null;
    }
    return { tickets: tickets, cost: cost, jackpot: jackpot };
  }

  // ---------- jackpot preset chips ----------
  if (el.presets) {
    el.presets.addEventListener("click", function (e) {
      var chip = e.target.closest(".preset-chip");
      if (!chip || running) return;
      el.jackpot.value = chip.getAttribute("data-jackpot");
      el.presets.querySelectorAll(".preset-chip").forEach(function (c) {
        c.classList.toggle("active", c === chip);
      });
      el.jackpot.focus();
    });
    el.jackpot.addEventListener("input", function () {
      el.presets.querySelectorAll(".preset-chip").forEach(function (c) {
        c.classList.toggle("active", c.getAttribute("data-jackpot") === el.jackpot.value);
      });
    });
  }

  el.start.addEventListener("click", function () {
    if (running) return;
    var inputs = readInputs();
    if (!inputs) return;

    state = resetState(inputs.tickets, inputs.cost, inputs.jackpot);
    stopRequested = false;
    running = true;

    el.start.disabled = true;
    el.stop.disabled = false;
    el.tickets.disabled = true;
    el.cost.disabled = true;
    el.jackpot.disabled = true;
    if (el.presets) {
      el.presets.querySelectorAll(".preset-chip").forEach(function (c) {
        c.classList.add("disabled");
      });
    }

    el.output.hidden = true;
    el.output.innerHTML = "";
    el.live.hidden = false;
    el.section.classList.remove("jackpot");
    el.section.classList.add("sim-running");
    updateLive();

    if (window.MoneyRain) window.MoneyRain.start();

    timer = setInterval(tick, 16);
  });

  el.stop.addEventListener("click", function () {
    if (!running) return;
    stopRequested = true;
  });

  // Re-render live labels + summary when the user switches language
  // mid-run or after a run (fixes the mixed EN/ES output).
  var langObserver = new MutationObserver(function () {
    if (!state) return;
    // Live bar labels are static [data-i18n] nodes — main.js retranslates
    // them; here we only refresh the summary, which JS rendered.
    if (!running && !el.output.hidden && el.output.innerHTML) {
      renderSummary();
    }
  });
  langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
})();
