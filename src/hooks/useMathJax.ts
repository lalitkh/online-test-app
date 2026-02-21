import { useEffect, useCallback } from 'react';
import '../types';

export function useMathJax(deps: unknown[]) {
  const typesetMath = useCallback(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch((err: unknown) =>
        console.error('MathJax error:', err)
      );
    }
  }, []);

  useEffect(() => {
    // Use requestAnimationFrame for reliable post-render typesetting
    const id = requestAnimationFrame(() => {
      typesetMath();
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return typesetMath;
}
