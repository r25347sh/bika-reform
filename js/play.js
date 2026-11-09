(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function burst(x, y, count) {
    if (reduced) return;
    var glyphs = ["\u2726", "\u2727", "\u00b7", "\u2728", "\u2605", "\u25c7", "\u25cb"];
    var n = count || 12;
    for (var i = 0; i < n; i++) {
      var el = document.createElement("span");
      el.textContent = glyphs[i % glyphs.length];
      el.style.cssText =
        "position:fixed;left:" + x + "px;top:" + y + "px;pointer-events:none;z-index:99999;" +
        "font-size:" + (10 + Math.random() * 18) + "px;color:var(--accent,#0a6b6e);opacity:1;" +
        "transition:transform 0.85s cubic-bezier(0.22,1,0.36,1),opacity 0.85s;will-change:transform,opacity;";
      document.body.appendChild(el);
      var angle = (Math.PI * 2 * i) / n + Math.random() * 0.6;
      var dist = 50 + Math.random() * 90;
      var rot = (Math.random() - 0.5) * 360;
      requestAnimationFrame(function (el, angle, dist, rot) {
        return function () {
          el.style.transform =
            "translate(" + Math.cos(angle) * dist + "px," + (Math.sin(angle) * dist - 20) + "px) scale(0) rotate(" + rot + "deg)";
          el.style.opacity = "0";
        };
      }(el, angle, dist, rot));
      setTimeout(function (el) { return function () { el.remove(); }; }(el), 900);
    }
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("a, button, .card, .goal-banner, .hero-badge, .mission-banner, .site-portal, .ham-fab, .rm-item")) {
      burst(e.clientX, e.clientY, 10);
    }
  });

  var stickers = document.querySelectorAll(".sticker");
  if (stickers.length && !reduced) {
    window.addEventListener("mousemove", function (e) {
      var cx = e.clientX / window.innerWidth - 0.5;
      var cy = e.clientY / window.innerHeight - 0.5;
      stickers.forEach(function (s, i) {
        var f = (i + 1) * 8;
        s.style.marginLeft = cx * f + "px";
        s.style.marginTop = cy * f + "px";
      });
    });
  }

  var h1 = document.querySelector("h1");
  if (h1) {
    var taps = 0;
    h1.style.cursor = "pointer";
    h1.title = "\u2026\uff1f";
    h1.addEventListener("click", function (e) {
      taps++;
      burst(e.clientX, e.clientY, 8);
      if (taps >= 5) {
        taps = 0;
        partyMode(h1);
        toast("\ud83c\udf89 \u30bf\u30a4\u30c8\u30eb\u30d1\u30fc\u30c6\u30a3\u30fc\uff01");
      }
    });
  }

  function partyMode(el) {
    el.style.animation = "none";
    el.offsetHeight;
    ensureStyle();
    el.style.animation = "title-party 0.9s cubic-bezier(0.34,1.6,0.64,1)";
  }

  function ensureStyle() {
    if (document.getElementById("play-party-style")) return;
    var style = document.createElement("style");
    style.id = "play-party-style";
    style.textContent = [
      "@keyframes title-party{0%{transform:scale(1) rotate(0)}20%{transform:scale(1.1) rotate(-4deg)}40%{transform:scale(1.14) rotate(4deg)}60%{transform:scale(1.06) rotate(-2deg)}100%{transform:scale(1) rotate(0)}}",
      "@keyframes rainbow-shift{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}",
      "@keyframes float-up{from{opacity:1;transform:translateY(0) scale(1)}to{opacity:0;transform:translateY(-80px) scale(0.6)}}",
      ".egg-toast{position:fixed;bottom:5.5rem;left:50%;transform:translateX(-50%) translateY(20px);background:var(--surface,#fffcf6);color:var(--ink,#1a1e1b);border:2px solid var(--accent,#0a6b6e);padding:0.65rem 1.2rem;border-radius:999px;font-weight:700;font-size:0.85rem;z-index:999999;box-shadow:4px 4px 0 var(--accent-soft,rgba(10,107,110,0.15));opacity:0;transition:opacity 0.35s,transform 0.4s cubic-bezier(0.34,1.5,0.64,1);pointer-events:none;font-family:inherit}",
      ".egg-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}",
      "body.egg-rainbow .ambient-gradient,body.egg-rainbow .orb{animation:rainbow-shift 3s linear infinite !important}",
      "body.egg-shake{animation:title-party 0.5s ease}"
    ].join("");
    document.head.appendChild(style);
  }

  function toast(msg) {
    ensureStyle();
    var t = document.createElement("div");
    t.className = "egg-toast";
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("show"); });
    setTimeout(function () {
      t.classList.remove("show");
      setTimeout(function () { t.remove(); }, 400);
    }, 2200);
  }

  var konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  var kIdx = 0;
  document.addEventListener("keydown", function (e) {
    if (e.keyCode === konami[kIdx]) {
      kIdx++;
      if (kIdx === konami.length) {
        kIdx = 0;
        ensureStyle();
        document.body.classList.add("egg-rainbow");
        toast("\ud83c\udf08 \u30b3\u30ca\u30df\u30b3\u30de\u30f3\u30c9\uff01\u8131\u30cf\u30a6\u30b9\u30c0\u30b9\u30c8\uff01");
        var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
        for (var i = 0; i < 5; i++) {
          setTimeout(function () {
            burst(cx + (Math.random() - 0.5) * 200, cy + (Math.random() - 0.5) * 150, 16);
          }, i * 120);
        }
        setTimeout(function () { document.body.classList.remove("egg-rainbow"); }, 6000);
      }
    } else {
      kIdx = 0;
    }
  });

  document.querySelectorAll(".hero-badge, .goal-banner, .mission-banner").forEach(function (el) {
    var c = 0;
    el.style.cursor = "pointer";
    el.addEventListener("click", function (e) {
      c++;
      if (c >= 3) {
        c = 0;
        el.style.transition = "transform 0.7s cubic-bezier(0.34,1.6,0.64,1)";
        el.style.transform = "rotate(360deg) scale(1.15)";
        burst(e.clientX, e.clientY, 14);
        toast("\u2728 \u30b9\u30bf\u30f3\u30d7\u56de\u8ee2\uff01");
        setTimeout(function () { el.style.transform = ""; }, 750);
      }
    });
  });

  var brand = document.querySelector(".nav-brand, .hero h1");
  if (brand) {
    var pressTimer;
    brand.addEventListener("mousedown", function () {
      pressTimer = setTimeout(function () {
        ensureStyle();
        document.body.classList.add("egg-shake");
        toast("\ud83d\udca8 \u30cf\u30a6\u30b9\u30c0\u30b9\u30c8\u98db\u3070\u3057\uff01");
        burst(window.innerWidth / 2, 120, 20);
        setTimeout(function () { document.body.classList.remove("egg-shake"); }, 600);
      }, 800);
    });
    brand.addEventListener("mouseup", function () { clearTimeout(pressTimer); });
    brand.addEventListener("mouseleave", function () { clearTimeout(pressTimer); });
  }

  var themeBtn = document.querySelector(".theme-toggle");
  if (themeBtn) {
    var flips = 0;
    themeBtn.addEventListener("click", function () {
      flips++;
      if (flips >= 7) {
        flips = 0;
        toast("\ud83c\udf13 \u660e\u6697\u3092\u884c\u304d\u6765\u3059\u308b\u306e\u3082\u7f8e\u5316\u2026\uff1f");
        burst(window.innerWidth - 40, 40, 12);
      }
    });
  }

  document.addEventListener("dblclick", function (e) {
    if (e.target.closest("a, button, input, .card, .ham-fab, .radial-menu-wrapper")) return;
    if (reduced) return;
    var el = document.createElement("span");
    el.textContent = ["\ud83d\udc9a", "\u2728", "\ud83e\udee7", "\ud83c\udf3f"][Math.floor(Math.random() * 4)];
    el.style.cssText =
      "position:fixed;left:" + e.clientX + "px;top:" + e.clientY + "px;pointer-events:none;z-index:99999;" +
      "font-size:1.6rem;animation:float-up 1s ease-out forwards;";
    ensureStyle();
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 1000);
  });

  if (!reduced) {
    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "translateY(-10px) rotateX(" + (-y * 6) + "deg) rotateY(" + (x * 8) + "deg)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }
})();
