import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, CreditCard, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

import { cart as cartApi, orders, payments, users } from '../../lib/api/index.js';
import { formatPrice } from '../../lib/format.js';
import { loadRazorpayCheckout } from '../../lib/razorpay.js';
import { InlineLoader } from '../components/Feedback.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useQuery } from '../hooks/useQuery.js';

const FIELD_CLASS =
  'w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#E89B3C] focus:outline-none transition-colors';

const EMPTY_FORM = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
};

export function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totals, loading: cartLoading, refresh } = useCart();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [coupon, setCoupon] = useState('');
  const [quote, setQuote] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const { data: paymentConfig } = useQuery((options) => payments.config(options), []);
  const { data: savedAddresses } = useQuery((options) => users.addresses(options), [], {
    initialData: [],
  });

  // Prefill from the account and its default address.
  useEffect(() => {
    const defaultAddress = (savedAddresses ?? []).find((address) => address.isDefault);

    setFormData((previous) => ({
      ...previous,
      email: previous.email || user?.email || '',
      firstName: previous.firstName || defaultAddress?.name?.split(' ')[0] || user?.name?.split(' ')[0] || '',
      lastName:
        previous.lastName ||
        defaultAddress?.name?.split(' ').slice(1).join(' ') ||
        user?.name?.split(' ').slice(1).join(' ') ||
        '',
      phone: previous.phone || defaultAddress?.phone || user?.phone || '',
      address: previous.address || defaultAddress?.line1 || '',
      city: previous.city || defaultAddress?.city || '',
      state: previous.state || defaultAddress?.state || '',
      zip: previous.zip || defaultAddress?.postalCode || '',
    }));
  }, [savedAddresses, user]);

  // An empty cart has nothing to check out.
  useEffect(() => {
    if (!cartLoading && items.length === 0 && step !== 3) navigate('/cart', { replace: true });
  }, [cartLoading, items.length, step, navigate]);

  const effectiveTotals = quote?.totals ?? totals;

  const shippingPayload = useMemo(
    () => ({
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      phone: formData.phone.trim(),
      line1: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      postalCode: formData.zip.trim(),
      country: 'India',
    }),
    [formData],
  );

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const goToPayment = (event) => {
    event.preventDefault();
    setError('');
    setStep(2);
  };

  const applyCoupon = async () => {
    setCouponMessage('');
    try {
      const preview = await cartApi.preview(coupon.trim());
      setQuote(preview);
      setCouponMessage(
        preview.couponCode ? `Coupon ${preview.couponCode} applied.` : 'Coupon removed.',
      );
    } catch (couponError) {
      setQuote(null);
      setCouponMessage(couponError.message);
    }
  };

  /**
   * Places the order, then hands payment to Razorpay. The amount charged is
   * whatever the server put on the order — the browser never proposes a total.
   */
  const handlePay = async () => {
    setError('');
    setProcessing(true);

    let order;
    try {
      order = await orders.checkout({
        contactEmail: formData.email.trim(),
        shipping: shippingPayload,
        couponCode: quote?.couponCode || undefined,
        saveAddress: true,
      });
    } catch (checkoutError) {
      setProcessing(false);
      setError(checkoutError.message);
      refresh();
      return;
    }

    try {
      const session = await orders.paymentSession(order.id);
      const Razorpay = await loadRazorpayCheckout();

      const checkout = new Razorpay({
        key: session.keyId,
        amount: session.amount,
        currency: session.currency,
        name: 'Kabeer — The Ethnic Store',
        description: `Order ${session.orderNumber}`,
        order_id: session.providerOrderId,
        prefill: {
          name: session.customer.name,
          email: session.customer.email,
          contact: session.customer.contact,
        },
        theme: { color: '#531323' },
        handler: async (response) => {
          try {
            const confirmed = await orders.verifyPayment({
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            setPlacedOrder(confirmed);
            setStep(3);
            refresh();
          } catch (verifyError) {
            setError(
              `${verifyError.message} Your payment may still be processing — check your orders before paying again.`,
            );
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            setError(
              `Payment was not completed. Order ${order.orderNumber} is held for a short while — you can finish paying from your account.`,
            );
            refresh();
          },
        },
      });

      checkout.on('payment.failed', (response) => {
        setProcessing(false);
        setError(response?.error?.description ?? 'The payment could not be completed.');
      });

      checkout.open();
    } catch (paymentError) {
      setProcessing(false);
      setError(paymentError.message);
      refresh();
    }
  };

  if (cartLoading) {
    return (
      <div className="pt-32 pb-24 min-h-screen relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F2418] via-[#0D1F15] to-[#0F2418] -z-10"></div>
        <InlineLoader />
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F2418] via-[#0D1F15] to-[#0F2418] -z-10"></div>

      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl text-center text-white mb-10"
          style={{ fontFamily: "'Boston Angel', 'Great Vibes', cursive", letterSpacing: '0.02em' }}
        >
          Secure Checkout
        </motion.h1>

        {/* Stepper Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center w-full max-w-sm">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 1 ? 'bg-[#E89B3C] text-white' : 'bg-white/10 text-white/50'}`}>1</div>
            <div className={`flex-1 h-1 mx-2 rounded-full ${step >= 2 ? 'bg-[#E89B3C]' : 'bg-white/10'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 2 ? 'bg-[#E89B3C] text-white' : 'bg-white/10 text-white/50'}`}>2</div>
            <div className={`flex-1 h-1 mx-2 rounded-full ${step >= 3 ? 'bg-[#E89B3C]' : 'bg-white/10'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 3 ? 'bg-[#E89B3C] text-white' : 'bg-white/10 text-white/50'}`}>3</div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">

            {/* Step 1: Shipping */}
            {step === 1 && (
              <motion.form
                key="step1"
                onSubmit={goToPayment}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-2xl text-white font-serif mb-6 flex items-center gap-3">
                  <div className="w-2 h-6 bg-[#E89B3C] rounded-full"></div> Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-white/60 text-sm mb-2">Email Address</label>
                    <input id="email" required type="email" name="email" value={formData.email} onChange={handleInputChange} className={FIELD_CLASS} placeholder="your@email.com" />
                  </div>
                  <div>
                    <label htmlFor="firstName" className="block text-white/60 text-sm mb-2">First Name</label>
                    <input id="firstName" required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className={FIELD_CLASS} />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-white/60 text-sm mb-2">Last Name</label>
                    <input id="lastName" required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className={FIELD_CLASS} />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="phone" className="block text-white/60 text-sm mb-2">Phone Number</label>
                    <input id="phone" required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={FIELD_CLASS} placeholder="For delivery updates" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-white/60 text-sm mb-2">Street Address</label>
                    <input id="address" required type="text" name="address" value={formData.address} onChange={handleInputChange} className={FIELD_CLASS} />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-white/60 text-sm mb-2">City</label>
                    <input id="city" required type="text" name="city" value={formData.city} onChange={handleInputChange} className={FIELD_CLASS} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="state" className="block text-white/60 text-sm mb-2">State</label>
                      <input id="state" required type="text" name="state" value={formData.state} onChange={handleInputChange} className={FIELD_CLASS} />
                    </div>
                    <div>
                      <label htmlFor="zip" className="block text-white/60 text-sm mb-2">PIN Code</label>
                      <input id="zip" required type="text" name="zip" value={formData.zip} onChange={handleInputChange} className={FIELD_CLASS} />
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex justify-end">
                  <button type="submit" className="bg-[#531323] hover:bg-[#731830] text-white px-8 py-3 rounded-full transition-all">
                    Continue to Payment
                  </button>
                </div>
              </motion.form>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl text-white font-serif flex items-center gap-3">
                    <div className="w-2 h-6 bg-[#E89B3C] rounded-full"></div> Payment
                  </h2>
                  <div className="flex gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-400" />
                    <span className="text-white/60 text-sm">Secured by Razorpay</span>
                  </div>
                </div>

                <div className="bg-[#0F2418]/50 border border-white/10 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-6 h-6 text-white" />
                    <span className="text-white">Card, UPI, Netbanking & Wallets</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {items.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm text-white/70">
                        <span>
                          {item.product.name} <span className="text-white/40">× {item.quantity}</span>
                        </span>
                        <span>{formatPrice(item.lineTotal)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-white/70">
                      <span>Subtotal</span>
                      <span>{formatPrice(effectiveTotals.subtotal)}</span>
                    </div>
                    {effectiveTotals.discount > 0 ? (
                      <div className="flex justify-between text-white/70">
                        <span>Discount</span>
                        <span className="text-[#E89B3C]">-{formatPrice(effectiveTotals.discount)}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-white/70">
                      <span>Tax</span>
                      <span>{formatPrice(effectiveTotals.tax)}</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Shipping</span>
                      <span>{effectiveTotals.shipping === 0 ? 'Free' : formatPrice(effectiveTotals.shipping)}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="coupon" className="block text-white/60 text-sm mb-2">Have a coupon?</label>
                  <div className="flex gap-3">
                    <input
                      id="coupon"
                      type="text"
                      value={coupon}
                      onChange={(event) => setCoupon(event.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className={FIELD_CLASS}
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="px-6 rounded-xl border border-white/20 text-white/80 hover:border-[#E89B3C] hover:text-[#E89B3C] transition-colors whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </div>
                  {couponMessage ? <p className="text-xs text-white/60 mt-2">{couponMessage}</p> : null}
                </div>

                {paymentConfig && !paymentConfig.enabled ? (
                  <p className="text-sm text-[#E89B3C] mb-6" role="alert">
                    Online payments are not enabled on this store yet. Please contact us to complete your order.
                  </p>
                ) : null}

                {error ? <p className="text-sm text-[#E89B3C] mb-6" role="alert">{error}</p> : null}

                <div className="flex justify-between items-center mt-10 border-t border-white/10 pt-8">
                  <button onClick={() => setStep(1)} className="text-white/60 hover:text-white transition-colors">
                    Back
                  </button>
                  <button
                    onClick={handlePay}
                    disabled={processing || !paymentConfig?.enabled}
                    className="bg-[#531323] hover:bg-[#731830] text-white px-10 py-4 text-lg font-medium rounded-full transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? 'Processing…' : `Pay ${formatPrice(effectiveTotals.total)}`}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Success */}
            {step === 3 && placedOrder && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-[#E89B3C]/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#E89B3C]/50">
                  <Check className="w-12 h-12 text-[#E89B3C]" />
                </div>
                <h2 className="text-4xl text-white font-serif mb-4">Order Confirmed</h2>
                <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
                  Thank you for your purchase! Your elegant piece of heritage is being prepared. Order #{placedOrder.orderNumber}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link to="/account" className="inline-flex items-center gap-2 bg-[#531323] hover:bg-[#731830] text-white px-8 py-3 rounded-full transition-all duration-300">
                    View Order
                  </Link>
                  <Link to="/shop" className="inline-flex items-center gap-2 bg-white/10 hover:bg-[#E89B3C] hover:text-white border border-white/20 text-white px-8 py-3 rounded-full transition-all duration-300">
                    <ShoppingBag className="w-5 h-5" /> Continue Shopping
                  </Link>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
