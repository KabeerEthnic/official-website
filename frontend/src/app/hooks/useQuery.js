import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Minimal data-fetching hook: runs `fetcher` when its dependencies change,
 * tracks loading and error state, and aborts the in-flight request when the
 * component unmounts or the dependencies change again — so a slow response can
 * never overwrite a newer one.
 */
export function useQuery(fetcher, deps = [], { enabled = true, initialData = null } = {}) {
  const [state, setState] = useState({ data: initialData, error: null, loading: enabled });
  const [reloadKey, setReloadKey] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  /*
   * Effects run after render, so on the render where a dependency changes — or
   * where `enabled` flips on — the fetch has not started yet. Reporting
   * `loading: false` there would hand the caller "no data, no error, not
   * loading", and it would dereference null. Comparing the current inputs
   * against the ones the effect last started with closes that window.
   */
  const signature = JSON.stringify([deps, enabled, reloadKey]);
  const startedSignature = useRef(null);
  const awaitingEffect = enabled && startedSignature.current !== signature;

  useEffect(() => {
    startedSignature.current = signature;

    if (!enabled) {
      setState((prev) => ({ ...prev, loading: false }));
      return undefined;
    }

    const controller = new AbortController();
    let active = true;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetcherRef
      .current({ signal: controller.signal })
      .then((data) => {
        if (active) setState({ data, error: null, loading: false });
      })
      .catch((error) => {
        if (!active || error.name === 'AbortError') return;
        setState({ data: null, error, loading: false });
      });

    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, reloadKey]);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);
  const setData = useCallback((updater) => {
    setState((prev) => ({
      ...prev,
      data: typeof updater === 'function' ? updater(prev.data) : updater,
    }));
  }, []);

  return {
    ...state,
    // A disabled query is never loading; an enabled one is loading until the
    // effect for the current inputs has actually run.
    loading: enabled && (state.loading || awaitingEffect),
    refetch,
    setData,
  };
}

export default useQuery;
