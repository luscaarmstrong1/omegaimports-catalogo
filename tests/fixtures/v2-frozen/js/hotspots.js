import { desktopHotspots } from "../data/hotspots.desktop.js";
import { showToast } from "./toast.js";

export function initMasterHotspots() {
  const container = document.querySelector(".desktop-master-layout");
  if (!container) return;

  // Percorre cada seção master e injeta os hotspots
  Object.entries(desktopHotspots).forEach(([secKey, spots]) => {
    const secEl = container.querySelector(`[data-master-section="${secKey}"]`);
    if (!secEl) return;

    const layer = secEl.querySelector(".interaction-layer");
    if (!layer) return;

    spots.forEach(spot => {
      let el;
      if (spot.type === 'search') {
        el = document.createElement('form');
        el.className = 'master-search-form';
        el.style.position = 'absolute';
        el.style.left = `${spot.left}%`;
        el.style.top = `${spot.top}%`;
        el.style.width = `${spot.width}%`;
        el.style.height = `${spot.height}%`;
        el.style.zIndex = '12';

        const input = document.createElement('input');
        input.type = 'search';
        input.className = 'master-search-input';
        input.style.width = '100%';
        input.style.height = '100%';
        input.placeholder = 'Buscar componentes...';
        input.setAttribute('aria-label', spot.label);

        el.appendChild(input);
        el.addEventListener('submit', (e) => {
          e.preventDefault();
          const query = input.value.trim();
          showToast(query ? `Buscando por: "${query}" (Catálogo V3 Mock)` : 'Digite um termo de pesquisa.');
        });
      } else if (spot.href) {
        el = document.createElement('a');
        el.className = 'master-hotspot';
        el.href = spot.href;
        el.setAttribute('aria-label', spot.label);
        el.title = spot.label;
        if (spot.href.startsWith('http')) {
          el.target = '_blank';
          el.rel = 'noopener noreferrer';
        }
        el.style.left = `${spot.left}%`;
        el.style.top = `${spot.top}%`;
        el.style.width = `${spot.width}%`;
        el.style.height = `${spot.height}%`;
      } else {
        el = document.createElement('button');
        el.type = 'button';
        el.className = 'master-hotspot';
        el.setAttribute('aria-label', spot.label);
        el.title = spot.label;
        el.style.left = `${spot.left}%`;
        el.style.top = `${spot.top}%`;
        el.style.width = `${spot.width}%`;
        el.style.height = `${spot.height}%`;

        el.addEventListener('click', (e) => {
          e.preventDefault();
          if (spot.type === 'add-cart' || spot.action === 'cart') {
            const countEl = document.querySelector('.header-cart-badge');
            if (countEl) {
              const current = parseInt(countEl.textContent, 10) || 0;
              countEl.textContent = current + 1;
            }
            showToast(`Item simulado adicionado à sacola: ${spot.label}`);
          } else if (spot.action === 'account') {
            showToast('Área Minha Conta simulada para testes.');
          } else if (spot.type === 'category') {
            showToast(`Categoria selecionada: ${spot.label}`);
          } else if (spot.type === 'product') {
            showToast(`Visualizando produto: ${spot.label}`);
          } else if (spot.type === 'article') {
            showToast(`Abrindo artigo: ${spot.label}`);
          } else if (spot.type === 'newsletter') {
            showToast('Cadastre-se na newsletter da OMEGAIMPORTS.');
          } else {
            showToast(`Ação: ${spot.label}`);
          }
        });
      }

      layer.appendChild(el);
    });
  });

  console.log('Hotspots Desktop V3 Master inicializados com sucesso.');
}
