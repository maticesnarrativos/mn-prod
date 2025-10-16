document.addEventListener("DOMContentLoaded", async function () {
  const scriptTag = document.currentScript || document.querySelector('script[src*="recsCarousel.js"]');
  const itemFile = scriptTag?.getAttribute('data-products') || 'assets/json/products.json';
  const swiperSufix = scriptTag?.getAttribute('swiper-sufix') || 'swiper';
  const wrapperID = scriptTag?.getAttribute('wrapper-id') || 'item-swiper-wrapper';

  try {
    const response = await fetch(itemFile); // adjust path if needed
    const items = await response.json();

    // Generate slides
    if (!Array.isArray(items)) throw new Error("Invalid product data (expected array)");
      const allitems = items.filter(p => typeof p === "object" && p !== null);

    // Use renderProducts to generate the slides
    window.renderProducts(allitems, {
      gridSelector: `#${wrapperID}`,
      tileWrapperClass: 'swiper-slide'
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
          600: {slidesPerView: 2,},
          900: {slidesPerView: 3.25,},
          1200: {slidesPerView: 4,},
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
