document.addEventListener("DOMContentLoaded", async function () {
  const scriptTag = document.currentScript || document.querySelector('script[src*="swiperSetup.js"]');
  const itemFile = scriptTag?.getAttribute('data-products') || 'assets/json/products.json';
  const swiperSufix = scriptTag?.getAttribute('swiper-sufix') || 'swiper';
  const wrapperID = scriptTag?.getAttribute('wrapper-id') || 'item-swiper-wrapper';
  const wrapper = document.getElementById(wrapperID);

  try {
    const response = await fetch(itemFile); // adjust path if needed
    const items = await response.json();

    // Generate slides
    items.forEach(item => {
      const slide = document.createElement("div");
      slide.classList.add("swiper-slide");
      slide.innerHTML = `
        <div class="swiper-slide--card">
          <div onclick="window.location.href='${item.link}';">
            <img loading="lazy" src="${item.image}" class="item" alt="${item.alt}">
          </div>
        </div>
      `;
      wrapper.appendChild(slide);
    });

    // Initialize Swiper only after slides are created
    // eslint-disable-next-line no-unused-vars
    const swiper = new Swiper(`.swiper-${swiperSufix}`, {
      direction: 'horizontal',
      loop: true,
      slidesPerView: 1,
      spaceBetween: 5,
      centeredSlides: true,
      grabCursor: true,
      allowTouchMove: true,
      autoplay: {
        delay: 3000,
      },
      pagination: {
        el: `.swiper-pagination-${swiperSufix}`,
        clickable: true,
      },
      navigation: {
        nextEl: `.swiper-button-next-${swiperSufix}`,
        prevEl: `.swiper-button-prev-${swiperSufix}`,
      },
      lazy: {
        enabled: true,
        loadOnTransitionStart: true,
        loadPrevNext: true,
        loadPrevNextAmount: 2,
      },
    });

  } catch (error) {
    console.error("Error loading item.json:", error);
  }
});
