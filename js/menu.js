/**
 * 美化改革 — Radial Menu + Hamburger FAB
 */
(function () {
  "use strict";

  function buildMenuData() {
    return [
      { label: "概要", icon: "📋", url: "index.html" },
      { label: "ブランド化", icon: "✨", url: "brand.html" },
      { label: "企画案", icon: "💡", url: "plans.html" },
      { label: "公式サイト", icon: "🏠", url: "https://r25347sh.github.io/bika-committee/" }
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
      btn.style.transitionDelay = idx * 32 + "ms";
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
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { btn.classList.add("rendered"); });
      });
    });
    Object.keys(shellsUsed).forEach(function (sIdx) {
      var r = SHELL_RADII[parseInt(sIdx, 10)];
      var orbit = document.createElement("div");
      orbit.className = "rm-shell-orbit";
      orbit.style.width = r * 2 + "px";
      orbit.style.height = r * 2 + "px";
      orbit.style.marginLeft = -r + "px";
      orbit.style.marginTop = -r + "px";
      orbitsContainer.appendChild(orbit);
    });
  }

  function openMenu(x, y) {
    if (pieDisabled || isOpen) return;
    isOpen = true;
    menuStack = [];
    if (!menuEl) createMenuDOM();
    menuEl.style.left = x + "px";
    menuEl.style.top = y + "px";
    menuEl.classList.add("active");
    if (coreBtn) coreBtn.classList.remove("visible");
    renderItems(buildMenuData());
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;
    if (menuEl) menuEl.classList.remove("active");
    if (itemsContainer) {
      var nodes = itemsContainer.querySelectorAll(".rm-item");
      for (var i = 0; i < nodes.length; i++) nodes[i].classList.remove("rendered");
    }
    if (coreBtn) coreBtn.classList.remove("visible");
  }

  function createMenuDOM() {
    menuEl = document.createElement("div");
    menuEl.className = "radial-menu-wrapper";
    orbitsContainer = document.createElement("div");
    orbitsContainer.className = "rm-canvas-layer";
    itemsContainer = document.createElement("div");
    itemsContainer.className = "rm-canvas-layer";
    coreBtn = document.createElement("button");
    coreBtn.type = "button";
    coreBtn.className = "rm-core-btn";
    coreBtn.setAttribute("aria-label", "戻る");
    coreBtn.textContent = "↩";
    coreBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (menuStack.length) {
        renderItems(menuStack.pop());
        if (!menuStack.length) coreBtn.classList.remove("visible");
      } else closeMenu();
    });
    menuEl.appendChild(orbitsContainer);
    menuEl.appendChild(itemsContainer);
    menuEl.appendChild(coreBtn);
    document.body.appendChild(menuEl);
  }

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest && e.target.closest(".ham-fab, .ham-panel, .radial-menu-wrapper, a, button, input, textarea, select")) return;
    startX = e.clientX;
    startY = e.clientY;
    clearTimeout(timer);
    timer = setTimeout(function () { openMenu(startX, startY); }, LONG_PRESS_MS);
  }
  function onPointerMove(e) {
    if (!timer) return;
    if (Math.abs(e.clientX - startX) > MOVE_THRESHOLD || Math.abs(e.clientY - startY) > MOVE_THRESHOLD) {
      clearTimeout(timer); timer = null;
    }
  }
  function onPointerUp() { clearTimeout(timer); timer = null; }
  function onTripleTap(e) {
    if (e.target.closest && e.target.closest(".ham-fab, .ham-panel, .radial-menu-wrapper, a, button")) return;
    tapCount++;
    clearTimeout(tapTimer);
    if (tapCount >= 3) { tapCount = 0; openMenu(e.clientX, e.clientY); return; }
    tapTimer = setTimeout(function () { tapCount = 0; }, TRIPLE_TAP_DELAY_MS);
  }

  var hamFab, hamPanel, hamOpen = false;
  function closeHamburger() {
    hamOpen = false;
    if (hamFab) hamFab.classList.remove("open");
    if (hamPanel) hamPanel.classList.remove("open");
  }
  function toggleHamburger() {
    hamOpen = !hamOpen;
    if (hamFab) hamFab.classList.toggle("open", hamOpen);
    if (hamPanel) hamPanel.classList.toggle("open", hamOpen);
  }
  function buildHamburger() {
    hamFab = document.createElement("button");
    hamFab.type = "button";
    hamFab.className = "ham-fab";
    hamFab.setAttribute("aria-label", "メニュー");
    hamFab.innerHTML = "☰";
    hamFab.addEventListener("click", function (e) { e.stopPropagation(); toggleHamburger(); });
    hamPanel = document.createElement("div");
    hamPanel.className = "ham-panel";
    hamPanel.setAttribute("role", "menu");
    buildMenuData().forEach(function (entry) {
      var a = document.createElement("a");
      a.href = entry.url;
      a.className = "ham-link";
      a.innerHTML = '<span class="ham-icon">' + (entry.icon || "·") + "</span><span>" + entry.label + "</span>";
      a.addEventListener("click", function (e) {
        if (entry.url.indexOf("http") === 0) return;
        e.preventDefault();
        navigateWithDelay(entry.url);
      });
      hamPanel.appendChild(a);
    });
    document.body.appendChild(hamPanel);
    document.body.appendChild(hamFab);
  }

  document.addEventListener("mousedown", onPointerDown);
  document.addEventListener("mousemove", onPointerMove);
  document.addEventListener("mouseup", onPointerUp);
  document.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) return;
    onPointerDown(e.touches[0]);
  }, { passive: true });
  document.addEventListener("touchmove", function (e) {
    if (e.touches.length !== 1) return;
    onPointerMove(e.touches[0]);
  }, { passive: true });
  document.addEventListener("touchend", onPointerUp);
  document.addEventListener("click", onTripleTap);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeMenu(); closeHamburger(); }
  });
  document.addEventListener("click", function (e) {
    if (isOpen && menuEl && !menuEl.contains(e.target)) closeMenu();
    if (hamOpen && hamPanel && !hamPanel.contains(e.target) && e.target !== hamFab) closeHamburger();
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", buildHamburger);
  else buildHamburger();
})();
