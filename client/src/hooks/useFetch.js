import { useCallback, useEffect, useState } from 'react';

/** Ngarkon të dhëna asinkrone me gjendje loading/error dhe mundësi rifreskimi. */
export function useFetch(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(fn, deps);

  const run = useCallback(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    load()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error) => active && setState({ data: null, loading: false, error }));
    return () => {
      active = false;
    };
  }, [load]);

  useEffect(() => run(), [run]);

  return { ...state, reload: run, setData: (data) => setState((s) => ({ ...s, data })) };
}
