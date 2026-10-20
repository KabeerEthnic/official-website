import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';

import { Footer } from '../components/Footer.jsx';
import { Header } from '../components/Header.jsx';
import { CurtainNotice, SiteCurtain } from '../components/SiteCurtain.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSite } from '../context/SiteContext.jsx';

// Reachable behind the curtain, so an administrator can always sign in.
const CURTAIN_EXEMPT = new Set(['/login', '/forgot-password']);

export function Layout() {
  const location = useLocation();
  const { isAdmin, loading: authLoading } = useAuth();
  const { curtain, curtainDown } = useSite();
  // The shop page renders its own footer inside each category layout.
  const isShopPage = location.pathname === '/shop';

  // Land at the top of every page the way a fresh page load would.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Administrators browse the real store behind the curtain. Waiting for the
  // session check keeps it from flashing at an admin on page load.
  if (curtainDown && !authLoading && !isAdmin && !CURTAIN_EXEMPT.has(location.pathname)) {
    return <SiteCurtain curtain={curtain} />;
  }

  return (
    <div className="min-h-screen bg-[#0F2418]">
      <Header />
      <Outlet />
      {!isShopPage && <Footer />}
      {curtainDown && isAdmin ? <CurtainNotice /> : null}
    </div>
  );
}
