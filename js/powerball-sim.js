// Interactive Powerball simulator — browser port of powerball.py.
// Same rules: 5 white balls (1-69) + 1 red Powerball (1-26), drawings
// twice a week (156/year). Runs live in the page until the jackpot is
// hit or the user presses "Cash out".

(function () {
  "use strict";

  var WHITE_MAX = 69;
  var RED_MAX = 26;
  var DRAWINGS_PER_YEAR = 156;

  var TICKET_TIERS = ["5+P", "5", "4+P", "4", "3+P", "3", "2+P", "1+P", "P", "0"];

  // ---------- i18n (kept here so the sim is self-contained) ----------
  var simStrings = {
    en: {
      jackpotHit: "🎉 JACKPOT HIT! 🎉",
      cashedOut: "🛑 Cashed out early — here's what you have.",
      ticketsPerDrawing: "Tickets per drawing",
      ticketCost: "Ticket cost",
      drawingsPlayed: "Drawings played",
      timePlaying: "Time playing",
      totalInvested: "Total invested",
      totalEarnings: "Total earnings",
      netResult: "Net result",
      profit: "PROFIT",
      loss: "LOSS",
      bestSingleWin: "Best single win",
      winsBreakdown: "Wins breakdown",
      years: "years",
      drawings: "drawings",
      spent: "spent",
      won: "won",
      net: "net",
      invalidInput: "Tickets must be ≥ 1, cost ≥ $0.01, jackpot ≥ $1,000,000.",
      running: "Running…",
    },
    es: {
      jackpotHit: "🎉 ¡GANASTE EL POZO! 🎉",
      cashedOut: "🛑 Retirado antes de tiempo — esto es lo que tienes.",
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
      winsBreakdown: "Desglose de premios",
      years: "años",
      drawings: "sorteos",
      spent: "gastado",
      won: "ganado",
      net: "neto",
      invalidInput: "Los boletos deben ser ≥ 1, el costo ≥ $0.01, el pozo ≥ $1,000,000.",
      running: "Ejecutando…",
    },
  };

  function t(key) {
    var lang = document.documentElement.lang === "es" ? "es" : "en";
    return simStrings[lang][key];
  }

  // ---------- helpers (mirror powerball.py) ----------
  function money(n) {
    var sign = n < 0 ? "-" : "";
    return sign + "$" + Math.abs(Math.round(n)).toLocaleString("en-US");
  }

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
    start: document.getElementById("sim-start"),
    stop: document.getElementById("sim-stop"),
    live: document.getElementById("sim-live"),
    liveYears: document.getElementById("sim-live-years"),
    liveDrawings: document.getElementById("sim-live-drawings"),
    liveSpent: document.getElementById("sim-live-spent"),
    liveWon: document.getElementById("sim-live-won"),
    liveNet: document.getElementById("sim-live-net"),
    output: document.getElementById("sim-output"),
  };
  if (!el.start) return; // sim section not present

  var running = false;
  var stopRequested = false;
  var state = null;
  var timer = null;

  function resetState(ticketsPerDrawing, ticketCost, jackpot) {
    var timesWon = {};
    TICKET_TIERS.forEach(function (tier) { timesWon[tier] = 0; });
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
    var years = state.drawings / DRAWINGS_PER_YEAR;
    el.liveYears.textContent = "⏳ " + years.toFixed(1) + "y";
    el.liveDrawings.textContent = t("drawings") + " " + state.drawings.toLocaleString("en-US");
    el.liveSpent.textContent = t("spent") + " " + money(state.totalSpent);
    el.liveWon.textContent = t("won") + " " + money(state.earnings);
    el.liveNet.textContent = t("net") + " " + money(state.earnings - state.totalSpent);
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
    printSummary();
  }

  function printSummary() {
    var lines = [];
    lines.push("=".repeat(60));
    lines.push(state.hitJackpot ? t("jackpotHit") : t("cashedOut"));
    lines.push("=".repeat(60));
    lines.push(t("ticketsPerDrawing") + " : " + state.ticketsPerDrawing.toLocaleString("en-US"));
    lines.push(t("ticketCost") + " : " + money(state.ticketCost));
    lines.push(t("drawingsPlayed") + " : " + state.drawings.toLocaleString("en-US"));
    lines.push(t("timePlaying") + " : " + (state.drawings / DRAWINGS_PER_YEAR).toFixed(1) + " " + t("years"));
    lines.push(t("totalInvested") + " : " + money(state.totalSpent));
    lines.push(t("totalEarnings") + " : " + money(state.earnings));
    var net = state.earnings - state.totalSpent;
    lines.push(t("netResult") + " : " + money(net) + "  (" + (net >= 0 ? t("profit") : t("loss")) + ")");
    lines.push(t("bestSingleWin") + " : " + money(state.bestWin));
    lines.push("");
    lines.push(t("winsBreakdown") + ":");
    TICKET_TIERS.forEach(function (tier) {
      if (state.timesWon[tier]) {
        lines.push("  " + tier + ": " + state.timesWon[tier].toLocaleString("en-US"));
      }
    });
    lines.push("=".repeat(60));
    el.output.textContent = lines.join("\n");
    el.output.hidden = false;
  }

  function readInputs() {
    var tickets = parseInt(el.tickets.value, 10);
    var cost = parseFloat(el.cost.value);
    var jackpot = parseFloat(el.jackpot.value);
    if (!(tickets >= 1) || !(cost >= 0.01) || !(jackpot >= 1000000)) {
      el.output.textContent = "⚠️ " + t("invalidInput");
      el.output.hidden = false;
      return null;
    }
    return { tickets: tickets, cost: cost, jackpot: jackpot };
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

    el.output.hidden = true;
    el.live.hidden = false;
    updateLive();

    timer = setInterval(tick, 16);
  });

  el.stop.addEventListener("click", function () {
    if (!running) return;
    stopRequested = true;
  });
})();
