// OMEGAIMPORTS V2 - CAROUSEL CONTROLLER

export function initCarousel() {
  const carousel = document.querySelector(".products-carousel");
  const prevBtn = document.querySelector(".carousel-prev");
  const nextBtn = document.querySelector(".carousel-next");
  const dots = document.querySelectorAll(".carousel-dot");

  if (!carousel) return;

  const getScrollAmount = () => {
    const card = carousel.querySelector(".product-card");
    if (!card) return 300;
    const style = window.getComputedStyle(carousel);
    const gap = parseFloat(style.columnGap || style.gap || 20);
    return card.offsetWidth + gap;
  };

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      carousel.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      carousel.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
    });
  }

  const updateDots = () => {
    if (!dots.length) return;
    const scrollLeft = carousel.scrollLeft;
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    if (maxScroll <= 0) return;
    const index = Math.min(
      dots.length - 1,
      Math.round((scrollLeft / maxScroll) * (dots.length - 1))
    );
    dots.forEach((dot, idx) => {
      dot.classList.toggle("active", idx === index);
      dot.setAttribute("aria-current", idx === index ? "true" : "false");
    });
  };

  carousel.addEventListener("scroll", updateDots, { passive: true });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      const targetScroll = (index / (dots.length - 1)) * maxScroll;
      carousel.scrollTo({ left: targetScroll, behavior: "smooth" });
    });
  });
}
