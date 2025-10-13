window.initProductModalSwiper = function(selector = '.product-modal-swiper') {
  if (window.Swiper && document.querySelector(selector)) {
    return new Swiper(selector, {
      direction: 'horizontal',
      loop: true,
      slidesPerView: 1.5,
      spaceBetween: 20,
      centeredSlides: true,
      grabCursor: true,
      allowTouchMove: true,
      pagination: {
        el: selector + ' .swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: selector + ' .swiper-button-next',
        prevEl: selector + ' .swiper-button-prev',
      },
      breakpoints: {
          // when window width is >= 600px
          600: {
              slidesPerView: 2,
          },
          // when window width is >= 900px
          900: {
              slidesPerView: 3,
          },
          // when window width is >= 1200px
          1200: {
              slidesPerView: 4,
          },
      },
      lazy: {
        enabled: true,
        loadOnTransitionStart: true,
        loadPrevNext: true,
        loadPrevNextAmount: 4,
      },
    });
  }
};