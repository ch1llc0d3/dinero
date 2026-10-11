// Interactive Seneté demo — NOT a port of senete.py (that's still a
// scaffold waiting on the real rules). This is a demo of the classic
// animal-lottery mechanic with clearly-labeled ASSUMED rules:
//   - 25 animals in the pool
//   - 1 animal drawn per sorteo
//   - a hit pays 20× the bet (house edge 20%)
// All parameters are placeholders until the actual Seneté reglamento
// arrives; the facts row on the page says so too.

(function () {
  "use strict";

  var POOL_SIZE = 25;
  var PAYOUT_MULT = 20;
  var SORTEOS_PER_TICK = 6; // sorteos per 16ms tick ≈ 375/s — fast but readable

  // The classic 25-animal pool (0–24), as used by animalito lotteries.
  var ANIMALS = [
    { n: 0, name: "Delfín", emoji: "🐬" },
    { n: 1, name: "Carnero", emoji: "🐏" },
    { n: 2, name: "Toro", emoji: "🐂" },
    { n: 3, name: "Ciempiés", emoji: "🐛" },
    { n: 4, name: "Alacrán", emoji: "🦂" },
    { n: 5, name: "León", emoji: "🦁" },
    { n: 6, name: "Rana", emoji: "🐸" },
    { n: 7, name: "Perico", emoji: "🦜" },
    { n: 8, name: "Ratón", emoji: "🐭" },
    { n: 9, name: "Águila", emoji: "🦅" },
    { n: 10, name: "Tigre", emoji: "🐯" },
    { n: 11, name: "Gato", emoji: "🐱" },
    { n: 12, name: "Caballo", emoji: "🐴" },
    { n: 13, name: "Mono", emoji: "🐵" },
    { n: 14, name: "Paloma", emoji: "🕊️" },
    { n: 15, name: "Zorro", emoji: "🦊" },
    { n: 16, name: "Oso", emoji: "🐻" },
    { n: 17, name: "Pavo", emoji: "🦃" },
    { n: 18, name: "Burro", emoji: "🫏" },
    { n: 19, name: "Chivo", emoji: "🐐" },
    { n: 20, name: "Cerdo", emoji: "🐷" },
    { n: 21, name: "Gallo", emoji: "🐓" },
    { n: 22, name: "Camello", emoji: "🐫" },
    { n: 23, name: "Cebra", emoji: "🦓" },
    { n: 24, name: "Iguana", emoji: "🦎" },
  ];

  // ---------- i18n (kept here so the sim is self-contained) ----------
  var simStrings = {
    en: {
      cashedOut: "🛑 Cashed out early",
      cashedOutSub: "Here's what you walked away with.",
      betPerSorteo: "Bet per sorteo (₲)",
      sorteosPlayed: "Sorteos played",
      totalInvested: "Total invested",
      totalEarnings: "Total won",
      netResult: "Net result",
      profit: "PROFIT",
      loss: "LOSS",
      hits: "Hits",
      hitRate: "Hit rate",
      expectedRate: "Expected 4.0% (1 in 25)",
      roi: "Return on betting",
      bestStreak: "Longest dry spell",
      sorteosBetween: "sorteos between hits",
      noHits: "Not a single hit — that's the 20% house edge at work.",
      invalidInput: "Pick an animal and bet ≥ ₲100.",
      assumed: "assumed rules",
    },
    es: {
      cashedOut: "🛑 Retirado antes de tiempo",
      cashedOutSub: "Esto es lo que te llevas.",
      betPerSorteo: "Apuesta por sorteo (₲)",
      sorteosPlayed: "Sorteos jugados",
      totalInvested: "Total invertido",
      totalEarnings: "Total ganado",
      netResult: "Resultado neto",
      profit: "GANANCIA",
      loss: "PÉRDIDA",
      hits: "Aciertos",
      hitRate: "Tasa de acierto",
      expectedRate: "Esperado 4.0% (1 en 25)",
      roi: "Retorno sobre lo apostado",
      bestStreak: "Racha más seca",
      sorteosBetween: "sorteos entre aciertos",
      noHits: "Ni un solo acierto — así trabaja el 20% de ventaja de la casa.",
      invalidInput: "Elige un animal y apuesta ≥ ₲100.",
      assumed: "reglas supuestas",
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
    return (n * 100).toFixed(1) + "%";
  }

  // ---------- DOM ----------
  var el = {
    grid: document.getElementById("sn-grid"),
    bet: document.getElementById("sn-bet"),
    start: document.getElementById("sn-start"),
    stop: document.getElementById("sn-stop"),
    drawWrap: document.getElementById("sn-draw-wrap"),
    drawStrip: document.getElementById("sn-draw-strip"),
    live: document.getElementById("sn-live"),
    liveSorteos: document.getElementById("sn-live-sorteos"),
    liveHits: document.getElementById("sn-live-hits"),
    liveSpent: document.getElementById("sn-live-spent"),
    liveWon: document.getElementById("sn-live-won"),
    liveNet: document.getElementById("sn-live-net"),
    output: document.getElementById("sn-output"),
    section: document.getElementById("senete-sim"),
  };
  if (!el.grid) return; // sim section not present

  var picked = null; // animal number the player picked
  var running = false;
  var stopRequested = false;
  var state = null;
  var timer = null;
  var stripCells = [];

  // ---------- build the animal grid ----------
  ANIMALS.forEach(function (animal) {
    var cell = document.createElement("button");
    cell.type = "button";
    cell.className = "sn-cell";
    cell.setAttribute("role", "option");
    cell.setAttribute("aria-selected", "false");
    cell.title = animal.n + " · " + animal.name;
    cell.innerHTML =
      '<span class="sn-cell-emoji">' + animal.emoji + "</span>" +
      '<span class="sn-cell-num">' + String(animal.n).padStart(2, "0") + "</span>";
    cell.addEventListener("click", function () {
      if (running) return;
      picked = animal.n;
      Array.prototype.forEach.call(el.grid.children, function (c) {
        c.classList.remove("picked");
        c.setAttribute("aria-selected", "false");
      });
      cell.classList.add("picked");
      cell.setAttribute("aria-selected", "true");
    });
    el.grid.appendChild(cell);
  });

  // Pre-seed the draw strip with empty slots (filled live during runs).
  var STRIP_LEN = 12;
  for (var i = 0; i < STRIP_LEN; i++) {
    var slot = document.createElement("span");
    slot.className = "sn-draw-slot";
    el.drawStrip.appendChild(slot);
    stripCells.push(slot);
  }

  function pushDraw(animalNum) {
    var a = ANIMALS[animalNum];
    var dropped = stripCells.pop();
    if (dropped) dropped.remove();
    var slot = document.createElement("span");
    slot.className = "sn-draw-slot" + (animalNum === picked ? " sn-draw-hit" : "");
    slot.textContent = a.emoji;
    slot.title = a.n + " · " + a.name;
    el.drawStrip.insertBefore(slot, el.drawStrip.firstChild);
    stripCells.unshift(slot);
  }

  // ---------- state ----------
  function resetState(bet) {
    return {
      bet: bet,
      sorteos: 0,
      hits: 0,
      totalSpent: 0,
      earnings: 0,
      sinceHit: 0,
      longestDry: 0,
    };
  }

  function updateLive() {
    el.liveSorteos.textContent = state.sorteos.toLocaleString("en-US");
    el.liveHits.textContent = state.hits.toLocaleString("en-US");
    el.liveSpent.textContent = moneyCompact(state.totalSpent);
    el.liveWon.textContent = moneyCompact(state.earnings);
    var net = state.earnings - state.totalSpent;
    el.liveNet.textContent = moneyCompact(net);
    el.liveNet.classList.toggle("net-negative", net < 0);
    el.liveNet.classList.toggle("net-positive", net >= 0);
  }

  function tick() {
    for (var batch = 0; batch < SORTEOS_PER_TICK && !stopRequested; batch++) {
      state.sorteos++;
      state.totalSpent += state.bet;
      state.sinceHit++;

      var drawn = Math.floor(Math.random() * POOL_SIZE);
      if (drawn === picked) {
        state.hits++;
        state.earnings += state.bet * PAYOUT_MULT;
        state.longestDry = Math.max(state.longestDry, state.sinceHit - 1);
        state.sinceHit = 0;
        pushDraw(drawn);
      } else if (state.sorteos % 8 === 0) {
        // only repaint the strip every few sorteos so hits stay visible
        pushDraw(drawn);
      }
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
    Array.prototype.forEach.call(el.grid.children, function (c) {
      c.disabled = false;
    });
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
    var hitRate = state.sorteos > 0 ? state.hits / state.sorteos : 0;
    var animal = ANIMALS[picked];

    var verdictClass = net >= 0 ? "verdict-win" : "verdict-loss";
    var html = "";
    html += '<div class="verdict ' + verdictClass + '">';
    html += '<span class="verdict-title">' + t("cashedOut") + "</span>";
    html +=
      '<span class="verdict-sub">' +
      animal.emoji + " " + animal.name + " (" + String(animal.n).padStart(2, "0") + ") · " +
      t("assumed") +
      "</span>";
    html += "</div>";

    html +=
      '<div class="net-card ' + (net >= 0 ? "net-positive" : "net-negative") + '">' +
      '<span class="net-card-value">' + money(net) + "</span>" +
      '<span class="net-card-label">' + t("netResult") + " · " + (net >= 0 ? t("profit") : t("loss")) + "</span>" +
      "</div>";

    html += '<div class="summary-stats">';
    html += statCard(t("sorteosPlayed"), state.sorteos.toLocaleString("en-US"));
    html += statCard(t("totalInvested"), money(state.totalSpent));
    html += statCard(t("totalEarnings"), money(state.earnings));
    html += statCard(t("hits"), state.hits.toLocaleString("en-US"));
    html += statCard(t("hitRate"), pct(hitRate) + " — " + t("expectedRate"));
    html += statCard(t("roi"), pct(roi), roi >= 0 ? "sstat-pos" : "sstat-neg");
    if (state.hits > 0) {
      html += statCard(t("bestStreak"), state.longestDry.toLocaleString("en-US") + " " + t("sorteosBetween"));
    }
    html += "</div>";

    if (state.hits === 0) {
      html += '<p class="tier-empty">' + t("noHits") + "</p>";
    }

    el.output.innerHTML = html;
    el.output.hidden = false;
  }

  function readInputs() {
    var bet = parseInt(el.bet.value, 10);
    if (picked === null || !(bet >= 100)) {
      el.output.innerHTML = '<div class="verdict verdict-warn">⚠️ ' + t("invalidInput") + "</div>";
      el.output.hidden = false;
      return null;
    }
    return { bet: bet };
  }

  el.start.addEventListener("click", function () {
    if (running) return;
    var inputs = readInputs();
    if (!inputs) return;

    state = resetState(inputs.bet);
    stopRequested = false;
    running = true;

    el.start.disabled = true;
    el.stop.disabled = false;
    el.bet.disabled = true;
    Array.prototype.forEach.call(el.grid.children, function (c) {
      c.disabled = true;
    });

    el.output.hidden = true;
    el.output.innerHTML = "";
    el.live.hidden = false;
    el.drawWrap.hidden = false;
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
