let _mn_pricesCache = null;
function getPrices(pricesFile = 'assets/json/prices.json') {
  if (_mn_pricesCache) return Promise.resolve(_mn_pricesCache);
  return fetch(pricesFile)
    .then(res => res.json())
    .then(prices => {
      _mn_pricesCache = prices;
      return prices;
    });
}

window.renderProducts = function(productsToShow, options = {}) {
  const pricesFile = 'assets/json/prices.json';
  getPrices(pricesFile).then(prices => {
    const gridSelector = options.gridSelector || '.products-grid';
    const grid = document.querySelector(gridSelector);
    if (!grid) return;
      grid.innerHTML = "";

    // Modal elements
    const modal = document.getElementById(options.modalId || 'product-modal');
    const modalBody = modal?.querySelector('.product-modal-body');
    const modalClose = modal?.querySelector('.product-modal-close');

    productsToShow.forEach(product => {
      if (!product || typeof product !== "object") return;
      const tile = document.createElement('div');
      tile.className = 'product-tile';
      tile.tabIndex = 0;

      let imagesHtml = '';
      if (Array.isArray(product.imgs) && product.imgs.length > 0) {
        imagesHtml = `
          <div class="product-images">
            <img loading="lazy" src="${product.imgs[0].img}" alt="${product.imgs[0].alt || product.name}">
          </div>
        `;
      }

      // Get price from prices.json using product.cost as key
      let priceText = '';
      if (product.cost && prices && prices[product.cost]) {
        priceText = prices[product.cost];
      } else if (product.cost) {
        priceText = product.cost;
      } else {
        priceText = '';
      }

      tile.innerHTML = `
        ${imagesHtml}
        <div class="product-title">${product.name || ''}</div>
        <div class="product-collection">${product.collection || ''}</div>
        <div class="product-cost">Precio: ${priceText}</div>
      `;

      tile.addEventListener('click', () => {
        if (!modal || !modalBody) return;
        let allImagesHtml = '';
        if (Array.isArray(product.imgs) && product.imgs.length > 0) {
          if(product.imgs.length == 1){
            allImagesHtml = `<img src="${product.imgs[0].img}" alt="${product.imgs[0].alt || product.name}">`;
          } else{
            allImagesHtml = `
              <div class="swiper product-modal-swiper">
                <div class="swiper-wrapper">
                  ${product.imgs.map(imgObj =>
                    `<div class="swiper-slide">
                      <img src="${imgObj.img}" alt="${imgObj.alt || product.name}">
                    </div>`
                  ).join('')}
                </div>
                <div class="swiper-pagination"></div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
              </div>
            `;
          }
        }
        modalBody.innerHTML = `
          <div class="product-title">${product.shortName || ''}</div>
          <div class="product-shortDescription">${product.shortDescription || ''}</div>
          <div class="product-images">${allImagesHtml}</div>
          <div class="product-description">${product.description || ''}</div>
          <div class="product-typeText"><strong>${product.typeText || ''}</strong></div>
          <div class="product-use"><strong>Modo de uso:</strong></div>
          <div class="product-usemode">${product.useMode || ''}</div>
          <div class="product-cost">Precio: ${priceText}</div>
        `;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Calling swiper init if multiple images
        if (Array.isArray(product.imgs) && product.imgs.length > 1 && window.initProductModalSwiper) {
          window.initProductModalSwiper('.product-modal-swiper');
        }
      });
      // --- NEW: Wrap in custom wrapper if requested ---
      let finalNode = tile;
      if (options.tileWrapperClass) {
        const wrapper = document.createElement('div');
        wrapper.className = options.tileWrapperClass;
        wrapper.appendChild(tile);
        finalNode = wrapper;
      }
      grid.appendChild(finalNode);
    });

    // Modal close logic
    if (modal && modalBody && modalClose && !modalClose.hasListener) {
      modalClose.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
      document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'flex' && e.key === 'Escape') closeModal();
      });
      modalClose.hasListener = true;
    }
    function closeModal() {
      if (!modal) return;
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  });
};