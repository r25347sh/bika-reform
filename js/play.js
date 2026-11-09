(function () {
  "use strict";
  document.addEventListener("click", function (e) {
    if (e.target.closest("a, button, .card, .goal-banner, .hero-badge, .mission-banner")) {
      burst(e.clientX, e.clientY);
    }
  });
  function burst(x, y) {
    var n = 8;
    for (var i = 0; i < n; i++) {
      var el = document.createElement("span");
      el.textContent = ["\u2726", "\u2727", "\u00b7", "\u2728"][i % 4];
      el.style.cssText = "position:fixed;left:" + x + "px;top:" + y + "px;pointer-events:none;z-index:99999;font-size:" + (10 + Math.random() * 14) + "px;color:var(--accent,#0a6b6e);opacity:1;transition:transform 0.7s cubic-bezier(0.22,1,0.36,1),opacity 0.7s;";
      document.body.appendChild(el);
      var angle = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      var dist = 40 + Math.random() * 60;
      requestAnimationFrame(function (el, angle, dist) {
        return function () {
          el.style.transform = "translate(" + Math.cos(angle) * dist + "px," + Math.sin(angle) * dist + "px) scale(0)";
          el.style.opacity = "0";
        };
      }(el, angle, dist));
      setTimeout(function (el) { return function () { el.remove(); }; }(el), 750);
    }
  }
  var stickers = document.querySelectorAll(".sticker");
  if (stickers.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener("mousemove", function (e) {
      var cx = e.clientX / window.innerWidth - 0.5;
      var cy = e.clientY / window.innerHeight - 0.5;
      stickers.forEach(function (s, i) {
        var f = (i + 1) * 6;
        s.style.marginLeft = (cx * f) + "px";
        s.style.marginTop = (cy * f) + "px";
      });
    });
  }
})();
