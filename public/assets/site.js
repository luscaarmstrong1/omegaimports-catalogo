const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");
const menuOverlay = document.querySelector("#mobile-menu-overlay");
const menuCloseButton = document.querySelector(".mobile-menu-close");
const searchButton = document.querySelector(".search-toggle");
const mobileSearchPanel = document.querySelector("#mobile-search-panel");
const mobileSearchClose = document.querySelector(".mobile-search-close");
let lastFocusedBeforeMenu = null;
let lastFocusedBeforeSearch = null;

function track(name, payload = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...payload });
  if (typeof window.gtag === "function") window.gtag("event", name, payload);
}

function setHidden(element, hidden) {
  if (!element) return;
  if (hidden) element.setAttribute("hidden", "");
  else element.removeAttribute("hidden");
}

function isHidden(element) {
  return !element || element.hasAttribute("hidden");
}

function focusFirst(container) {
  container?.querySelector("button, a, input, select, textarea, [tabindex]:not([tabindex='-1'])")?.focus();
}

if (searchButton && mobileSearchPanel) {
  const closeSearch = ({ restoreFocus = true } = {}) => {
    setHidden(mobileSearchPanel, true);
    searchButton.setAttribute("aria-expanded", "false");
    searchButton.setAttribute("aria-label", "Abrir busca");
    document.body.classList.remove("search-open");
    if (restoreFocus) lastFocusedBeforeSearch?.focus();
  };
  const openSearch = () => {
    if (mobileMenu && !isHidden(mobileMenu)) menuCloseButton?.click();
    lastFocusedBeforeSearch = document.activeElement;
    setHidden(mobileSearchPanel, false);
    searchButton.setAttribute("aria-expanded", "true");
    searchButton.setAttribute("aria-label", "Fechar busca");
    document.body.classList.add("search-open");
    mobileSearchPanel.querySelector("input")?.focus();
  };
  searchButton.addEventListener("click", () => {
    if (isHidden(mobileSearchPanel)) openSearch();
    else closeSearch();
  });
  mobileSearchClose?.addEventListener("click", () => closeSearch());
}

if (menuButton && mobileMenu) {
  const closeMenu = () => {
    setHidden(mobileMenu, true);
    setHidden(menuOverlay, true);
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menu");
    document.body.classList.remove("menu-open");
    lastFocusedBeforeMenu?.focus();
  };
  const openMenu = () => {
    if (mobileSearchPanel && !isHidden(mobileSearchPanel)) mobileSearchClose?.click();
    lastFocusedBeforeMenu = document.activeElement;
    setHidden(mobileMenu, false);
    setHidden(menuOverlay, false);
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Fechar menu");
    document.body.classList.add("menu-open");
    focusFirst(mobileMenu);
  };
  menuButton.addEventListener("click", () => {
    if (isHidden(mobileMenu)) openMenu();
    else closeMenu();
  });
  menuOverlay?.addEventListener("click", closeMenu);
  menuCloseButton?.addEventListener("click", closeMenu);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !isHidden(mobileMenu)) {
      closeMenu();
    }
    if (event.key === "Escape" && !isHidden(mobileSearchPanel)) {
      mobileSearchClose?.click();
    }
    if (event.key === "Tab" && !isHidden(mobileMenu)) {
      const focusable = [...mobileMenu.querySelectorAll("a, button")];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  mobileMenu.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      closeMenu();
    }
  });
}

document.querySelectorAll(".marketplace-link").forEach((link) => {
  link.addEventListener("click", () => {
    track("marketplace_click", {
      mlbId: link.dataset.mlb,
      productTitle: link.dataset.title,
      category: link.dataset.category,
      sourcePage: location.pathname,
      cardPosition: link.dataset.position,
    });
  });
});

document.querySelectorAll(".whatsapp-link").forEach((link) => {
  link.addEventListener("click", () => {
    track("whatsapp_click", {
      sourcePage: location.pathname,
    });
  });
});

