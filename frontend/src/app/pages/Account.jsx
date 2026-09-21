import { useState } from 'react';
import { motion } from 'motion/react';
import { Package, Heart, LifeBuoy, MapPin, User, LogOut, ChevronRight } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router';

import { orders as ordersApi } from '../../lib/api/index.js';
import { formatDate, formatPrice, titleCase } from '../../lib/format.js';
import { ErrorState, InlineLoader } from '../components/Feedback.jsx';
import { AccountAddresses } from '../components/account/AccountAddresses.jsx';
import { AccountProfile } from '../components/account/AccountProfile.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useQuery } from '../hooks/useQuery.js';

const TABS = [
  { id: 'orders', icon: Package, label: 'My Orders' },
  { id: 'wishlist', icon: Heart, label: 'Wishlist' },
  { id: 'addresses', icon: MapPin, label: 'Saved Addresses' },
  { id: 'profile', icon: User, label: 'Profile Details' },
];

const STATUS_STYLES = {
  DELIVERED: 'bg-green-500/20 text-green-300',
  CANCELLED: 'bg-red-500/20 text-red-300',
};

function OrderList() {
  const [expanded, setExpanded] = useState(null);
  const [cancelError, setCancelError] = useState('');

  const { data, loading, error, refetch } = useQuery(
    (options) => ordersApi.list({ limit: 20 }, options),
    [],
  );

  const orders = data?.data ?? [];

  const cancel = async (orderId) => {
    setCancelError('');
    try {
      await ordersApi.cancel(orderId, 'Cancelled by customer');
      refetch();
    } catch (error_) {
      setCancelError(error_.message);
    }
  };

  if (loading) return <InlineLoader />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  if (orders.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center py-20">
        <p className="text-white/60 text-lg font-serif italic mb-2">No orders yet</p>
        <Link to="/shop" className="text-[#E89B3C] text-sm hover:text-white transition-colors">
          Start exploring the collections
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl text-white font-serif mb-6 pb-4 border-b border-white/10">Order History</h2>

      {cancelError ? <p className="text-sm text-[#E89B3C] mb-4" role="alert">{cancelError}</p> : null}

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all group">
            <button
              type="button"
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left"
            >
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="text-white font-medium">{order.orderNumber}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[order.status] ?? 'bg-[#E89B3C]/20 text-[#E89B3C]'}`}>
                    {titleCase(order.status)}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60">
                    {titleCase(order.paymentStatus)}
                  </span>
                </div>
                <p className="text-white/50 text-sm">
                  {formatDate(order.createdAt)} • {order.items.length} {order.items.length > 1 ? 'items' : 'item'}
                </p>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                <span className="text-xl text-white font-medium">{formatPrice(order.total)}</span>
                <ChevronRight className={`w-5 h-5 text-white/30 group-hover:text-white transition-all ${expanded === order.id ? 'rotate-90' : ''}`} />
              </div>
            </button>

            {expanded === order.id ? (
              <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} loading="lazy" className="w-14 h-18 object-cover rounded-lg" />
                    ) : null}
                    <div className="flex-1">
                      <Link to={`/product/${item.productSlug}`} className="text-white text-sm hover:text-[#E89B3C] transition-colors">
                        {item.name}
                      </Link>
                      <p className="text-white/40 text-xs">{item.sku} • Qty {item.quantity}</p>
                    </div>
                    <span className="text-white/70 text-sm">{formatPrice(item.lineTotal)}</span>
                  </div>
                ))}

                <div className="pt-4 border-t border-white/10 text-sm space-y-1">
                  <div className="flex justify-between text-white/60"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                  {order.discount > 0 ? (
                    <div className="flex justify-between text-white/60"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>
                  ) : null}
                  <div className="flex justify-between text-white/60"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>
                  <div className="flex justify-between text-white/60"><span>Shipping</span><span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span></div>
                </div>

                <div className="text-white/50 text-xs leading-relaxed">
                  Delivering to {order.shippingAddress.name}, {order.shippingAddress.line1},{' '}
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.postalCode}
                </div>

                {['PENDING', 'CONFIRMED'].includes(order.status) && order.paymentStatus !== 'PAID' ? (
                  <button
                    type="button"
                    onClick={() => cancel(order.id)}
                    className="text-xs text-red-300 hover:text-red-200 transition-colors"
                  >
                    Cancel this order
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function WishlistPanel() {
  const { items, loading } = useWishlist();

  if (loading) return <InlineLoader />;

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center py-20">
        <p className="text-white/60 text-lg font-serif italic mb-2">Nothing saved yet</p>
        <Link to="/shop" className="text-[#E89B3C] text-sm hover:text-white transition-colors">
          Browse the collections
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl text-white font-serif mb-6 pb-4 border-b border-white/10">Wishlist</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((product) => (
          <Link key={product.id} to={`/product/${product.slug}`} className="group block">
            <div className="aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-white/5">
              {product.images[0] ? (
                <img
                  src={product.images[0].url}
                  alt={product.images[0].altText}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : null}
            </div>
            <p className="text-white text-sm">{product.name}</p>
            <p className="text-white/50 text-sm">{formatPrice(product.effectivePrice)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') ?? 'orders';

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F2418] via-[#0D1F15] to-[#0F2418] -z-10"></div>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12">

          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <h1 className="text-3xl text-white mb-8" style={{ fontFamily: "'Boston Angel', 'Great Vibes', cursive", letterSpacing: '0.02em' }}>My Account</h1>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <p className="text-white font-medium">{user?.name}</p>
                <p className="text-white/50 text-sm break-words">{user?.email}</p>
              </div>

              <nav className="flex flex-col p-2 space-y-1">
                {TABS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSearchParams({ tab: item.id })}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                      activeTab === item.id
                        ? 'bg-[#E89B3C]/10 text-[#E89B3C] font-medium'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}

                <Link to="/support" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-all text-left">
                  <LifeBuoy className="w-5 h-5" />
                  Help &amp; Support
                </Link>

                {user?.role === 'ADMIN' ? (
                  <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-all text-left">
                    <User className="w-5 h-5" />
                    Admin Dashboard
                  </Link>
                ) : null}

                <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-white/5 mt-4 transition-all text-left">
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 min-h-[500px]"
            >
              {activeTab === 'orders' && <OrderList />}
              {activeTab === 'wishlist' && <WishlistPanel />}
              {activeTab === 'addresses' && <AccountAddresses />}
              {activeTab === 'profile' && <AccountProfile />}
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
