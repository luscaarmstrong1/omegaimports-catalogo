(() => {
  const openButton = document.querySelector(".hamburger-btn");
  const closeButton = document.querySelector(".drawer-close-btn");
  const drawer = document.querySelector(".mobile-drawer");
  const backdrop = document.querySelector(".mobile-drawer-backdrop");
  let previousFocus = null;

  function setDrawer(open) {
    if (!drawer || !backdrop || !openButton) return;
    drawer.classList.toggle("is-open", open);
    backdrop.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    openButton.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("drawer-open", open);
    if (open) {
      previousFocus = document.activeElement;
      closeButton?.focus();
    } else if (previousFocus instanceof HTMLElement) {
      previousFocus.focus();
    }
  }

  openButton?.addEventListener("click", () => setDrawer(true));
  closeButton?.addEventListener("click", () => setDrawer(false));
  backdrop?.addEventListener("click", () => setDrawer(false));
  drawer?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setDrawer(false)));
  document.addEventListener("keydown", (event) => {
    if (!drawer?.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      setDrawer(false);
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = [...drawer.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )].filter((element) => element instanceof HTMLElement && element.offsetParent !== null);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.querySelectorAll("[data-v2-carousel]").forEach((carousel) => {
    const track = carousel.querySelector(".products-carousel");
    const prev = carousel.querySelector(".carousel-prev");
    const next = carousel.querySelector(".carousel-next");
    const step = () => Math.max(260, Math.round((track?.clientWidth || 600) * .72));
    prev?.addEventListener("click", () => track?.scrollBy({ left: -step(), behavior: "smooth" }));
    next?.addEventListener("click", () => track?.scrollBy({ left: step(), behavior: "smooth" }));
  });

  const revealObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }), { rootMargin: "0px 0px -8%", threshold: .08 })
    : null;
  document.querySelectorAll(".reveal").forEach((element) => revealObserver ? revealObserver.observe(element) : element.classList.add("visible"));

  const hashTarget = window.location.hash ? document.querySelector(window.location.hash) : null;
  if (hashTarget instanceof HTMLDetailsElement) {
    hashTarget.open = true;
    requestAnimationFrame(() => hashTarget.scrollIntoView({ block: "center" }));
  }
})();
