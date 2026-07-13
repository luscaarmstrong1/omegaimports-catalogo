const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");

function track(name, payload = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...payload });
  if (typeof window.gtag === "function") window.gtag("event", name, payload);
}

if (menuButton && mobileMenu) {
  menuButton.addEventListener("click", () => {
    const open = mobileMenu.hasAttribute("hidden");
    mobileMenu.toggleAttribute("hidden", !open);
    menuButton.setAttribute("aria-expanded", String(open));
    if (open) mobileMenu.querySelector("a")?.focus();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !mobileMenu.hasAttribute("hidden")) {
      mobileMenu.setAttribute("hidden", "");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.focus();
    }
  });
  mobileMenu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      mobileMenu.setAttribute("hidden", "");
      menuButton.setAttribute("aria-expanded", "false");
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

const search = document.querySelector("#catalog-search");
const category = document.querySelector("#category-filter");
const family = document.querySelector("#family-filter");
const condition = document.querySelector("#condition-filter");
const packageFilter = document.querySelector("#package-filter");
const priceFilter = document.querySelector("#price-filter");
const sortFilter = document.querySelector("#sort-filter");
const clearButton = document.querySelector("#clear-filters");
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

if (list) {
  syncFromUrl();
  [search, category, family, condition, packageFilter, priceFilter, sortFilter].forEach((input) => input?.addEventListener("input", applyFilters));
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
