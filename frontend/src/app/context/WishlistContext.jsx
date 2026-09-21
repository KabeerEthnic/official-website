import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { users } from '../../lib/api/index.js';
import { useAuth } from './AuthContext.jsx';

const WishlistContext = createContext(null);

/**
 * Saved items for signed-in shoppers. Ids are kept in a Set so the heart on a
 * product card is an O(1) lookup, and toggles update optimistically — a
 * failure rolls the heart back.
 */
export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [ids, setIds] = useState(() => new Set());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (signal) => {
      if (!isAuthenticated) {
        setIds(new Set());
        setItems([]);
        return;
      }

      setLoading(true);
      try {
        const saved = await users.wishlist({ signal });
        setItems(saved);
        setIds(new Set(saved.map((product) => product.id)));
      } catch (error) {
        if (error.name !== 'AbortError') {
          setItems([]);
          setIds(new Set());
        }
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated],
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const toggle = useCallback(
    async (productId) => {
      if (!isAuthenticated) return { requiresLogin: true };

      const saved = ids.has(productId);

      setIds((prev) => {
        const next = new Set(prev);
        if (saved) next.delete(productId);
        else next.add(productId);
        return next;
      });

      try {
        if (saved) await users.removeFromWishlist(productId);
        else await users.addToWishlist(productId);
        await load();
        return { saved: !saved };
      } catch (error) {
        setIds((prev) => {
          const next = new Set(prev);
          if (saved) next.add(productId);
          else next.delete(productId);
          return next;
        });
        throw error;
      }
    },
    [ids, isAuthenticated, load],
  );

  const value = useMemo(
    () => ({
      items,
      loading,
      count: ids.size,
      has: (productId) => ids.has(productId),
      toggle,
      refresh: () => load(),
    }),
    [items, loading, ids, toggle, load],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used inside <WishlistProvider>');
  return context;
}
