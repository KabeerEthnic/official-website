import { useState } from 'react';
import {
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  ShieldCheck,
  ShoppingCart,
  Store,
  Tag,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';

import { ErrorBoundary } from '../../components/ErrorBoundary.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { to: '/admin/content', label: 'Page content', icon: FileText },
  { to: '/admin/governance', label: 'Governance', icon: ShieldCheck },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const signOut = async () => {
    await logout();
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
      isActive ? 'bg-[#E89B3C]/10 text-[#E89B3C] font-medium' : 'text-white/65 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-[#0F2418] text-white">
      {/* Mobile bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-5 py-4 bg-[#0B1B12]/95 backdrop-blur-md border-b border-white/10">
        <Link to="/admin" className="font-serif text-lg">
          Kabeer <span className="text-[#E89B3C]">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="p-2 rounded-lg bg-white/5 border border-white/10"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex">
        <aside
          className={`${menuOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0 border-r border-white/10 bg-[#0B1B12] lg:min-h-screen`}
        >
          <div className="hidden lg:block px-6 py-7 border-b border-white/10">
            <Link to="/admin" className="font-serif text-xl">
              Kabeer <span className="text-[#E89B3C]">Admin</span>
            </Link>
            <p className="text-white/40 text-xs mt-1">{user?.email}</p>
          </div>

          <nav className="p-3 space-y-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={linkClass}
                onClick={() => setMenuOpen(false)}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="p-3 mt-4 border-t border-white/10 space-y-1">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/65 hover:bg-white/5 hover:text-white transition-all"
            >
              <Store className="w-4 h-4" />
              View storefront
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-300 hover:bg-white/5 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 px-5 sm:px-8 py-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
