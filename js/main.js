(function () {
  const root = document.documentElement;
  const saved = localStorage.getItem("bika-theme");
  if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);

  document.querySelector(".theme-toggle")?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("bika-theme", next);
  });

  // ===== Mobile nav: class-based toggle (reliable) =====
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("nav-links");

  function setOpen(open) {
    if (!nav) return;
    nav.classList.toggle("is-open", !!open);
    if (toggle) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    }
  }

  if (toggle && nav) {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!nav.classList.contains("is-open"));
    });
  }

  // close when a link is tapped
  document.querySelectorAll(".nav-links a").forEach((a) => {
    a.addEventListener("click", () => setOpen(false));
  });

  // close on outside click
  document.addEventListener("click", (e) => {
    if (!nav || !nav.classList.contains("is-open")) return;
    if (nav.contains(e.target)) return;
    setOpen(false);
  });

  // close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  // close if resized to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) setOpen(false);
  });

  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
    { threshold: 0.1 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();
