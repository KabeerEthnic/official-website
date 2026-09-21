import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { Star, Heart, ShoppingBag, Truck, Shield, ArrowLeft } from 'lucide-react';

import { catalog } from '../../lib/api/index.js';
import { toDisplayProduct } from '../../lib/product.js';
import { ErrorState, PageLoader } from '../components/Feedback.jsx';
import { ProductReviews } from '../components/ProductReviews.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useQuery } from '../hooks/useQuery.js';

const themes = {
  suits: {
    bg: 'bg-[#FAF8F5] text-[#2D2A26] font-cormorant',
    heading: 'text-[#2D2A26] font-cormorant font-light italic',
    subtitleText: 'text-[#8C7E7A] font-sans tracking-[0.2em] font-semibold text-xs',
    accentText: 'text-[#7F8C76]',
    textMuted: 'text-[#8C7E7A]',
    border: 'border-[#2D2A26]/10',
    divider: 'border-[#2D2A26]/10',
    buttonAccent: 'bg-[#2D2A26] hover:bg-[#7F8C76] text-white font-sans text-xs tracking-wider uppercase',
    qtyBg: 'bg-[#2D2A26]/5 border-[#2D2A26]/15 text-[#2D2A26]',
    featureBg: 'bg-[#FAF8F5] border-[#2D2A26]/10 text-[#2D2A26]/80',
    backLink: 'text-[#8C7E7A] hover:text-[#2D2A26] font-sans text-xs uppercase tracking-wider',
    starColor: 'text-[#7F8C76] fill-[#7F8C76]',
    detailsHeading: 'font-cormorant text-2xl italic border-b border-[#2D2A26]/10 pb-2 mb-4 text-[#2D2A26]',
    tone: 'ivory',
  },
  default: {
    bg: 'bg-gradient-to-b from-[#0F2418] via-[#0D1F15] to-[#0F2418] text-white font-sans',
    heading: 'text-white font-serif',
    subtitleText: 'text-[#E89B3C] tracking-[0.2em] font-semibold text-xs',
    accentText: 'text-[#E89B3C]',
    textMuted: 'text-white/60',
    border: 'border-white/10',
    divider: 'border-white/15',
    buttonAccent: 'bg-[#531323] hover:bg-[#731830] text-white uppercase tracking-wider text-xs',
    qtyBg: 'bg-white/5 border-white/20 text-white',
    featureBg: 'bg-white/5 border-white/5 text-white/70',
    backLink: 'text-white/60 hover:text-[#E89B3C] uppercase tracking-wider text-xs',
    starColor: 'text-[#E89B3C] fill-[#E89B3C]',
    detailsHeading: 'font-serif text-xl border-b border-white/10 pb-2 mb-4 text-white',
    tone: 'dark',
  },
};

