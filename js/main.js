(function () {
  "use strict";
  const root = document.documentElement;
  const saved = localStorage.getItem("bika-theme");
  if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);

  document.querySelector(".theme-toggle")?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("bika-theme", next);
  });

  // Mobile nav is pure CSS (checkbox). JS only closes after navigation / Escape.
  const cb = document.getElementById("nav-cb");
  function closeNav() {
    if (cb) cb.checked = false;
  }
  document.querySelectorAll(".nav-links a").forEach((a) => {
    a.addEventListener("click", closeNav);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });
  document.addEventListener("click", (e) => {
    if (!cb || !cb.checked) return;
    const nav = document.getElementById("site-nav");
    if (nav && nav.contains(e.target)) return;
    closeNav();
  });

  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
    { threshold: 0.1 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();
