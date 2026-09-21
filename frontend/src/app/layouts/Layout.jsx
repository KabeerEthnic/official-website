import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';

import { Footer } from '../components/Footer.jsx';
import { Header } from '../components/Header.jsx';

export function Layout() {
  const location = useLocation();
  // The shop page renders its own footer inside each category layout.
  const isShopPage = location.pathname === '/shop';

  // Land at the top of every page the way a fresh page load would.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#0F2418]">
      <Header />
      <Outlet />
      {!isShopPage && <Footer />}
    </div>
  );
}
