/**
 * Row -> API shape. Every response goes through here so internal columns
 * (password hashes, storage paths, raw provider payloads) can never leak by
 * accident, and the client sees one stable contract.
 */

export function serializeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

export function serializeAddress(address) {
  if (!address) return null;
  return {
    id: address.id,
    name: address.name,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 ?? null,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    isDefault: address.isDefault,
  };
}

export function serializeCategory(category) {
  if (!category) return null;
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    headline: category.headline ?? category.name,
    description: category.description ?? null,
    imageUrl: category.imageUrl ?? null,
    position: category.position,
    visible: category.visible,
    ...(category._count?.products !== undefined ? { productCount: category._count.products } : {}),
  };
}

function serializeStock(inventory) {
  if (!inventory) {
    return { available: 0, inStock: false, lowStock: false, percentage: null };
  }
  const available = Math.max(0, inventory.quantity);
  return {
    available,
    inStock: available > 0,
    lowStock: available > 0 && available <= inventory.lowStockThreshold,
    // Drives the "AVAILABLE: n%" limited-edition indicator on the suits pages.
    percentage:
      inventory.capacity > 0
        ? Math.max(0, Math.min(100, Math.round((available / inventory.capacity) * 100)))
        : null,
  };
}

export function serializeProduct(product, { admin = false } = {}) {
  if (!product) return null;

  const salePrice = product.salePrice ?? null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    subtitle: product.subtitle ?? null,
    description: product.description,
    sku: product.sku,
    price: product.price,
    salePrice,
    // What a customer actually pays; the server never trusts a client total.
    effectivePrice: salePrice ?? product.price,
    currency: 'INR',
    color: product.color ?? null,
    tag: product.tag ?? null,
    details: Array.isArray(product.details) ? product.details : [],
    featured: product.featured,
    category: product.category
      ? { id: product.category.id, name: product.category.name, slug: product.category.slug }
      : null,
    categoryId: product.categoryId,
    rating: { average: product.ratingAvg, count: product.reviewCount },
    images: (product.images ?? []).map((image) => ({
      id: image.id,
      url: image.url,
      altText: image.altText ?? product.name,
      position: image.position,
      ...(admin ? { visible: image.visible, storagePath: image.storagePath ?? null } : {}),
    })),
    stock: serializeStock(product.inventory),
    ...(admin
      ? {
          status: product.status,
          position: product.position,
          inventory: product.inventory
            ? {
                quantity: product.inventory.quantity,
                reserved: product.inventory.reserved,
                capacity: product.inventory.capacity,
                lowStockThreshold: product.inventory.lowStockThreshold,
              }
            : null,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        }
      : {}),
  };
}

export function serializeCartItem(item) {
  const product = item.product;
  const unitPrice = product.salePrice ?? product.price;
  const available = product.inventory ? Math.max(0, product.inventory.quantity) : 0;

  return {
    id: item.id,
    quantity: item.quantity,
    unitPrice,
    lineTotal: unitPrice * item.quantity,
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      subtitle: product.subtitle ?? null,
      sku: product.sku,
      price: product.price,
      salePrice: product.salePrice ?? null,
      color: product.color ?? null,
      image: product.images?.[0]?.url ?? null,
      categorySlug: product.category?.slug ?? null,
    },
    stock: { available, inStock: available >= item.quantity },
  };
}

export function serializeOrder(order, { admin = false } = {}) {
  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    tax: order.tax,
    total: order.total,
    currency: order.currency,
    couponCode: order.couponCode ?? null,
    contactEmail: order.contactEmail,
    shippingAddress: {
      name: order.shippingName,
      phone: order.shippingPhone,
      line1: order.shippingLine1,
      line2: order.shippingLine2 ?? null,
      city: order.shippingCity,
      state: order.shippingState,
      postalCode: order.shippingPostalCode,
      country: order.shippingCountry,
    },
    items: (order.items ?? []).map((item) => ({
      id: item.id,
      productId: item.productId,
      productSlug: item.productSlug,
      name: item.productName,
      sku: item.productSku,
      imageUrl: item.imageUrl ?? null,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    payment: order.payments?.length
      ? {
          provider: order.payments[0].provider,
          providerOrderId: order.payments[0].providerOrderId ?? null,
          status: order.payments[0].status,
          amount: order.payments[0].amount,
        }
      : null,
    cancelledAt: order.cancelledAt ?? null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    ...(admin
      ? {
          notes: order.notes ?? null,
          cancelReason: order.cancelReason ?? null,
          customer: order.user ? serializeUser(order.user) : null,
        }
      : {}),
  };
}

export function serializeReview(review, { admin = false } = {}) {
  if (!review) return null;
  return {
    id: review.id,
    rating: review.rating,
    title: review.title ?? null,
    body: review.body,
    status: review.status,
    createdAt: review.createdAt,
    author: review.user ? { id: review.user.id, name: review.user.name } : null,
    ...(admin
      ? {
          product: review.product
            ? { id: review.product.id, name: review.product.name, slug: review.product.slug }
            : null,
        }
      : {}),
  };
}

export function serializeCoupon(coupon, { admin = false } = {}) {
  if (!coupon) return null;

  const base = {
    code: coupon.code,
    description: coupon.description ?? null,
    discountType: coupon.discountType,
    value: coupon.value,
    minOrderValue: coupon.minOrderValue,
    maxDiscount: coupon.maxDiscount ?? null,
  };

  if (!admin) return base;

  return {
    ...base,
    id: coupon.id,
    startsAt: coupon.startsAt ?? null,
    expiresAt: coupon.expiresAt ?? null,
    usageLimit: coupon.usageLimit ?? null,
    perUserLimit: coupon.perUserLimit ?? null,
    usageCount: coupon.usageCount,
    active: coupon.active,
    createdAt: coupon.createdAt,
  };
}

export function serializePage(page, { admin = false } = {}) {
  if (!page) return null;

  const sections = (page.sections ?? [])
    .filter((section) => admin || section.visible)
    .map((section) => ({
      ...(admin ? { id: section.id } : {}),
      key: section.key,
      type: section.type,
      position: section.position,
      visible: section.visible,
      data: section.data ?? {},
    }));

  return {
    slug: page.slug,
    title: page.title,
    description: page.description ?? null,
    ...(admin ? { id: page.id, published: page.published, updatedAt: page.updatedAt } : {}),
    sections,
  };
}
