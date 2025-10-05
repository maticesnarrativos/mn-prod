document.addEventListener("DOMContentLoaded", () => {
  const scriptTag = document.currentScript || document.querySelector('script[src*="products.js"]');
  const productsFile = scriptTag?.getAttribute('data-products') || 'assets/json/products.json';

  let allProducts = [];
  let currentFilterAttr = "";
  let currentFilterVal = "";
  let currentSearch = "";

   // Utility: Wait until a selector exists in the DOM
  function waitForElement(selector, callback) {
    const el = document.querySelector(selector);
    if (el) return callback(el);

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        callback(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  fetch(productsFile)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status} while loading ${productsFile}`);
      return res.json();
    })
    .then(products => {
      if (!Array.isArray(products)) throw new Error("Invalid product data (expected array)");
      allProducts = products.filter(p => typeof p === "object" && p !== null);

      // --- FILTER LOGIC ---

      function getUniqueValues(products, attr) {
        const set = new Set();
        if (!attr) return [];
        products.forEach(p => {
          if (p && typeof p[attr] === "string") set.add(p[attr]);
        });
        return Array.from(set);
      }

      function updateFilterValues(attr) {
        const filterValSelect = document.getElementById('filter-value');
        if (!filterValSelect) return;
        filterValSelect.innerHTML = '<option value="">Selecciona un valor...</option>';
        if (!attr) {
          filterValSelect.style.display = 'none';
          return;
        }
        const values = getUniqueValues(allProducts, attr);
        values.forEach(val => {
          // Remove HTML entities for display
          const text = document.createElement('span');
          text.innerHTML = val;
          const safeValue = text.textContent || "";
          filterValSelect.innerHTML += `<option value="${safeValue}">${safeValue}</option>`;
          console.log(val);
        });
        filterValSelect.style.display = '';
      }

      function setUrlFilter(attr, val) {
        const params = new URLSearchParams();
        if (attr && val) params.set(attr, val);
        const newUrl =
          window.location.pathname +
          (params.toString() ? '?' + params.toString() : '') +
          window.location.hash;

        history.replaceState(null, '', newUrl);
      }

      function getUrlFilters() {
        const params = new URLSearchParams(window.location.search);
        let filterAttr = "", filterVal = "";
        for (const [key, value] of params.entries()) {
          if (key && value) {
            filterAttr = decodeURIComponent(key.trim());
            filterVal = decodeURIComponent(value.trim());
            break;
          }
        }
        return { filterAttr, filterVal };
      }

      // --- COMBINED FILTER + SEARCH ---
      function filterAndRender() {
        let filtered = allProducts.filter(p => p.onStock);

        // --- Normalize helper ---
        function normalizeText(str) {
          if (!str) return "";
          const el = document.createElement('textarea');
          el.innerHTML = str;
          const decoded = el.value;
          return decoded
            .normalize("NFD") // decompose accent marks
            .replace(/[\u0300-\u036f]/g, "") // remove them
            .trim()
            .toLowerCase();
        }

        // Apply filter (accent-insensitive + HTML-decoded)
        if (currentFilterAttr && currentFilterVal) {
          const target = normalizeText(currentFilterVal);
          filtered = filtered.filter(p => {
            const val = normalizeText(p?.[currentFilterAttr]);
            return val && val === target;
          });
        }

        // Apply search
        if (currentSearch) {
          const normalizeText = (str) => {
            if (typeof str !== "string") return "";
            // Decode HTML entities (like &aacute;)
            const el = document.createElement("textarea");
            el.innerHTML = str;
            const decoded = el.value;

            // Normalize accents and remove diacritics (á -> a)
            return decoded
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
              .trim();
          };

          const query = normalizeText(currentSearch);

          filtered = filtered.filter(product => {
            const fields = [
              product.name,
              product.shortName,
              product.shortDescription,
              product.description,
              product.collection,
              product.typeText
            ];
            return fields.some(field =>
              normalizeText(field).includes(query)
            );
          });
        }

        renderProducts(filtered);
      }

      // --- OBSERVE + EVENT LISTENERS ---
      waitForElement('#filter-attribute', (filterAttrSelect) => {
        const filterValSelect = document.getElementById('filter-value');
        filterAttrSelect.addEventListener('change', function() {
          currentFilterAttr = this.value;
          updateFilterValues(this.value);
          filterValSelect.value = "";
          currentFilterVal = "";
          setUrlFilter(currentFilterAttr, currentFilterVal);
          filterAndRender();
        });
      });

      waitForElement('#filter-value', (filterValSelect) => {
        filterValSelect.addEventListener('change', function() {
          currentFilterVal = this.value;
          setUrlFilter(currentFilterAttr, currentFilterVal);
          filterAndRender();
        });
      });

      waitForElement('#product-search', (searchInput) => {
        if (searchInput) {
          searchInput.addEventListener('input', function () {
            currentSearch = this.value.trim();
            filterAndRender();
          });

          
          // Close keyboard on Enter
          searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
              e.preventDefault(); // stop form submission if inside a form
              this.blur();        // remove focus to close mobile keyboard
            }
          });
        }
      });

      // --- URL PARAMS ---
      waitForElement('.products-grid', () => {
        const { filterAttr, filterVal } = getUrlFilters();
        const allowedAttrs = ['category', 'collection', 'type'];
        if (filterAttr && filterVal && allowedAttrs.includes(filterAttr)) {
          const filterAttrSelect = document.getElementById('filter-attribute');
          const filterValSelect = document.getElementById('filter-value');
          if (filterAttrSelect && filterValSelect) {
            filterAttrSelect.value = filterAttr;
            currentFilterAttr = filterAttr;
            updateFilterValues(filterAttr);
            filterValSelect.value = filterVal;
            filterValSelect.style.display = '';
            currentFilterVal = filterVal;
          }
        } else {
          const filterValSelect = document.getElementById('filter-value');
          if (filterValSelect) filterValSelect.style.display = 'none';
        }
        filterAndRender();
      });

      // --- RENDER PRODUCTS ---
      function renderProducts(productsToShow) {
        const grid = document.querySelector('.products-grid');
        if (!grid) return;
        grid.innerHTML = "";

        // Modal elements
        const modal = document.getElementById('product-modal');
        const modalBody = modal.querySelector('.product-modal-body');
        const modalClose = modal.querySelector('.product-modal-close');

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

          tile.innerHTML = `
            ${imagesHtml}
            <div class="product-title">${product.name || ''}</div>
            <div class="product-collection">${product.collection || ''}</div>
            <div class="product-cost">Precio: ${product.cost || ''}</div>
          `;

          tile.addEventListener('click', () => {
            if (!modal || !modalBody) return;
            let allImagesHtml = '';
            if (Array.isArray(product.imgs) && product.imgs.length > 0) {
              allImagesHtml = product.imgs.map(imgObj =>
                `<img src="${imgObj.img}" alt="${imgObj.alt || product.name}">`
              ).join('');
            }
            modalBody.innerHTML = `
              <div class="product-title">${product.shortName || ''}</div>
              <div class="product-shortDescription">${product.shortDescription || ''}</div>
              <div class="product-images">${allImagesHtml}</div>
              <div class="product-description">${product.description || ''}</div>
              <div class="product-typeText"><strong>${product.typeText || ''}</strong></div>
              <div class="product-use"><strong>Modo de uso:</strong></div>
              <div class="product-usemode">${product.useMode || ''}</div>
            `;
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
          });
          grid.appendChild(tile);
        });

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
      }
    })
    .catch(err => {
      console.error("Error loading products:", err);
    });
});
