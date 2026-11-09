/**
 * Radial + FAB for 改革計画
 */
(function () {
  "use strict";

  function buildMenuData() {
    return [
      { label: "概要", icon: "📋", url: "index.html" },
      { label: "ブランド化", icon: "✦", url: "brand.html" },
      { label: "企画案", icon: "💡", url: "plans.html" },
      { label: "公式サイト", icon: "⌂", url: "https://r25347sh.github.io/bika-committee/" }
    ];
  }

  var LONG_PRESS_MS = 360;
  var TRIPLE_TAP_DELAY_MS = 300;
  var MOVE_THRESHOLD = 8;
  var SHELL_CAPACITIES = [6, 10, 14];
  var SHELL_RADII = [118, 190, 262];
  var menuEl, itemsContainer, orbitsContainer, coreBtn;
  var timer, startX, startY, isOpen = false, menuStack = [];
  var pieDisabled = false;
  var tapCount = 0, tapTimer = null;

  function navigateWithDelay(url) {
    closeMenu();
    closeHamburger();
    setTimeout(function () { location.href = url; }, 180);
  }

  function calculateShellLayout(items) {
    var layout = [], remaining = items.length, itemIdx = 0;
    for (var sIdx = 0; sIdx < SHELL_CAPACITIES.length && remaining > 0; sIdx++) {
      var count = Math.min(remaining, SHELL_CAPACITIES[sIdx]);
      var radius = SHELL_RADII[sIdx];
      for (var i = 0; i < count; i++) {
        var angle = (i / count) * 2 * Math.PI - Math.PI / 2;
        layout.push({
          item: items[itemIdx],
          x: Math.round(Math.cos(angle) * radius),
          y: Math.round(Math.sin(angle) * radius),
          shellIndex: sIdx
        });
        itemIdx++;
      }
      remaining -= count;
    }
    return layout;
  }

  function renderItems(items) {
    if (!itemsContainer || !orbitsContainer) return;
    var old = itemsContainer.querySelectorAll(".rm-item");
    for (var i = 0; i < old.length; i++) {
      old[i].classList.remove("rendered");
      old[i].remove();
    }
    orbitsContainer.innerHTML = "";
    var layout = calculateShellLayout(items);
    var shellsUsed = {};
    layout.forEach(function (data, idx) {
      shellsUsed[data.shellIndex] = true;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "rm-item" + (data.item.items ? " has-sub" : "");
      btn.setAttribute("data-label", data.item.label || "");
      btn.style.setProperty("--x", data.x + "px");
      btn.style.setProperty("--y", data.y + "px");
      btn.style.transitionDelay = idx * 28 + "ms";
      btn.innerHTML = "<span>" + (data.item.icon || "·") + "</span>";
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (data.item.items && data.item.items.length) {
          menuStack.push(items);
          renderItems(data.item.items);
          if (coreBtn) coreBtn.classList.add("visible");
        } else if (data.item.url) {
          navigateWithDelay(data.item.url);
        }
      });
      itemsContainer.appendChild(btn);
      setTimeout(function () { btn.classList.add("rendered"); }, 14);
    });
    Object.keys(shellsUsed).forEach(function (s) {
      var orbit = document.createElement("div");
      orbit.className = "rm-shell-orbit";
      var r = SHELL_RADII[Number(s)];
      orbit.style.width = r * 2 + "px";
      orbit.style.height = r * 2 + "px";
      orbit.style.marginLeft = -r + "px";
      orbit.style.marginTop = -r + "px";
      orbit.style.left = "0";
      orbit.style.top = "0";
      orbitsContainer.appendChild(orbit);
    });
    if (coreBtn) coreBtn.classList.toggle("visible", menuStack.length > 0);
  }

  function createMenuDOM() {
    if (document.querySelector(".radial-menu-wrapper")) return;
    menuEl = document.createElement("div");
    menuEl.className = "radial-menu-wrapper";
    menuEl.setAttribute("aria-hidden", "true");
    var canvas = document.createElement("canvas");
    canvas.className = "rm-canvas-layer";
    menuEl.appendChild(canvas);
    orbitsContainer = document.createElement("div");
    menuEl.appendChild(orbitsContainer);
    itemsContainer = document.createElement("div");
    menuEl.appendChild(itemsContainer);
    coreBtn = document.createElement("button");
    coreBtn.type = "button";
    coreBtn.className = "rm-core-btn";
    coreBtn.setAttribute("aria-label", "戻る");
    coreBtn.innerHTML = "←";
    coreBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (menuStack.length) renderItems(menuStack.pop());
      else closeMenu();
    });
    menuEl.appendChild(coreBtn);
    document.body.appendChild(menuEl);
  }

  function viewportSize() {
    var vv = window.visualViewport;
    if (vv) return { w: vv.width, h: vv.height };
    return { w: window.innerWidth, h: window.innerHeight };
  }

  function openMenu(x, y) {
    if (!menuEl) return;
    var vs = viewportSize();
    var margin = 160;
    var cx = typeof x === "number" ? x : vs.w / 2;
    var cy = typeof y === "number" ? y : vs.h / 2;
    menuEl.style.left = Math.max(margin, Math.min(cx, vs.w - margin)) + "px";
    menuEl.style.top = Math.max(margin, Math.min(cy, vs.h - margin)) + "px";
    menuEl.classList.add("active");
    menuEl.setAttribute("aria-hidden", "false");
    isOpen = true;
    menuStack = [];
    renderItems(buildMenuData());
  }

  function closeMenu() {
    if (!menuEl) return;
    menuEl.classList.remove("active");
    menuEl.setAttribute("aria-hidden", "true");
    isOpen = false;
    menuStack = [];
    var items = menuEl.querySelectorAll(".rm-item");
    for (var i = 0; i < items.length; i++) items[i].classList.remove("rendered");
    if (coreBtn) coreBtn.classList.remove("visible");
  }

  function ensureFab() {
    if (document.querySelector(".menu-fab")) return;
    var fab = document.createElement("button");
    fab.type = "button";
    fab.className = "menu-fab";
    fab.setAttribute("aria-label", "メニューを開く");
    fab.innerHTML = "☰";
    document.body.appendChild(fab);
    fab.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      openHamburger();
    });
  }

  function ensureHamburgerUI() {
    if (document.getElementById("ham-overlay")) return;
    var ov = document.createElement("div");
    ov.id = "ham-overlay";
    ov.setAttribute("aria-hidden", "true");
    ov.addEventListener("click", closeHamburger);
    document.body.appendChild(ov);
    var panel = document.createElement("div");
    panel.id = "ham-panel";
    panel.innerHTML =
      '<div class="ham-header">' +
      '<div class="ham-title">改革計画</div>' +
      '<button type="button" class="ham-close" id="ham-close" aria-label="閉じる">✕</button>' +
      '</div><div id="ham-list"></div>';
    document.body.appendChild(panel);
    document.getElementById("ham-close").onclick = closeHamburger;
  }

  function openHamburger() {
    ensureHamburgerUI();
    closeMenu();
    pieDisabled = true;
    var list = document.getElementById("ham-list");
    list.innerHTML = "";
    buildMenuData().forEach(function (entry) {
      var a = document.createElement("a");
      a.className = "ham-link";
      a.href = entry.url || "#";
      a.textContent = (entry.icon ? entry.icon + " " : "") + entry.label;
      a.addEventListener("click", function (e) {
        e.preventDefault();
        navigateWithDelay(entry.url);
      });
      list.appendChild(a);
    });
    var ov = document.getElementById("ham-overlay");
    var panel = document.getElementById("ham-panel");
    if (ov) { ov.classList.add("open"); ov.setAttribute("aria-hidden", "false"); }
    if (panel) panel.classList.add("open");
  }

  function closeHamburger() {
    var ov = document.getElementById("ham-overlay");
    var panel = document.getElementById("ham-panel");
    if (ov) { ov.classList.remove("open"); ov.setAttribute("aria-hidden", "true"); }
    if (panel) panel.classList.remove("open");
    pieDisabled = false;
  }

  function initEvents() {
    document.addEventListener("pointerdown", function (e) {
      if (e.target.closest && (
        e.target.closest(".menu-fab") ||
        e.target.closest(".radial-menu-wrapper") ||
        e.target.closest("#ham-panel") ||
        e.target.closest("#ham-overlay") ||
        e.target.closest(".theme-toggle") ||
        e.target.closest(".top-nav")
      )) return;
      if (isOpen && menuEl && !menuEl.contains(e.target)) { closeMenu(); return; }
      startX = e.clientX; startY = e.clientY;
      tapCount++;
      clearTimeout(tapTimer);
      if (tapCount === 3) {
        clearTimeout(timer); timer = null; tapCount = 0;
        if (!pieDisabled) openMenu(startX, startY);
        return;
      }
      tapTimer = setTimeout(function () { tapCount = 0; }, TRIPLE_TAP_DELAY_MS);
      if (pieDisabled) return;
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (pieDisabled) return;
        tapCount = 0;
        openMenu(startX, startY);
      }, LONG_PRESS_MS);
    }, { passive: true });

    document.addEventListener("pointermove", function (e) {
      if (!timer) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.sqrt(dx * dx + dy * dy) > MOVE_THRESHOLD) {
        clearTimeout(timer); timer = null;
      }
    }, { passive: true });

    document.addEventListener("pointerup", function () { clearTimeout(timer); timer = null; });
    document.addEventListener("pointercancel", function () { clearTimeout(timer); timer = null; });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeMenu(); closeHamburger(); }
    });
  }

  function init() {
    createMenuDOM();
    ensureFab();
    initEvents();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else init();
})();