export function ProductDetails() {
  const { slug } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [adding, setAdding] = useState(false);

  const { addItem } = useCart();
  const { has: isSaved, toggle: toggleSave } = useWishlist();

  const { data, loading, error, refetch } = useQuery(
    (options) => catalog.product(slug, options),
    [slug],
  );

  const product = useMemo(() => toDisplayProduct(data), [data]);

  // The suits collection has its own ivory boutique treatment; every other
  // collection uses the house dark-green theme.
  const theme = product && product.categorySlug === 'suits' ? themes.suits : themes.default;

  if (loading) return <PageLoader tone={theme.tone} label="Loading" />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F2418] flex items-center justify-center">
        <ErrorState
          title={error.status === 404 ? 'This piece is no longer available' : 'We could not load this piece'}
          message={error.status === 404 ? undefined : error.message}
          onRetry={error.status === 404 ? undefined : refetch}
        />
      </div>
    );
  }

  const isSuits = product.categorySlug === 'suits';
  const maxQuantity = Math.max(1, Math.min(10, product.available));

  const handleAddToCart = async () => {
    setAdding(true);
    setFeedback(null);
    try {
      await addItem(product.id, quantity);
      setFeedback({ tone: 'success', message: 'Added to your bag.' });
    } catch (addError) {
      setFeedback({ tone: 'error', message: addError.message });
    } finally {
      setAdding(false);
    }
  };

  const handleToggleSave = async () => {
    try {
      const result = await toggleSave(product.id);
      if (result?.requiresLogin) {
        setFeedback({ tone: 'error', message: 'Sign in to save pieces to your wishlist.' });
      }
    } catch (saveError) {
      setFeedback({ tone: 'error', message: saveError.message });
    }
  };

  return (
    <div className={`pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative min-h-screen transition-colors duration-700 ${theme.bg}`}>

      {/* Background with dynamic glows */}
      {isSuits ? (
        <>
          <div className="absolute inset-0 bg-[#FAF8F5] -z-10"></div>
          <div className="absolute top-20 right-1/4 w-[600px] h-[600px] bg-[#ECE8E1]/80 rounded-full blur-[100px] -z-10"></div>
          <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#DFD9CE]/40 rounded-full blur-[100px] -z-10"></div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[#0F2418] -z-10"></div>
          <div className="absolute top-20 right-1/4 w-[600px] h-[600px] bg-[#FFF5EB]/[0.02] rounded-full blur-[100px] -z-10"></div>
          <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#E89B3C]/[0.03] rounded-full blur-[100px] -z-10"></div>
        </>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link
          to={`/shop?category=${product.categorySlug}`}
          className={`inline-flex items-center gap-2 mb-8 transition-colors ${theme.backLink}`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {product.category}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col-reverse md:flex-row gap-4"
          >
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible py-2 md:py-0 w-full md:w-24 flex-shrink-0">
              {product.images.map((img, idx) => {
                const isSelected = selectedImage === idx;
                return (
                  <button
                    key={img || idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-24 md:w-24 md:h-32 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                      isSelected
                        ? isSuits
                          ? 'border-[#7F8C76]'
                          : 'border-[#E89B3C]'
                        : `border-transparent opacity-60 hover:opacity-100`
                    }`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>

            {/* Main Image */}
            <div className="flex-1 rounded-2xl overflow-hidden relative" style={{ minHeight: '520px' }}>
              <img
                src={product.images[selectedImage]}
                alt={product.imageAlts[selectedImage] ?? product.name}
                className="w-full h-full object-cover absolute inset-0 rounded-2xl"
              />
              {/* Image framing overlay for Premium Suits */}
              {isSuits && (
                <div className="absolute inset-0 border-[10px] border-[#FAF8F5]/80 pointer-events-none rounded-2xl"></div>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <p className={`${theme.subtitleText} uppercase tracking-[0.2em] mb-3`}>
              {product.category} {product.tag ? `· ${product.tag}` : ''}
            </p>

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl mb-4 leading-tight tracking-wide ${theme.heading}`}>
              {product.name} {product.subtitle ? <span className="font-light">| {product.subtitle}</span> : ''}
            </h1>

            {/* Pricing and Reviews */}
            <div className={`flex items-end gap-4 mb-6 border-b pb-6 ${theme.divider}`}>
              <span className="text-3xl font-light">{product.price}</span>
              {product.originalPrice ? (
                <span className={`text-lg line-through mb-1 ${theme.textMuted}`}>{product.originalPrice}</span>
              ) : null}
              <div className={`flex items-center gap-2 mb-1 border-l pl-4 ${theme.divider}`}>
                <div className="flex items-center gap-1">
                  <Star className={`w-4 h-4 ${theme.starColor}`} />
                  <span className="text-sm font-semibold">{product.rating}</span>
                </div>
                <a
                  href="#reviews"
                  className={`text-xs underline cursor-pointer hover:opacity-100 transition-all font-sans ${theme.textMuted}`}
                >
                  {product.reviews} authentic reviews
                </a>
              </div>
            </div>

            {/* Custom Stock progress indicators for Suits (matching user picture) */}
            {isSuits && product.stockPercentage !== null && (
              <div className="mb-8 font-sans">
                {product.stockPercentage > 50 ? (
                  <div className="inline-flex items-center gap-3 bg-[#7F8C76]/10 text-[#7F8C76] font-semibold text-xs px-4 py-2.5 rounded-full border border-[#7F8C76]/20 shadow-sm">
                    <span>AVAILABLE: {product.stockPercentage}% OF LIMITED EDITION</span>
                    <div className="w-28 h-1 bg-[#FAF8F5] border border-[#7F8C76]/20 rounded-full overflow-hidden flex">
                      <div className="h-full bg-[#7F8C76]" style={{ width: `${product.stockPercentage}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-3 bg-[#B88F8A]/10 text-[#B88F8A] font-semibold text-xs px-4 py-2.5 rounded-full border border-[#B88F8A]/20 shadow-sm">
                    <span>{product.stockPercentage}% - LIMITED PIECES LEFT IN BOUTIQUE</span>
                    <div className="w-20 h-1 bg-[#FAF8F5] border border-[#B88F8A]/20 rounded-full overflow-hidden flex">
                      <div className="h-full bg-[#B88F8A]" style={{ width: `${product.stockPercentage}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <p className={`text-base sm:text-lg mb-8 leading-relaxed font-light ${theme.textMuted}`}>
              {product.description}
            </p>

            {/* Actions: Quantity selection + Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4 font-sans">
              <div className={`flex border rounded-full overflow-hidden w-full sm:w-auto h-[56px] backdrop-blur-sm p-1 ${theme.qtyBg}`}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                  className="w-12 flex items-center justify-center font-semibold hover:opacity-70 cursor-pointer"
                >-</button>
                <input
                  type="number"
                  value={quantity}
                  min={1}
                  max={maxQuantity}
                  aria-label="Quantity"
                  onChange={(e) =>
                    setQuantity(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value, 10) || 1)))
                  }
                  className="w-12 bg-transparent text-center focus:outline-none font-semibold"
                />
                <button
                  onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                  aria-label="Increase quantity"
                  className="w-12 flex items-center justify-center font-semibold hover:opacity-70 cursor-pointer"
                >+</button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || adding}
                className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${theme.buttonAccent}`}
              >
                <ShoppingBag className="w-4 h-4" />
                {!product.inStock ? 'Sold Out' : adding ? 'Adding…' : 'Add to Cart'}
              </button>

              <button
                onClick={handleToggleSave}
                aria-label={isSaved(product.id) ? 'Remove from wishlist' : 'Save to wishlist'}
                className={`w-[56px] h-[56px] flex items-center justify-center rounded-full border hover:bg-white/10 transition-all duration-300 cursor-pointer ${theme.divider}`}
              >
                <Heart className={`w-4 h-4 ${isSaved(product.id) ? `${theme.starColor}` : 'text-current'}`} />
              </button>
            </div>

            <div className="min-h-[24px] mb-6 font-sans">
              {feedback ? (
                <p
                  role="status"
                  className={`text-sm ${feedback.tone === 'error' ? 'text-[#B88F8A]' : theme.accentText}`}
                >
                  {feedback.message}
                </p>
              ) : product.lowStock ? (
                <p className={`text-sm ${theme.textMuted}`}>
                  Only {product.available} left in the boutique.
                </p>
              ) : null}
            </div>

            {/* Features list */}
            <div className="grid grid-cols-2 gap-4 mb-10 font-sans text-xs">
              <div className={`flex items-center gap-3 py-4 px-5 rounded-2xl border ${theme.featureBg}`}>
                <Truck className="w-4 h-4 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Complimentary Shipping</p>
                  <p className="opacity-70">Fully insured courier</p>
                </div>
              </div>
              <div className={`flex items-center gap-3 py-4 px-5 rounded-2xl border ${theme.featureBg}`}>
                <Shield className="w-4 h-4 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Boutique Guarantee</p>
                  <p className="opacity-70">100% Authentic fabrics</p>
                </div>
              </div>
            </div>

            {/* Product Details List */}
            <div className="space-y-4 font-sans text-sm">
              <h3 className={theme.detailsHeading}>Product Specifications</h3>
              {product.details.map((detail, idx) => (
                <div key={idx} className={`flex justify-between border-b pb-3 ${theme.divider}`}>
                  <span className={`${theme.textMuted} text-xs uppercase tracking-wider`}>{detail.name}</span>
                  <span className="font-medium text-right">{detail.value}</span>
                </div>
              ))}
            </div>

          </motion.div>
        </div>

        <ProductReviews slug={product.slug} productId={product.id} theme={theme} />

        {data.related.length > 0 ? (
          <section className="mt-24">
            <h2 className={theme.detailsHeading}>You may also like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              {data.related.map((item) => {
                const related = toDisplayProduct(item);
                return (
                  <Link key={related.id} to={`/product/${related.slug}`} className="group block">
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-3">
                      <img
                        src={related.images[0]}
                        alt={related.imageAlts[0] ?? related.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <p className="text-sm font-medium">{related.name}</p>
                    <p className={`text-sm ${theme.textMuted}`}>{related.price}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
