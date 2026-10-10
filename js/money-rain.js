// Money rain — Three.js particle effect for the Powerball simulator.
// Green bills fall while the simulation is running (intensity scales with
// how fast you're burning money); on a jackpot hit they turn gold and
// burst. Falls back to a no-op when Three.js failed to load (offline) or
// when the user prefers reduced motion.

(function () {
  "use strict";

  var reducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (typeof THREE === "undefined" || reducedMotion) {
    window.MoneyRain = {
      start: function () {},
      setIntensity: function () {},
      celebrate: function () {},
      stop: function () {},
    };
    return;
  }

  var MAX_BILLS = 160;
  var VIEW_HEIGHT = 10; // world units visible vertically

  var canvas = document.getElementById("sim-rain");
  if (!canvas) {
    window.MoneyRain = {
      start: function () {}, setIntensity: function () {},
      celebrate: function () {}, stop: function () {},
    };
    return;
  }

  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  camera.position.z = 10;

  var greenTexture = makeBillTexture("#2e7d32", "#a5d6a7", "$");
  var goldTexture = makeBillTexture("#b8860b", "#ffe082", "$");

  var bills = [];
  var spawnAcc = 0;
  var spawnRate = 0; // bills per second
  var gold = false;
  var running = false;
  var rafId = null;
  var lastTime = null;
  var viewW = 10;
  var viewH = VIEW_HEIGHT;

  function makeBillTexture(bg, fg, symbol) {
    var c = document.createElement("canvas");
    c.width = 128;
    c.height = 64;
    var ctx = c.getContext("2d");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 128, 64);
    ctx.strokeStyle = fg;
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, 118, 54);
    ctx.fillStyle = fg;
    ctx.font = "bold 34px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(symbol, 64, 34);
    var tex = new THREE.Texture(c);
    tex.needsUpdate = true;
    return tex;
  }

  function resize() {
    var w = canvas.clientWidth || canvas.parentElement.clientWidth;
    var h = canvas.clientHeight || canvas.parentElement.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    viewH = VIEW_HEIGHT;
    viewW = (VIEW_HEIGHT * w) / h;
    camera.left = -viewW / 2;
    camera.right = viewW / 2;
    camera.top = viewH / 2;
    camera.bottom = -viewH / 2;
    camera.updateProjectionMatrix();
  }

  function spawnBill() {
    var geo = new THREE.PlaneGeometry(1.1, 0.55);
    var mat = new THREE.MeshBasicMaterial({
      map: gold ? goldTexture : greenTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = (Math.random() - 0.5) * viewW * 0.95;
    mesh.position.y = viewH / 2 + 0.6 + Math.random() * 1.5;
    mesh.position.z = (Math.random() - 0.5) * 2;
    mesh.rotation.z = (Math.random() - 0.5) * 0.8;

    mesh.userData = {
      speed: 2.2 + Math.random() * 2.4,
      spin: (Math.random() - 0.5) * 3,
      swayAmp: 0.15 + Math.random() * 0.35,
      swayFreq: 1 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
      baseX: mesh.position.x,
      age: 0,
    };
    scene.add(mesh);
    bills.push(mesh);
  }

  function animate(now) {
    if (!running) return;
    rafId = requestAnimationFrame(animate);
    var dt = lastTime == null ? 0.016 : Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    spawnAcc += spawnRate * dt;
    while (spawnAcc >= 1 && bills.length < MAX_BILLS) {
      spawnAcc -= 1;
      spawnBill();
    }
    if (bills.length >= MAX_BILLS) spawnAcc = 0;

    for (var i = bills.length - 1; i >= 0; i--) {
      var b = bills[i];
      var u = b.userData;
      u.age += dt;
      b.position.y -= u.speed * dt;
      b.position.x = u.baseX + Math.sin(u.phase + u.age * u.swayFreq) * u.swayAmp;
      b.rotation.z += u.spin * dt;
      b.rotation.x = Math.sin(u.phase + u.age * 1.5) * 0.6;

      if (b.position.y < -viewH / 2 - 0.8) {
        scene.remove(b);
        b.geometry.dispose();
        b.material.dispose();
        bills.splice(i, 1);
      }
    }

    renderer.render(scene, camera);
  }

  function ensureSize() {
    resize();
  }

  window.MoneyRain = {
    start: function () {
      ensureSize();
      gold = false;
      running = true;
      lastTime = null;
      canvas.classList.add("active");
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(animate);
    },
    // rate: 0..1 normalized burn intensity
    setIntensity: function (rate) {
      spawnRate = 6 + rate * 54; // 6..60 bills/s
    },
    celebrate: function () {
      gold = true;
      spawnRate = 90;
      // Re-tint existing bills to gold
      bills.forEach(function (b) {
        b.material.map = goldTexture;
        b.material.needsUpdate = true;
      });
    },
    stop: function () {
      running = false;
      spawnRate = 0;
      canvas.classList.remove("active");
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      bills.forEach(function (b) {
        scene.remove(b);
        b.geometry.dispose();
        b.material.dispose();
      });
      bills = [];
      renderer.clear();
    },
  };

  window.addEventListener("resize", function () {
    if (running) resize();
  });
})();
