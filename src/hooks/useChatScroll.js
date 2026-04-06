import { useEffect, useRef } from 'react';

/**
 * Keeps a scrollable container pinned to the bottom when dependencies change.
 * Pass a memoized dependency array (e.g. useMemo(() => [a, b], [a, b])) so the
 * effect does not run on every parent render.
 */
function useChatScroll(dependencies) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const id = window.requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });

    return () => window.cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller supplies memoized deps array
  }, dependencies);

  return containerRef;
}

export default useChatScroll;
