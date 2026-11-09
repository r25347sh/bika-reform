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
    if (meta) meta.content = theme === "dark" ? "#0b0f14" : "#f3f1eb";
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

  function initDust() {
    var canvas = document.getElementById("dust-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var particles = [];
    var W, H, mouse = { x: -9999, y: -9999 };
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
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          r: 1.2 + Math.random() * 2.8,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -0.12 - Math.random() * 0.35,
          a: 0.35 + Math.random() * 0.45,
          life: 0.7 + Math.random() * 0.5,
          pulse: Math.random() * Math.PI * 2
        });
      }
    }
    function tick() {
      if (reduced) return;
      ctx.clearRect(0, 0, W, H);
      var dark = isDark();
      var t = performance.now() * 0.001;
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        var dx = mouse.x - p.x, dy = mouse.y - p.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140 && dist > 0.1) {
          var f = (140 - dist) / 140;
          p.vx += (dx / dist) * 0.07 * f;
          p.vy += (dy / dist) * 0.07 * f;
          p.life -= 0.012 * f;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = dark ? "rgba(45,212,191," + (0.06 * f) + ")" : "rgba(13,148,136," + (0.08 * f) + ")";
          ctx.fill();
        }
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.99; p.vy *= 0.99;
        p.life -= 0.0008;
        p.pulse += 0.04;
        if (p.y < -15 || p.life <= 0) { particles.splice(i, 1); continue; }
        var blink = 0.7 + 0.3 * Math.sin(p.pulse + t);
        var alpha = p.a * p.life * blink * (dark ? 0.75 : 0.55);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = dark ? "rgba(94,234,212," + alpha + ")" : "rgba(15,118,110," + alpha + ")";
        ctx.fill();
      }
      if (particles.length < 90) spawn(4);
      requestAnimationFrame(tick);
    }
    resize(); spawn(80);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
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
    }, { threshold: 0.08, rootMargin: "0px 0px -36px 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  function init() {
    initTheme();
    initNav();
    initDust();
    initReveal();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else init();
})();
