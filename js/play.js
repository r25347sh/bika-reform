(function () {
  "use strict";
  document.addEventListener("click", function (e) {
    if (e.target.closest("a, button, .card, .goal-banner, .hero-badge, .mission-banner, .site-portal")) {
      burst(e.clientX, e.clientY);
    }
  });
  function burst(x, y) {
    var glyphs = ["\u2726", "\u2727", "\u00b7", "\u2728", "\u2605"];
    var n = 10;
    for (var i = 0; i < n; i++) {
      var el = document.createElement("span");
      el.textContent = glyphs[i % glyphs.length];
      el.style.cssText =
        "position:fixed;left:" + x + "px;top:" + y + "px;pointer-events:none;z-index:99999;" +
        "font-size:" + (11 + Math.random() * 16) + "px;color:var(--accent,#0a6b6e);opacity:1;" +
        "transition:transform 0.75s cubic-bezier(0.22,1,0.36,1),opacity 0.75s;";
      document.body.appendChild(el);
      var angle = (Math.PI * 2 * i) / n + Math.random() * 0.5;
      var dist = 45 + Math.random() * 70;
      requestAnimationFrame(function (el, angle, dist) {
        return function () {
          el.style.transform =
            "translate(" + Math.cos(angle) * dist + "px," + Math.sin(angle) * dist + "px) scale(0) rotate(180deg)";
          el.style.opacity = "0";
        };
      }(el, angle, dist));
      setTimeout(function (el) { return function () { el.remove(); }; }(el), 800);
    }
  }
  var stickers = document.querySelectorAll(".sticker");
  if (stickers.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener("mousemove", function (e) {
      var cx = e.clientX / window.innerWidth - 0.5;
      var cy = e.clientY / window.innerHeight - 0.5;
      stickers.forEach(function (s, i) {
        var f = (i + 1) * 7;
        s.style.marginLeft = cx * f + "px";
        s.style.marginTop = cy * f + "px";
      });
    });
  }
  var h1 = document.querySelector("h1");
  if (h1) {
    var taps = 0;
    h1.style.cursor = "pointer";
    h1.addEventListener("click", function (e) {
      taps++;
      burst(e.clientX, e.clientY);
      if (taps >= 5) {
        taps = 0;
        h1.style.animation = "none";
        h1.offsetHeight;
        h1.style.animation = "title-party 0.8s cubic-bezier(0.34,1.6,0.64,1)";
        var style = document.getElementById("play-party-style");
        if (!style) {
          style = document.createElement("style");
          style.id = "play-party-style";
          style.textContent =
            "@keyframes title-party{0%{transform:scale(1) rotate(0)}25%{transform:scale(1.08) rotate(-3deg)}50%{transform:scale(1.12) rotate(3deg)}75%{transform:scale(1.05) rotate(-2deg)}100%{transform:scale(1) rotate(0)}}";
          document.head.appendChild(style);
        }
      }
    });
  }
})();
