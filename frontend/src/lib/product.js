import { formatPrice } from './format.js';

/**
 * Adapts an API product to the shape the storefront's hand-built cards and
 * lookbooks render. Keeping the translation here means the layouts stayed
 * exactly as designed when the catalogue moved from a static file to the API.
 */
export function toDisplayProduct(product) {
  if (!product) return null;

  const onSale = product.salePrice !== null && product.salePrice !== undefined;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    subtitle: product.subtitle ?? '',
    description: product.description,
    price: formatPrice(product.effectivePrice),
    originalPrice: onSale ? formatPrice(product.price) : undefined,
    priceValue: product.effectivePrice,
    images: product.images.map((image) => image.url),
    imageAlts: product.images.map((image) => image.altText ?? product.name),
    rating: product.rating.average,
    reviews: product.rating.count,
    category: product.category?.name ?? '',
    categorySlug: product.category?.slug ?? '',
    color: product.color ?? '',
    tag: product.tag ?? '',
    details: product.details ?? [],
    // Drives the "AVAILABLE: n%" indicator on the limited-edition lookbooks.
    stockPercentage: product.stock.percentage,
    inStock: product.stock.inStock,
    lowStock: product.stock.lowStock,
    available: product.stock.available,
  };
}

export function toDisplayProducts(products = []) {
  return products.map(toDisplayProduct);
}
