/**
 * 美化委員会改革計画 — dust + reveal + magnetic
 */
(function () {
  "use strict";

  function initDust() {
    var canvas = document.getElementById("dust-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var particles = [];
    var W, H;
    var mouse = { x: -9999, y: -9999 };
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function spawn(n) {
      for (var i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.6 + Math.random() * 2.2,
          vx: (Math.random() - 0.5) * 0.35,
          vy: -0.08 - Math.random() * 0.32,
          a: 0.15 + Math.random() * 0.4,
          life: 0.6 + Math.random() * 0.5,
          hue: 180 + Math.random() * 40
        });
      }
    }

    function tick() {
      if (reduced) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        var dx = mouse.x - p.x;
        var dy = mouse.y - p.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0.1) {
          var force = (120 - dist) / 120;
          p.vx += (dx / dist) * 0.06 * force;
          p.vy += (dy / dist) * 0.06 * force;
          p.a *= 0.95;
          p.life -= 0.012 * force;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(34, 211, 238, " + (0.08 * force) + ")";
          ctx.fill();
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.992;
        p.vy *= 0.992;
        p.life -= 0.0009;
        if (p.y < -12 || p.life <= 0 || p.a < 0.02) {
          particles.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        var alpha = p.a * p.life * 0.65;
        ctx.fillStyle = "hsla(" + p.hue + ", 85%, 65%, " + alpha + ")";
        ctx.fill();
      }
      if (particles.length < 70) spawn(3);
      requestAnimationFrame(tick);
    }

    resize();
    spawn(80);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener("pointerleave", function () {
      mouse.x = -9999;
      mouse.y = -9999;
    });
    if (!reduced) requestAnimationFrame(tick);
  }

  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    els.forEach(function (el) { io.observe(el); });
  }

  function initMagnetic() {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    var cards = document.querySelectorAll(".card, .btn, .plan-block");
    cards.forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        var strength = el.classList.contains("btn") ? 0.15 : 0.06;
        el.style.transform = "translate(" + (x * strength) + "px, " + (y * strength) + "px)";
      });
      el.addEventListener("pointerleave", function () {
        el.style.transform = "";
      });
    });
  }

  function init() {
    initDust();
    initReveal();
    initMagnetic();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
