import { Outlet, useLocation, useSearchParams } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function Layout() {
  const location = useLocation();
  const isShopPage = location.pathname === '/shop';

  return (
    <div className="min-h-screen bg-[#0F2418]">
      <Header />
      <Outlet />
      {!isShopPage && <Footer />}
    </div>
  );
}