document.querySelectorAll("[data-event='category_click']").forEach((link) => {
  link.addEventListener("click", () => {
    track("category_click", {
      category: link.dataset.category,
      position: link.dataset.position,
      sourcePage: location.pathname,
    });
  });
});

const search = document.querySelector("#catalog-search");
const category = document.querySelector("#category-filter");
const family = document.querySelector("#family-filter");
const condition = document.querySelector("#condition-filter");
const packageFilter = document.querySelector("#package-filter");
const priceFilter = document.querySelector("#price-filter");
const sortFilter = document.querySelector("#sort-filter");
const clearButton = document.querySelector("#clear-filters");
const applyFilterButton = document.querySelector("#apply-filters");
const filterToggle = document.querySelector(".filter-toggle");
const filterClose = document.querySelector(".filter-close");
const filtersPanel = document.querySelector("#catalog-filters");
const filterScrim = document.querySelector("#filter-scrim");
const list = document.querySelector("#product-list");
const empty = document.querySelector("#empty-state");
const count = document.querySelector("#result-count");

function normalize(value) {
  return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function syncFromUrl() {
  const params = new URLSearchParams(location.search);
  if (search) search.value = params.get("q") || "";
  if (category) category.value = params.get("categoria") || "";
  if (family) family.value = params.get("familia") || "";
  if (condition) condition.value = params.get("condicao") || "";
  if (packageFilter) packageFilter.value = params.get("formato") || "";
  if (priceFilter) priceFilter.value = params.get("preco") || "";
  if (sortFilter) sortFilter.value = params.get("ordem") || "relevance";
}

function setParam(params, key, value) {
  if (value) params.set(key, value);
  else params.delete(key);
}

function applyFilters() {
  if (!list) return;
  const cards = [...list.querySelectorAll(".product-card")];
  const q = normalize(search?.value || "");
  const cat = category?.value || "";
  const fam = family?.value || "";
  const cond = condition?.value || "";
  const pack = packageFilter?.value || "";
  const priceRange = priceFilter?.value || "";
  const [priceMin, priceMax] = priceRange ? priceRange.split("-").map(Number) : [0, Infinity];
  let visible = 0;

  for (const card of cards) {
    const price = Number(card.dataset.price || 0);
    const ok =
      (!q || normalize(card.textContent || "").includes(q) || normalize(card.dataset.mlb || "").includes(q)) &&
      (!cat || card.dataset.category === cat) &&
      (!fam || card.dataset.family === fam) &&
      (!cond || card.dataset.condition === cond) &&
      (!pack || card.dataset.package === pack) &&
      (!priceRange || (price >= priceMin && price <= priceMax));
    card.hidden = !ok;
    if (ok) visible++;
  }

  const sort = sortFilter?.value || "relevance";
  cards.sort((a, b) => {
    if (sort === "title") return (a.dataset.title || "").localeCompare(b.dataset.title || "");
    if (sort === "price-asc") return Number(a.dataset.price || 99999999) - Number(b.dataset.price || 99999999);
    if (sort === "price-desc") return Number(b.dataset.price || 0) - Number(a.dataset.price || 0);
    if (sort === "featured") return Number(b.dataset.featured || 0) - Number(a.dataset.featured || 0);
    return 0;
  });
  cards.forEach((card) => list.append(card));

  if (count) count.textContent = String(visible);
  if (empty) empty.hidden = visible !== 0;
  const activeFilters = [search, category, family, condition, packageFilter, priceFilter].filter((input) => input?.value).length;
  if (filterToggle) {
    filterToggle.setAttribute("aria-label", activeFilters ? `Filtrar e ordenar, ${activeFilters} filtros ativos` : "Filtrar e ordenar");
    const label = activeFilters ? `Filtrar (${activeFilters})` : "Filtrar e ordenar";
    const icon = filterToggle.querySelector("svg")?.outerHTML || "";
    filterToggle.innerHTML = `${icon} ${label}`;
  }

  const params = new URLSearchParams(location.search);
  setParam(params, "q", search?.value || "");
  setParam(params, "categoria", category?.value || "");
  setParam(params, "familia", family?.value || "");
  setParam(params, "condicao", condition?.value || "");
  setParam(params, "formato", packageFilter?.value || "");
  setParam(params, "preco", priceFilter?.value || "");
  setParam(params, "ordem", sortFilter?.value && sortFilter.value !== "relevance" ? sortFilter.value : "");
  history.replaceState(null, "", `${location.pathname}${params.toString() ? `?${params}` : ""}`);
  track("catalog_filter_used", { query: search?.value || "", results: visible });
}

function closeFilters() {
  filtersPanel?.classList.remove("is-open");
  filterToggle?.setAttribute("aria-expanded", "false");
  setHidden(filterScrim, true);
  document.body.classList.remove("filters-open");
  filterToggle?.focus();
}

function openFilters() {
  filtersPanel?.classList.add("is-open");
  filterToggle?.setAttribute("aria-expanded", "true");
  setHidden(filterScrim, false);
  document.body.classList.add("filters-open");
  focusFirst(filtersPanel);
}

if (list) {
  syncFromUrl();
  [search, category, family, condition, packageFilter, priceFilter, sortFilter].forEach((input) => input?.addEventListener("input", applyFilters));
  filterToggle?.addEventListener("click", () => {
    if (filtersPanel?.classList.contains("is-open")) closeFilters();
    else openFilters();
  });
  filterClose?.addEventListener("click", closeFilters);
  filterScrim?.addEventListener("click", closeFilters);
  applyFilterButton?.addEventListener("click", closeFilters);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && filtersPanel?.classList.contains("is-open")) closeFilters();
  });
  clearButton?.addEventListener("click", () => {
    [search, category, family, condition, packageFilter, priceFilter].forEach((input) => {
      if (input) input.value = "";
    });
    if (sortFilter) sortFilter.value = "relevance";
    applyFilters();
    search?.focus();
  });
  applyFilters();
}

