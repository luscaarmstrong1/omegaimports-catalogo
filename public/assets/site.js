const root = document.documentElement;
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
const condition = document.querySelector("#condition-filter");
const packageFilter = document.querySelector("#package-filter");
const imageFilter = document.querySelector("#image-filter");
const sortFilter = document.querySelector("#sort-filter");
const list = document.querySelector("#product-list");
const empty = document.querySelector("#empty-state");
const count = document.querySelector("#result-count");

function normalize(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function syncFromUrl() {
  const params = new URLSearchParams(location.search);
  if (search) search.value = params.get("q") || "";
  if (category) category.value = params.get("categoria") || "";
}

function applyFilters() {
  if (!list) return;
  let cards = [...list.querySelectorAll(".product-card")];
  const q = normalize(search?.value || "");
  const cat = category?.value || "";
  const cond = condition?.value || "";
  const pack = packageFilter?.value || "";
  const img = imageFilter?.value || "";
  let visible = 0;
  for (const card of cards) {
    const ok =
      (!q || normalize(card.textContent || "").includes(q) || normalize(card.dataset.mlb || "").includes(q)) &&
      (!cat || card.dataset.category === cat) &&
      (!cond || card.dataset.condition === cond) &&
      (!pack || card.dataset.package === pack) &&
      (!img || card.dataset.imageStatus === img);
    card.hidden = !ok;
    if (ok) visible++;
  }
  const sort = sortFilter?.value || "relevance";
  cards.sort((a, b) => {
    if (sort === "title") return (a.dataset.title || "").localeCompare(b.dataset.title || "");
    if (sort === "price-asc") return Number(a.dataset.price || 99999999) - Number(b.dataset.price || 99999999);
    if (sort === "price-desc") return Number(b.dataset.price || 0) - Number(a.dataset.price || 0);
    return 0;
  });
  cards.forEach((card) => list.append(card));
  if (count) count.textContent = String(visible);
  if (empty) empty.hidden = visible !== 0;
  const params = new URLSearchParams(location.search);
  if (search?.value) params.set("q", search.value); else params.delete("q");
  if (category?.value) params.set("categoria", category.value); else params.delete("categoria");
  history.replaceState(null, "", `${location.pathname}${params.toString() ? `?${params}` : ""}`);
  track("search_used", { query: search?.value || "", results: visible });
}

if (list) {
  syncFromUrl();
  [search, category, condition, packageFilter, imageFilter, sortFilter].forEach((input) => input?.addEventListener("input", applyFilters));
  applyFilters();
}
