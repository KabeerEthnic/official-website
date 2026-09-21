import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';

import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { PageLoader } from './components/Feedback.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { Layout } from './layouts/Layout.jsx';
import { Home } from './pages/Home.jsx';

// Every route below the homepage is split out of the entry bundle. The admin
// area in particular is never downloaded by a shopper.
const Shop = lazy(() => import('./pages/Shop.jsx').then((m) => ({ default: m.Shop })));
const ProductDetails = lazy(() =>
  import('./pages/ProductDetails.jsx').then((m) => ({ default: m.ProductDetails })),
);
const Cart = lazy(() => import('./pages/Cart.jsx').then((m) => ({ default: m.Cart })));
const Checkout = lazy(() => import('./pages/Checkout.jsx').then((m) => ({ default: m.Checkout })));
const Login = lazy(() => import('./pages/Login.jsx').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register.jsx').then((m) => ({ default: m.Register })));
const ForgotPassword = lazy(() =>
  import('./pages/ForgotPassword.jsx').then((m) => ({ default: m.ForgotPassword })),
);
const Policy = lazy(() => import('./pages/Policy.jsx').then((m) => ({ default: m.Policy })));
const Support = lazy(() => import('./pages/Support.jsx').then((m) => ({ default: m.Support })));
const Account = lazy(() => import('./pages/Account.jsx').then((m) => ({ default: m.Account })));
const NotFound = lazy(() => import('./pages/NotFound.jsx').then((m) => ({ default: m.NotFound })));

const AdminLayout = lazy(() =>
  import('./pages/admin/AdminLayout.jsx').then((m) => ({ default: m.AdminLayout })),
);
const AdminDashboard = lazy(() =>
  import('./pages/admin/Dashboard.jsx').then((m) => ({ default: m.Dashboard })),
);
const AdminProducts = lazy(() =>
  import('./pages/admin/Products.jsx').then((m) => ({ default: m.Products })),
);
const AdminProductEditor = lazy(() =>
  import('./pages/admin/ProductEditor.jsx').then((m) => ({ default: m.ProductEditor })),
);
const AdminCategories = lazy(() =>
  import('./pages/admin/Categories.jsx').then((m) => ({ default: m.Categories })),
);
const AdminOrders = lazy(() => import('./pages/admin/Orders.jsx').then((m) => ({ default: m.Orders })));
const AdminOrderDetail = lazy(() =>
  import('./pages/admin/OrderDetail.jsx').then((m) => ({ default: m.OrderDetail })),
);
const AdminCustomers = lazy(() =>
  import('./pages/admin/Customers.jsx').then((m) => ({ default: m.Customers })),
);
const AdminReviews = lazy(() =>
  import('./pages/admin/Reviews.jsx').then((m) => ({ default: m.Reviews })),
);
const AdminCoupons = lazy(() =>
  import('./pages/admin/Coupons.jsx').then((m) => ({ default: m.Coupons })),
);
const AdminContent = lazy(() =>
  import('./pages/admin/Content.jsx').then((m) => ({ default: m.Content })),
);
const AdminGovernance = lazy(() =>
  import('./pages/admin/Governance.jsx').then((m) => ({ default: m.Governance })),
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="shop" element={<Shop />} />
                    <Route path="product/:slug" element={<ProductDetails />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="policies/:slug" element={<Policy />} />

                    <Route element={<ProtectedRoute />}>
                      <Route path="checkout" element={<Checkout />} />
                      <Route path="account" element={<Account />} />
                      <Route path="support" element={<Support />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Route>

                  <Route element={<ProtectedRoute requireAdmin />}>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="products/new" element={<AdminProductEditor />} />
                      <Route path="products/:id" element={<AdminProductEditor />} />
                      <Route path="categories" element={<AdminCategories />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="orders/:id" element={<AdminOrderDetail />} />
                      <Route path="customers" element={<AdminCustomers />} />
                      <Route path="reviews" element={<AdminReviews />} />
                      <Route path="coupons" element={<AdminCoupons />} />
                      <Route path="content" element={<AdminContent />} />
                      <Route path="content/:slug" element={<AdminContent />} />
                      <Route path="governance" element={<AdminGovernance />} />
                    </Route>
                  </Route>
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
