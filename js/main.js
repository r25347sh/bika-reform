(function () {
  const root = document.documentElement;
  const saved = localStorage.getItem("bika-theme");
  if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);

  document.querySelector(".theme-toggle")?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("bika-theme", next);
  });

  // ===== Mobile nav: default VISIBLE in CSS; JS starts closed with .is-closed =====
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");

  function setOpen(open) {
    if (!nav) return;
    nav.classList.toggle("is-closed", !open);
    nav.classList.toggle("is-open", !!open);
    if (toggle) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    }
  }

  if (nav && window.innerWidth <= 900) setOpen(false);
  else if (nav) setOpen(true);

  if (toggle && nav) {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const open = nav.classList.contains("is-closed");
      setOpen(open);
    });
  }

  document.querySelectorAll(".nav-links a").forEach((a) => {
    a.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("click", (e) => {
    if (!nav || nav.classList.contains("is-closed")) return;
    if (nav.contains(e.target)) return;
    if (window.innerWidth > 900) return;
    setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) setOpen(true);
    else if (!nav.classList.contains("is-open")) setOpen(false);
  });

  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
    { threshold: 0.1 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();
