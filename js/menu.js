/**
 * 美化改革 — Radial Menu + FAB (ported from committee)
 * FAB/panel can exist in HTML (preferred) or are created here.
 */
(function () {
  "use strict";

  function buildMenuData() {
    return [
      { label: "概要", icon: "⌂", url: "index.html" },
      { label: "ブランド", icon: "✦", url: "brand.html" },
      { label: "企画案", icon: "✎", url: "plans.html" },
      { label: "PJ", icon: "🚀", url: "projects.html" },
      { label: "組織化", icon: "◎", url: "org.html" },
      { label: "公式", icon: "🔗", url: "https://r25347sh.github.io/bika-committee/" }
    ];
  }

  var LONG_PRESS_MS = 400;
  var TRIPLE_TAP_DELAY_MS = 400;
  var MOVE_THRESHOLD = 14;
  var RADIUS = 120;

  var menuEl, itemsContainer, orbitsContainer, coreBtn, fxLayer;
  var timer = null, startX = 0, startY = 0;
  var isOpen = false;
  var pieDisabled = false;
  var tapCount = 0, tapTimer = null;
  var blockOutsideClose = false;
  var blockOutsideTimer = null;
  var pointerIsDown = false;
  var openedWhilePointerDown = false;
  var hamFab, hamPanel, hamOpen = false;

  function navigateWithDelay(url) {
    closeMenu();
    closeHamburger();
    setTimeout(function () {
      location.href = url;
    }, 180);
  }

  function layoutItems(n) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2 - Math.PI / 2;
      out.push({
        x: Math.round(Math.cos(a) * RADIUS),
        y: Math.round(Math.sin(a) * RADIUS),
        angle: a
      });
    }
    return out;
  }

  function spawnSparks() {
    if (!fxLayer) return;
    fxLayer.innerHTML = "";
    var glyphs = ["✦", "✧", "·", "∗", "⋆"];
    for (var i = 0; i < 14; i++) {
      var s = document.createElement("span");
      s.className = "rm-spark";
      s.textContent = glyphs[i % glyphs.length];
      var ang = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
      var dist = 40 + Math.random() * 90;
      s.style.setProperty("--sx", Math.cos(ang) * dist + "px");
      s.style.setProperty("--sy", Math.sin(ang) * dist + "px");
      s.style.animationDelay = i * 18 + "ms";
      fxLayer.appendChild(s);
    }
  }

  function renderItems(items) {
    if (!itemsContainer || !orbitsContainer) return;
    itemsContainer.innerHTML = "";
    orbitsContainer.innerHTML = "";

    [RADIUS, RADIUS * 0.55].forEach(function (r, qi) {
      var orbit = document.createElement("div");
      orbit.className = "rm-shell-orbit" + (qi === 1 ? " rm-shell-orbit--inner" : "");
      orbit.style.width = r * 2 + "px";
      orbit.style.height = r * 2 + "px";
      orbit.style.left = -r + "px";
      orbit.style.top = -r + "px";
      orbitsContainer.appendChild(orbit);
    });

    var pos = layoutItems(items.length);
    items.forEach(function (item, idx) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "rm-item";
      btn.setAttribute("data-label", item.label || "");
      btn.style.setProperty("--x", pos[idx].x + "px");
      btn.style.setProperty("--y", pos[idx].y + "px");
      btn.style.setProperty("--i", String(idx));
      btn.style.transitionDelay = 60 + idx * 70 + "ms";
      btn.innerHTML = "<span>" + (item.icon || "·") + "</span>";
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (item.url) navigateWithDelay(item.url);
      });
      itemsContainer.appendChild(btn);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          btn.classList.add("rendered");
        });
      });
    });
  }

  function armOutsideBlock(ms) {
    blockOutsideClose = true;
    clearTimeout(blockOutsideTimer);
    blockOutsideTimer = setTimeout(function () {
      blockOutsideClose = false;
    }, ms || 800);
  }

  function openMenu(x, y, fromLongPress) {
    if (pieDisabled) return;
    if (isOpen) {
      closeMenu();
      return;
    }
    isOpen = true;
    if (fromLongPress || pointerIsDown) {
      openedWhilePointerDown = true;
      armOutsideBlock(900);
    } else {
      openedWhilePointerDown = false;
      armOutsideBlock(500);
    }
    if (!menuEl) createMenuDOM();
    menuEl.style.left = x + "px";
    menuEl.style.top = y + "px";
    menuEl.classList.remove("active", "closing");
    void menuEl.offsetWidth;
    menuEl.classList.add("active");
    menuEl.setAttribute("aria-hidden", "false");
    spawnSparks();
    if (coreBtn) {
      coreBtn.classList.add("visible");
      coreBtn.textContent = "✕";
    }
    renderItems(buildMenuData());
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;
    openedWhilePointerDown = false;
    if (itemsContainer) {
      var nodes = itemsContainer.querySelectorAll(".rm-item");
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].style.transitionDelay = (nodes.length - 1 - i) * 40 + "ms";
        nodes[i].classList.remove("rendered");
        nodes[i].classList.add("closing");
      }
    }
    if (coreBtn) coreBtn.classList.remove("visible");
    if (menuEl) {
      menuEl.classList.add("closing");
      setTimeout(function () {
        if (!isOpen && menuEl) {
          menuEl.classList.remove("active", "closing");
          menuEl.setAttribute("aria-hidden", "true");
          if (fxLayer) fxLayer.innerHTML = "";
        }
      }, 480);
    }
  }

  function createMenuDOM() {
    if (menuEl && document.body.contains(menuEl)) return;
    menuEl = document.createElement("div");
    menuEl.className = "radial-menu-wrapper";
    menuEl.id = "radial-menu";
    menuEl.setAttribute("aria-hidden", "true");
    fxLayer = document.createElement("div");
    fxLayer.className = "rm-fx";
    orbitsContainer = document.createElement("div");
    orbitsContainer.className = "rm-canvas-layer";
    itemsContainer = document.createElement("div");
    itemsContainer.className = "rm-canvas-layer";
    coreBtn = document.createElement("button");
    coreBtn.type = "button";
    coreBtn.className = "rm-core-btn";
    coreBtn.textContent = "✕";
    coreBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
    });
    var blast = document.createElement("div");
    blast.className = "rm-blast";
    var blast2 = document.createElement("div");
    blast2.className = "rm-blast rm-blast--2";
    menuEl.appendChild(blast);
    menuEl.appendChild(blast2);
    menuEl.appendChild(fxLayer);
    menuEl.appendChild(orbitsContainer);
    menuEl.appendChild(itemsContainer);
    menuEl.appendChild(coreBtn);
    document.body.appendChild(menuEl);
  }

  function isUITarget(t) {
    if (!t || !t.closest) return false;
    return !!t.closest(
      ".ham-fab, .ham-panel, .radial-menu-wrapper, .rm-item, .rm-core-btn, a, button, input, textarea, select, .site-portal, .theme-toggle, .nav-toggle, #sp-edge-frame, #sp-menu-panel, #sp-menu-backdrop, #site-password-overlay, .top-nav"
    );
  }

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (isUITarget(e.target)) return;
    pointerIsDown = true;
    startX = e.clientX;
    startY = e.clientY;
    if (isOpen) return;
    clearTimeout(timer);
    timer = setTimeout(function () {
      timer = null;
      if (pieDisabled) return;
      openMenu(startX, startY, true);
    }, LONG_PRESS_MS);
  }

  function onPointerMove(e) {
    if (!timer) return;
    var dx = e.clientX - startX,
      dy = e.clientY - startY;
    if (Math.sqrt(dx * dx + dy * dy) > MOVE_THRESHOLD) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function onPointerUp() {
    pointerIsDown = false;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (openedWhilePointerDown) {
      armOutsideBlock(700);
      openedWhilePointerDown = false;
    }
  }

  function onClick(e) {
    if (blockOutsideClose) {
      if (!isOpen && !isUITarget(e.target)) {
        tapCount++;
        clearTimeout(tapTimer);
        if (tapCount >= 3) {
          tapCount = 0;
          openMenu(e.clientX, e.clientY, false);
        } else {
          tapTimer = setTimeout(function () {
            tapCount = 0;
          }, TRIPLE_TAP_DELAY_MS);
        }
      }
      return;
    }

    if (!isUITarget(e.target) && !isOpen) {
      tapCount++;
      clearTimeout(tapTimer);
      if (tapCount >= 3) {
        tapCount = 0;
        openMenu(e.clientX, e.clientY, false);
        return;
      }
      tapTimer = setTimeout(function () {
        tapCount = 0;
      }, TRIPLE_TAP_DELAY_MS);
    }

    if (isOpen && menuEl && !menuEl.contains(e.target)) {
      closeMenu();
    }
    if (hamOpen && hamPanel && hamFab) {
      if (!hamPanel.contains(e.target) && e.target !== hamFab && !hamFab.contains(e.target)) {
        closeHamburger();
      }
    }
  }

  function closeHamburger() {
    hamOpen = false;
    if (hamFab) {
      hamFab.classList.remove("open");
      hamFab.setAttribute("aria-expanded", "false");
    }
    if (hamPanel) {
      hamPanel.classList.remove("open");
      hamPanel.setAttribute("aria-hidden", "true");
    }
    pieDisabled = false;
  }

  function toggleHamburger() {
    hamOpen = !hamOpen;
    if (hamFab) {
      hamFab.classList.toggle("open", hamOpen);
      hamFab.setAttribute("aria-expanded", hamOpen ? "true" : "false");
    }
    if (hamPanel) {
      hamPanel.classList.toggle("open", hamOpen);
      hamPanel.setAttribute("aria-hidden", hamOpen ? "false" : "true");
    }
    pieDisabled = hamOpen;
    if (hamOpen) closeMenu();
  }

  function fillPanelLinks(panel) {
    if (!panel) return;
    if (panel.querySelector(".ham-link")) return;
    buildMenuData().forEach(function (entry) {
      var a = document.createElement("a");
      a.href = entry.url;
      a.className = "ham-link";
      a.innerHTML =
        '<span class="ham-icon">' +
        (entry.icon || "·") +
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
      panel.appendChild(a);
    });
  }

  function ensureHamburger() {
    hamFab = document.getElementById("ham-fab") || document.querySelector(".ham-fab");
    hamPanel = document.getElementById("ham-panel") || document.querySelector(".ham-panel");

    if (!hamFab) {
      hamFab = document.createElement("button");
      hamFab.type = "button";
      hamFab.className = "ham-fab";
      hamFab.id = "ham-fab";
      hamFab.setAttribute("aria-label", "メニュー");
      hamFab.setAttribute("aria-expanded", "false");
      hamFab.setAttribute("aria-controls", "ham-panel");
      hamFab.innerHTML = '<span class="ham-fab-icon" aria-hidden="true">☰</span>';
      document.body.appendChild(hamFab);
    }

    if (!hamPanel) {
      hamPanel = document.createElement("nav");
      hamPanel.className = "ham-panel";
      hamPanel.id = "ham-panel";
      hamPanel.setAttribute("aria-hidden", "true");
      document.body.appendChild(hamPanel);
    }

    fillPanelLinks(hamPanel);

    if (!hamFab.dataset.bound) {
      hamFab.dataset.bound = "1";
      hamFab.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleHamburger();
      });
    }

    hamFab.style.cssText = "position:fixed!important;right:max(1rem,env(safe-area-inset-right,0px))!important;bottom:max(1rem,env(safe-area-inset-bottom,0px))!important;width:58px!important;height:58px!important;z-index:2147483645!important;display:flex!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;background:#0a6b6e!important;color:#fff!important;border:3px solid #1a1e1b!important;border-radius:50%!important;align-items:center!important;justify-content:center!important;font-size:1.35rem!important;cursor:pointer!important;box-shadow:4px 4px 0 rgba(0,0,0,.25)!important;";
  }

  document.addEventListener("pointerdown", onPointerDown, { passive: true });
  document.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("pointerup", onPointerUp, { passive: true });
  document.addEventListener("pointercancel", onPointerUp, { passive: true });
  document.addEventListener("click", onClick, true);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeMenu();
      closeHamburger();
    }
  });

  function init() {
    try {
      createMenuDOM();
      ensureHamburger();
      console.info("[bika-reform-menu] ready — FAB + radial");
    } catch (err) {
      console.error("[bika-reform-menu] init failed", err);
      try {
        ensureHamburger();
      } catch (e2) {}
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
