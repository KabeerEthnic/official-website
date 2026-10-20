import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { site } from '../../lib/api/index.js';

const SiteContext = createContext(null);

/** How often an open tab rechecks, so shoppers see the curtain move without reloading. */
const POLL_MS = 60_000;

/**
 * Site-wide switches the storefront reads on every page — today, the curtain.
 * The site renders as open until the first answer arrives; a failed check
 * leaves it open rather than locking shoppers out over a network blip.
 */
export function SiteProvider({ children }) {
  const [curtain, setCurtain] = useState(null);

  const refresh = useCallback(async (options) => {
    try {
      const status = await site.status(options);
      setCurtain(status.curtain);
    } catch {
      // Aborted or unreachable: keep whatever we last knew.
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    refresh({ signal: controller.signal });

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, POLL_MS);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);

    return () => {
      controller.abort();
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({ curtain, curtainDown: Boolean(curtain?.enabled), setCurtain, refresh }),
    [curtain, refresh],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSite must be used inside <SiteProvider>');
  return context;
}
