document.addEventListener("DOMContentLoaded", async function () {
  const scriptTag = document.currentScript || document.querySelector('script[src*="recsCarousel.js"]');
  const itemFile = scriptTag?.getAttribute('data-products') || 'assets/json/products.json';
  const swiperSufix = scriptTag?.getAttribute('swiper-sufix') || 'swiper';
  const wrapperID = scriptTag?.getAttribute('wrapper-id') || 'item-swiper-wrapper';
  const wrapper = document.getElementById(wrapperID);

  try {
    const response = await fetch(itemFile); // adjust path if needed
    const items = await response.json();

    // Generate slides
    if (!Array.isArray(items)) throw new Error("Invalid product data (expected array)");
      allitems = items.filter(p => typeof p === "object" && p !== null);

    // Modal elements
    const modal = document.getElementById('product-modal');
    const modalBody = modal.querySelector('.product-modal-body');
    const modalClose = modal.querySelector('.product-modal-close');

    console.log("All items:", allitems);
    allitems.forEach(item => {
      const slide = document.createElement("div");
      slide.classList.add("swiper-slide");
      slide.innerHTML = `
        <div class="swiper-slide--card">
          <div class="product-tile">
            <img loading="lazy" src="${item.imgs[0].img}" class="item" alt="${item.imgs[0].alt || item.name}">
            <div class="product-title">${item.name || ''}</div>
            <div class="product-collection">${item.collection || ''}</div>
            <div class="product-cost">Precio: ${item.cost || ''}</div>
          </div>
        </div>
      `;
      slide.addEventListener('click', () => {
        if (!modal || !modalBody) return;
        let allImagesHtml = '';
        if (Array.isArray(item.imgs) && item.imgs.length > 0) {
          allImagesHtml = item.imgs.map(imgObj =>
            `<img src="${imgObj.img}" alt="${imgObj.alt || product.name}">`
          ).join('');
        }
        modalBody.innerHTML = `
          <div class="product-title">${item.shortName || ''}</div>
          <div class="product-shortDescription">${item.shortDescription || ''}</div>
          <div class="product-images">${allImagesHtml}</div>
          <div class="product-description">${item.description || ''}</div>
          <div class="product-typeText"><strong>${item.typeText || ''}</strong></div>
          <div class="product-use"><strong>Modo de uso:</strong></div>
          <div class="product-usemode">${item.useMode || ''}</div>
        `;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });
      wrapper.appendChild(slide);

      // Modal close logic
      if (modal && modalClose && !modalClose.hasListener) {
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

    // Initialize Swiper only after slides are created
    // eslint-disable-next-line no-unused-vars
    const swiper = new Swiper(`.swiper-${swiperSufix}`, {
      direction: 'horizontal',
      loop: true,
      slidesPerView: 1.25,
      spaceBetween: 10,
      centeredSlides: true,
      grabCursor: true,
      allowTouchMove: true,
      pagination: {
        el: `.swiper-pagination-${swiperSufix}`,
        clickable: true,
      },
      breakpoints: {
          // when window width is >= 600px
          600: {
              slidesPerView: 2,
          },
          // when window width is >= 900px
          900: {
              slidesPerView: 3.25,
          },
          // when window width is >= 1200px
          1200: {
              slidesPerView: 4,
          },
      },
      navigation: {
        nextEl: `.swiper-button-next-${swiperSufix}`,
        prevEl: `.swiper-button-prev-${swiperSufix}`,
      },
      lazy: {
        enabled: true,
        loadOnTransitionStart: true,
        loadPrevNext: true,
        loadPrevNextAmount: 4,
      },
    });

  } catch (error) {
    console.error("Error loading item.json:", error);
  }
});
