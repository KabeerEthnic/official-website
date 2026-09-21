import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

import { formatPrice } from '../../lib/format.js';
import { ErrorState, InlineLoader } from '../components/Feedback.jsx';
import { useCart } from '../context/CartContext.jsx';

export function Cart() {
  const { items, totals, loading, busy, error, refresh, updateItem, removeItem } = useCart();
  const [actionError, setActionError] = useState(null);

  const change = async (operation) => {
    setActionError(null);
    try {
      await operation();
    } catch (mutationError) {
      setActionError(mutationError.message);
    }
  };

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F2418] via-[#0D1F15] to-[#0F2418] -z-10"></div>

      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl text-white mb-10 border-b border-white/10 pb-6"
          style={{ fontFamily: "'Boston Angel', 'Great Vibes', cursive", letterSpacing: '0.02em' }}
        >
          Shopping Cart
        </motion.h1>

        {actionError ? (
          <p className="mb-6 text-sm text-[#E89B3C]" role="alert">{actionError}</p>
        ) : null}

        {loading ? (
          <InlineLoader />
        ) : error ? (
          <ErrorState message={error.message} onRetry={refresh} />
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/60 text-xl mb-6 font-serif italic">Your cart is empty.</p>
            <Link to="/shop" className="inline-flex items-center gap-2 bg-[#531323] hover:bg-[#731830] text-white px-8 py-3 rounded-full transition-all">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {items.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.4 }}
                    className="flex gap-6 bg-white/5 backdrop-blur-sm p-4 rounded-3xl border border-white/10 relative group"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      loading="lazy"
                      className="w-24 h-32 object-cover rounded-xl"
                    />

                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link to={`/product/${item.product.slug}`} className="text-xl text-white hover:text-[#E89B3C] transition-colors">{item.product.name}</Link>
                          <button
                            onClick={() => change(() => removeItem(item.id))}
                            disabled={busy}
                            aria-label={`Remove ${item.product.name}`}
                            className="text-white/40 hover:text-[#E89B3C] transition-colors disabled:opacity-40"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-white/50 text-sm mt-1 mb-3 font-serif">
                          {item.product.subtitle || item.product.sku}
                          {item.product.color ? ` | Colour: ${item.product.color}` : ''}
                        </p>
                        {!item.stock.inStock ? (
                          <p className="text-[#E89B3C] text-xs mb-2">
                            Only {item.stock.available} left — reduce the quantity to continue.
                          </p>
                        ) : null}
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-white/20 rounded-full h-10 w-28 overflow-hidden bg-white/5">
                          <button
                            onClick={() => change(() => updateItem(item.id, item.quantity - 1))}
                            disabled={busy}
                            aria-label="Decrease quantity"
                            className="flex-1 flex justify-center text-white/70 hover:text-white disabled:opacity-40"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="flex-1 text-center text-white">{item.quantity}</span>
                          <button
                            onClick={() => change(() => updateItem(item.id, item.quantity + 1))}
                            disabled={busy || item.quantity >= item.stock.available}
                            aria-label="Increase quantity"
                            className="flex-1 flex justify-center text-white/70 hover:text-white disabled:opacity-40"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-xl text-[#E89B3C] font-semibold">{formatPrice(item.lineTotal)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 sticky top-32">
                <h3 className="text-2xl text-white font-serif mb-6 pb-4 border-b border-white/10">Order Summary</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-white/70">
                    <span>Subtotal</span>
                    <span>{formatPrice(totals.subtotal)}</span>
                  </div>
                  {totals.discount > 0 ? (
                    <div className="flex justify-between text-white/70">
                      <span>Discount</span>
                      <span className="text-[#E89B3C]">-{formatPrice(totals.discount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-white/70">
                    <span>Estimated Tax</span>
                    <span>{formatPrice(totals.tax)}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Shipping</span>
                    <span className="text-[#E89B3C]">
                      {totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-2xl text-white font-medium border-t border-white/10 pt-6 mb-8">
                  <span>Total</span>
                  <span className="text-[#E89B3C]">{formatPrice(totals.total)}</span>
                </div>

                <Link to="/checkout" className="w-full flex items-center justify-center gap-2 bg-[#531323] hover:bg-[#731830] text-white py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg">
                  Proceed to Checkout <ArrowRight className="w-5 h-5" />
                </Link>

                <p className="text-white/40 text-xs text-center mt-6">Taxes and shipping calculated at checkout. Safe and secure payments.</p>
              </div>
            </motion.div>

          </div>
        )}
      </div>
    </div>
  );
}
