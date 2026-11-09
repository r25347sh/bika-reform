/**
 * 美化改革 — Radial Menu + Hamburger FAB (fixed)
 */
(function () {
  "use strict";

  function buildMenuData() {
    return [
      { label: "\u6982\u8981", icon: "\ud83d\udccb", url: "index.html" },
      { label: "\u30d6\u30e9\u30f3\u30c9\u5316", icon: "\u2728", url: "brand.html" },
      { label: "\u4f01\u753b\u6848", icon: "\ud83d\udca1", url: "plans.html" },
      { label: "\u516c\u5f0f\u30b5\u30a4\u30c8", icon: "\ud83c\udfe0", url: "https://r25347sh.github.io/bika-committee/" }
    ];
  }

  var LONG_PRESS_MS = 420;
  var TRIPLE_TAP_DELAY_MS = 380;
  var MOVE_THRESHOLD = 12;
  var SHELL_RADII = [110];
  var menuEl, itemsContainer, orbitsContainer, coreBtn;
  var timer = null, startX = 0, startY = 0;
  var isOpen = false, menuStack = [];
  var pieDisabled = false;
  var tapCount = 0, tapTimer = null;
  var ignoreOutsideUntil = 0;

  function navigateWithDelay(url) {
    closeMenu();
    closeHamburger();
    setTimeout(function () { location.href = url; }, 160);
  }

  function calculateShellLayout(items) {
    var n = items.length;
    var radius = SHELL_RADII[0];
    var layout = [];
    for (var i = 0; i < n; i++) {
      var angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      layout.push({
        item: items[i],
        x: Math.round(Math.cos(angle) * radius),
        y: Math.round(Math.sin(angle) * radius)
      });
    }
    return layout;
  }

  function renderItems(items) {
    if (!itemsContainer || !orbitsContainer) return;
    itemsContainer.innerHTML = "";
    orbitsContainer.innerHTML = "";
    var layout = calculateShellLayout(items);
    var radius = SHELL_RADII[0];
    var orbit = document.createElement("div");
    orbit.className = "rm-shell-orbit";
    orbit.style.width = radius * 2 + "px";
    orbit.style.height = radius * 2 + "px";
    orbit.style.left = -radius + "px";
    orbit.style.top = -radius + "px";
    orbitsContainer.appendChild(orbit);
    layout.forEach(function (data, idx) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "rm-item";
      btn.setAttribute("data-label", data.item.label || "");
      btn.style.setProperty("--x", data.x + "px");
      btn.style.setProperty("--y", data.y + "px");
      btn.style.transitionDelay = idx * 40 + "ms";
      btn.innerHTML = "<span>" + (data.item.icon || "\u00b7") + "</span>";
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (data.item.url) navigateWithDelay(data.item.url);
      });
      itemsContainer.appendChild(btn);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { btn.classList.add("rendered"); });
      });
    });
  }

  function openMenu(x, y) {
    if (pieDisabled) return;
    if (isOpen) { closeMenu(); return; }
    isOpen = true;
    ignoreOutsideUntil = Date.now() + 450;
    menuStack = [];
    if (!menuEl) createMenuDOM();
    menuEl.style.left = x + "px";
    menuEl.style.top = y + "px";
    menuEl.classList.add("active");
    menuEl.setAttribute("aria-hidden", "false");
    if (coreBtn) {
      coreBtn.classList.add("visible");
      coreBtn.textContent = "\u2715";
      coreBtn.setAttribute("aria-label", "\u9589\u3058\u308b");
    }
    renderItems(buildMenuData());
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;
    if (menuEl) {
      menuEl.classList.remove("active");
      menuEl.setAttribute("aria-hidden", "true");
    }
    if (itemsContainer) {
      var nodes = itemsContainer.querySelectorAll(".rm-item");
      for (var i = 0; i < nodes.length; i++) nodes[i].classList.remove("rendered");
    }
    if (coreBtn) coreBtn.classList.remove("visible");
  }

  function createMenuDOM() {
    menuEl = document.createElement("div");
    menuEl.className = "radial-menu-wrapper";
    menuEl.setAttribute("aria-hidden", "true");
    orbitsContainer = document.createElement("div");
    orbitsContainer.className = "rm-canvas-layer";
    itemsContainer = document.createElement("div");
    itemsContainer.className = "rm-canvas-layer";
    coreBtn = document.createElement("button");
    coreBtn.type = "button";
    coreBtn.className = "rm-core-btn";
    coreBtn.setAttribute("aria-label", "\u9589\u3058\u308b");
    coreBtn.textContent = "\u2715";
    coreBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
    });
    menuEl.appendChild(orbitsContainer);
    menuEl.appendChild(itemsContainer);
    menuEl.appendChild(coreBtn);
    document.body.appendChild(menuEl);
  }

  function isUITarget(t) {
    if (!t || !t.closest) return false;
    return !!t.closest(
      ".ham-fab, .ham-panel, .radial-menu-wrapper, .rm-item, .rm-core-btn, .menu-fab, #ham-panel, #ham-overlay, a, button, input, textarea, select, .site-portal, .theme-toggle, .nav-toggle"
    );
  }

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (isUITarget(e.target)) return;
    startX = e.clientX;
    startY = e.clientY;
    if (isOpen) return;
    clearTimeout(timer);
    timer = setTimeout(function () {
      timer = null;
      if (pieDisabled) return;
      openMenu(startX, startY);
    }, LONG_PRESS_MS);
  }

  function onPointerMove(e) {
    if (!timer) return;
    var dx = e.clientX - startX;
    var dy = e.clientY - startY;
    if (Math.sqrt(dx * dx + dy * dy) > MOVE_THRESHOLD) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function onPointerUp() {
    if (timer) { clearTimeout(timer); timer = null; }
  }

  function onClick(e) {
    if (!isUITarget(e.target) && !isOpen) {
      tapCount++;
      clearTimeout(tapTimer);
      if (tapCount >= 3) {
        tapCount = 0;
        openMenu(e.clientX, e.clientY);
        return;
      }
      tapTimer = setTimeout(function () { tapCount = 0; }, TRIPLE_TAP_DELAY_MS);
    }
    if (isOpen && Date.now() > ignoreOutsideUntil) {
      if (menuEl && !menuEl.contains(e.target)) closeMenu();
    }
    if (hamOpen && hamPanel && hamFab) {
      if (!hamPanel.contains(e.target) && e.target !== hamFab && !hamFab.contains(e.target)) {
        closeHamburger();
      }
    }
  }

  var hamFab, hamPanel, hamOpen = false;

  function closeHamburger() {
    hamOpen = false;
    if (hamFab) hamFab.classList.remove("open");
    if (hamPanel) hamPanel.classList.remove("open");
    pieDisabled = false;
  }

  function toggleHamburger() {
    hamOpen = !hamOpen;
    if (hamFab) hamFab.classList.toggle("open", hamOpen);
    if (hamPanel) hamPanel.classList.toggle("open", hamOpen);
    pieDisabled = hamOpen;
    if (hamOpen) closeMenu();
  }

  function buildHamburger() {
    hamFab = document.createElement("button");
    hamFab.type = "button";
    hamFab.className = "ham-fab";
    hamFab.setAttribute("aria-label", "\u30e1\u30cb\u30e5\u30fc");
    hamFab.innerHTML = "<span class=\"ham-fab-icon\">\u2630</span>";
    hamFab.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleHamburger();
    });
    hamPanel = document.createElement("div");
    hamPanel.className = "ham-panel";
    hamPanel.setAttribute("role", "menu");
    buildMenuData().forEach(function (entry) {
      var a = document.createElement("a");
      a.href = entry.url;
      a.className = "ham-link";
      a.setAttribute("role", "menuitem");
      a.innerHTML =
        '<span class="ham-icon">' +
        (entry.icon || "\u00b7") +
        "</span><span>" +
        entry.label +
        "</span>";
      a.addEventListener("click", function (e) {
        if (entry.url.indexOf("http") === 0) {
          closeHamburger();
          return;
        }
        e.preventDefault();
        navigateWithDelay(entry.url);
      });
      hamPanel.appendChild(a);
    });
    document.body.appendChild(hamPanel);
    document.body.appendChild(hamFab);
  }

  document.addEventListener("pointerdown", onPointerDown, { passive: true });
  document.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("pointerup", onPointerUp, { passive: true });
  document.addEventListener("pointercancel", onPointerUp, { passive: true });
  document.addEventListener("click", onClick);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeMenu(); closeHamburger(); }
  });

  function init() { createMenuDOM(); buildHamburger(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
