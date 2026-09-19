// OMEGAIMPORTS V2 - MAIN APPLICATION CONTROLLER
import { mockProducts } from "../data/products.mock.js";
import { mockCategories } from "../data/categories.mock.js";
import { mockArticles } from "../data/articles.mock.js";
import { mockBrands } from "../data/brands.mock.js";
import { showToast } from "./toast.js";
import { initCarousel } from "./carousel.js";
import { initDrawer } from "./drawer.js";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initScrollReveal();
  initCarousel();
  initDrawer();
  initInteractiveMocks();
  
  const copyrightEl = document.getElementById("copyright-year");
  if (copyrightEl) {
    copyrightEl.textContent = new Date().getFullYear();
  }

  console.log("OMEGAIMPORTS V2 inicializada com sucesso em ambiente isolado.");
});

function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
}

function initScrollReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));
  } else {
    elements.forEach((el) => el.classList.add("is-visible"));
  }
}

function initInteractiveMocks() {
  // Busca
  const searchForms = document.querySelectorAll("form.header-search, form.hero-search-box, form.drawer-search");
  searchForms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      const val = input ? input.value.trim() : "";
      if (val) {
        showToast(`Buscando por: "${val}". Catálogo V2 em ambiente de testes.`);
      } else {
        showToast("Digite um termo para pesquisar componentes ou categorias.");
      }
    });
  });

  // Favoritos
  document.querySelectorAll(".product-card-fav").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.toggle("is-favorite");
      const isFav = btn.classList.contains("is-favorite");
      const heartIcon = btn.querySelector("svg");
      if (heartIcon) {
        heartIcon.setAttribute("fill", isFav ? "#EF4444" : "none");
        heartIcon.setAttribute("stroke", isFav ? "#EF4444" : "currentColor");
      }
      showToast(isFav ? "Produto adicionado aos favoritos de teste." : "Produto removido dos favoritos.");
    });
  });

  // Botões Ver Oferta
  document.querySelectorAll(".product-card .btn-yellow").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("Direcionamento para anúncio Mercado Livre na versão de produção.");
    });
  });

  // Carrinho Secundário
  document.querySelectorAll(".btn-icon-cart, .header-cart-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const countEl = document.querySelector(".header-cart-badge");
      if (countEl) {
        const current = parseInt(countEl.textContent, 10) || 0;
        countEl.textContent = current + 1;
      }
      showToast("Item simulado adicionado à sacola de testes.");
    });
  });

  // Minha Conta
  document.querySelectorAll(".header-account-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("Área do cliente simulada. Login disponível na versão final.");
    });
  });

  // Newsletter Forms
  document.querySelectorAll(".newsletter-form, form.footer-newsletter-compact").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = form.querySelector("input[type='email']");
      if (emailInput && emailInput.value) {
        showToast("Obrigado! Seu e-mail foi cadastrado na lista de novidades (Simulação).");
        emailInput.value = "";
      } else {
        showToast("Por favor, insira um e-mail válido.");
      }
    });
  });

  // WhatsApp / Especialista
  document.querySelectorAll(".btn-whatsapp, .btn-specialist").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // Abre WhatsApp em nova aba se link configurado, mas também avisa
      const href = btn.getAttribute("href");
      if (!href || href === "#" || href.startsWith("javascript")) {
        e.preventDefault();
        window.open("https://wa.me/5535999528858?text=Olá!%20Vim%20pela%20V2%20da%20OMEGAIMPORTS", "_blank");
      }
    });
  });
}
