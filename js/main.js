(function () {
  const root = document.documentElement;
  const saved = localStorage.getItem("bika-theme");
  if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);
  document.querySelector(".theme-toggle")?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("bika-theme", next);
  });
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = links?.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.addEventListener("click", (e) => {
    if (!links?.classList.contains("open")) return;
    if (links.contains(e.target) && e.target.tagName === "A") {
      links.classList.remove("open");
      toggle?.setAttribute("aria-expanded", "false");
      return;
    }
    if (!links.contains(e.target) && e.target !== toggle && !toggle?.contains(e.target)) {
      links.classList.remove("open");
      toggle?.setAttribute("aria-expanded", "false");
    }
  });
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
    { threshold: 0.1 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();