document.querySelectorAll("form[role='search']").forEach((form) => {
  form.addEventListener("submit", () => {
    const input = form.querySelector("input[type='search']");
    track("search", { sourcePage: location.pathname, hasQuery: Boolean(input?.value) });
  });
});

const blogSearch = document.querySelector("#blog-search");
const articleCards = document.querySelectorAll(".article-card");
const blogCount = document.querySelector("#blog-result-count");
const blogEmpty = document.querySelector("#blog-empty-state");
const blogCategoryChips = document.querySelectorAll("[data-blog-category]");
if (blogSearch && articleCards.length) {
  const params = new URLSearchParams(location.search);
  const activeCategoryLabel = params.get("categoria") || "";
  const activeCategory = normalize(activeCategoryLabel);
  blogSearch.value = params.get("q") || "";

  function applyBlogFilters() {
    const query = normalize(blogSearch.value);
    let visible = 0;
    articleCards.forEach((card) => {
      const categoryOk = !activeCategory || card.dataset.blogCategory === activeCategory;
      const queryOk = !query || normalize(card.textContent || "").includes(query);
      card.hidden = !(categoryOk && queryOk);
      if (!card.hidden) visible++;
    });
    if (blogCount) blogCount.textContent = String(visible);
    if (blogEmpty) blogEmpty.hidden = visible !== 0;
    const next = new URLSearchParams(location.search);
    setParam(next, "q", blogSearch.value || "");
    history.replaceState(null, "", `${location.pathname}${next.toString() ? `?${next}` : ""}`);
  }

  blogCategoryChips.forEach((chip) => {
    const isActive = chip.dataset.blogCategory === activeCategory;
    chip.toggleAttribute("aria-current", isActive);
  });

  blogSearch.addEventListener("input", applyBlogFilters);
  applyBlogFilters();
}

const article = document.querySelector(".article-detail");
if (article) {
  const progress = document.createElement("div");
  progress.className = "reading-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.prepend(progress);
  document.addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  }, { passive: true });
}
