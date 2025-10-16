document.addEventListener("DOMContentLoaded", () => {
  const scriptTag = document.currentScript || document.querySelector('script[src*="products.js"]');
  const productsFile = scriptTag?.getAttribute('data-products') || 'assets/json/products.json';

  let allProducts = [];
  let currentFilterAttr = "";
  let currentFilterVal = "";
  let currentSearch = "";
  let currentSort = "";

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
      // Get prices and merge into products before any filtering/sorting
      window.getProductsWithPrices(products).then(productsWithPrices => {
        allProducts = productsWithPrices.filter(p => typeof p === "object" && p !== null && p.onStock !== false);

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
          });
          filterValSelect.style.display = '';
        }

        function setUrlFilter(attr, val, sort) {
          const params = new URLSearchParams();
          if (attr && val) params.set(attr, val);
          if (sort) params.set('sort', sort);
          const newUrl =
            window.location.pathname +
            (params.toString() ? '?' + params.toString() : '') +
            window.location.hash;

          history.replaceState(null, '', newUrl);
        }

        function getUrlFilters() {
          const params = new URLSearchParams(window.location.search);
          let filterAttr = "", filterVal = "", sort = "";
          for (const [key, value] of params.entries()) {
            if (key === "sort") {
              sort = decodeURIComponent(value.trim());
            } else if (key && value) {
              filterAttr = decodeURIComponent(key.trim());
              filterVal = decodeURIComponent(value.trim());
              break;
            }
          }
          return { filterAttr, filterVal, sort };
        }

        function sortProducts(products, sortValue) {
          if (!sortValue) return products;
          const [field, dir] = sortValue.split('-');
          const sorted = [...products];
          sorted.sort((a, b) => {
            let aVal = a[field] || "";
            let bVal = b[field] || "";
            // For price, use numericCost
            if (field === "cost" || field === "numericCost") {
              aVal = a.numericCost || 0;
              bVal = b.numericCost || 0;
            } else {
              // Decode HTML entities and normalize for text fields
              const decode = s => {
                const el = document.createElement("textarea");
                el.innerHTML = s + "";
                return el.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
              };
              aVal = decode(aVal);
              bVal = decode(bVal);
            }
            if (aVal < bVal) return dir === "asc" ? -1 : 1;
            if (aVal > bVal) return dir === "asc" ? 1 : -1;
            return 0;
          });
          return sorted;
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

          // Sort
          filtered = sortProducts(filtered, currentSort);

          window.renderProducts(filtered);
        }

        // --- OBSERVE + EVENT LISTENERS ---
        waitForElement('#filter-attribute', (filterAttrSelect) => {
          const filterValSelect = document.getElementById('filter-value');
          filterAttrSelect.addEventListener('change', function() {
            currentFilterAttr = this.value;
            updateFilterValues(this.value);
            filterValSelect.value = "";
            currentFilterVal = "";
            setUrlFilter(currentFilterAttr, currentFilterVal, currentSort);
            filterAndRender();
          });
        });

        waitForElement('#filter-value', (filterValSelect) => {
          filterValSelect.addEventListener('change', function() {
            currentFilterVal = this.value;
            setUrlFilter(currentFilterAttr, currentFilterVal, currentSort);
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
          const { filterAttr, filterVal, sort } = getUrlFilters();
          const allowedAttrs = ['category', 'collection', 'type'];
          const filterAttrSelect = document.getElementById('filter-attribute');
          const filterValSelect = document.getElementById('filter-value');
          const sortSelect = document.getElementById('sort-products');
          if (filterAttr && filterVal && allowedAttrs.includes(filterAttr)) {
            if (filterAttrSelect && filterValSelect) {
              filterAttrSelect.value = filterAttr;
              currentFilterAttr = filterAttr;
              updateFilterValues(filterAttr);
              filterValSelect.value = filterVal;
              filterValSelect.style.display = '';
              currentFilterVal = filterVal;
            }
          } else {
            if (filterValSelect) filterValSelect.style.display = 'none';
          }
          if (sort && sortSelect) {
            sortSelect.value = sort;
            currentSort = sort;
          }
          filterAndRender();
        });

        waitForElement('#sort-products', (sortSelect) => {
          sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            setUrlFilter(currentFilterAttr, currentFilterVal, currentSort);
            filterAndRender();
          });
        });

      }); // end getProductsWithPrices
    })
    .catch(err => {
      console.error("Error loading products:", err);
    });
});