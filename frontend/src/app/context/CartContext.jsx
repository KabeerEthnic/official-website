import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { cart as cartApi } from '../../lib/api/index.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

const EMPTY = {
  items: [],
  totals: { subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0, currency: 'INR' },
  itemCount: 0,
  couponCode: null,
};

/**
 * The cart lives on the server so it survives devices and cannot be tampered
 * with. This provider keeps one copy in memory for the header badge and the
 * cart page, and every mutation returns the authoritative new cart.
 */
export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pending = useRef(0);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async (signal) => {
    try {
      setCart(await cartApi.get({ signal }));
      setError(null);
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') return;
      setError(fetchError);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload once auth is known: signing in merges the guest cart server-side,
  // so the contents can change at that moment.
  useEffect(() => {
    if (authLoading) return undefined;

    const controller = new AbortController();
    setLoading(true);
    refresh(controller.signal);

    return () => controller.abort();
  }, [authLoading, user?.id, refresh]);

  const run = useCallback(async (operation) => {
    pending.current += 1;
    setBusy(true);
    try {
      const next = await operation();
      setCart(next);
      setError(null);
      return next;
    } finally {
      pending.current -= 1;
      if (pending.current === 0) setBusy(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      ...cart,
      loading,
      busy,
      error,
      refresh: () => refresh(),
      addItem: (productId, quantity) => run(() => cartApi.addItem(productId, quantity)),
      updateItem: (itemId, quantity) => run(() => cartApi.updateItem(itemId, quantity)),
      removeItem: (itemId) => run(() => cartApi.removeItem(itemId)),
    }),
    [cart, loading, busy, error, refresh, run],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside <CartProvider>');
  return context;
}
