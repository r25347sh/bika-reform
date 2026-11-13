(function () {
  const root = document.documentElement;
  const saved = localStorage.getItem("bika-theme");
  if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);
  document.querySelector(".theme-toggle")?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("bika-theme", next);
  });
  // close mobile nav when a link is tapped
  document.querySelectorAll(".nav-links a").forEach((a) => {
    a.addEventListener("click", () => {
      const c = document.getElementById("nav-check");
      if (c) c.checked = false;
    });
  });
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
    { threshold: 0.1 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();
