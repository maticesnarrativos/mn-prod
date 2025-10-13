let _mn_pricesCache = null;

function fetchPrices(pricesFile = 'assets/json/prices.json') {
  if (_mn_pricesCache) return Promise.resolve(_mn_pricesCache);
  return fetch(pricesFile)
    .then(res => res.json())
    .then(prices => {
      _mn_pricesCache = prices;
      return prices;
    });
}

/**
 * Returns a new array of products with the cost replaced by the price value from prices.json.
 * Adds a numericCost property for sorting.
 */
window.getProductsWithPrices = async function(products, pricesFile = 'assets/json/prices.json') {
  const prices = await fetchPrices(pricesFile);
  return products.map(product => {
    const newProduct = { ...product };
    if (product.cost && prices && prices[product.cost]) {
      newProduct.cost = prices[product.cost];
      // Extract numeric value for sorting (e.g., "₡7590" -> 7590)
      newProduct.numericCost = parseFloat((prices[product.cost] + "").replace(/[^\d.]/g, "")) || 0;
    } else if (product.cost) {
      newProduct.numericCost = parseFloat((product.cost + "").replace(/[^\d.]/g, "")) || 0;
    } else {
      newProduct.numericCost = 0;
    }
    return newProduct;
  });
};