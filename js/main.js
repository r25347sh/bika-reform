(function () {
  "use strict";
  var THEME_KEY = "bika-reform-theme";

  function getPreferredTheme() {
    try {
      var s = localStorage.getItem(THEME_KEY);
      if (s === "light" || s === "dark") return s;
    } catch (e) {}
    return "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? "#0c100e" : "#f7f5f0";
  }

  function initTheme() {
    applyTheme(getPreferredTheme());
    var btn = document.querySelector(".theme-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
      });
    }
  }

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", function () { links.classList.toggle("open"); });
      links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { links.classList.remove("open"); });
      });
    }
    var path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      if (href === path || (path === "" && href === "index.html")) a.classList.add("active");
    });
  }

  function initAir() {
    var canvas = document.getElementById("dust-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var flecks = [];
    var W, H;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    function isDark() {
      return document.documentElement.getAttribute("data-theme") === "dark";
    }
    function spawn(n) {
      for (var i = 0; i < n; i++) {
        flecks.push({
          x: Math.random() * W,
          y: H + Math.random() * 40,
          r: 0.8 + Math.random() * 1.4,
          vx: (Math.random() - 0.5) * 0.15,
          vy: -0.25 - Math.random() * 0.45,
          a: 0.15 + Math.random() * 0.25,
          life: 1,
          maxLife: 4 + Math.random() * 6,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.008 + Math.random() * 0.012
        });
      }
    }
    function tick() {
      if (reduced) return;
      ctx.clearRect(0, 0, W, H);
      var dark = isDark();
      for (var i = flecks.length - 1; i >= 0; i--) {
        var p = flecks[i];
        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * 0.2;
        p.y += p.vy;
        p.life -= 0.0035;
        if (p.y < -20 || p.life <= 0) { flecks.splice(i, 1); continue; }
        var fade = Math.min(1, p.life * 2) * Math.min(1, (1 - p.life / p.maxLife) * 4 + 0.3);
        var alpha = p.a * fade * (dark ? 0.7 : 0.5);
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        if (dark) {
          g.addColorStop(0, "rgba(167, 243, 208, " + alpha + ")");
          g.addColorStop(0.5, "rgba(45, 212, 191, " + (alpha * 0.35) + ")");
          g.addColorStop(1, "rgba(45, 212, 191, 0)");
        } else {
          g.addColorStop(0, "rgba(255, 255, 255, " + (alpha * 0.9) + ")");
          g.addColorStop(0.4, "rgba(153, 246, 228, " + (alpha * 0.45) + ")");
          g.addColorStop(1, "rgba(15, 118, 110, 0)");
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
      if (flecks.length < 35) spawn(2);
      requestAnimationFrame(tick);
    }
    resize(); spawn(28);
    window.addEventListener("resize", resize);
    if (!reduced) requestAnimationFrame(tick);
  }

  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  function init() {
    initTheme();
    initNav();
    initAir();
    initReveal();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else init();
})();
