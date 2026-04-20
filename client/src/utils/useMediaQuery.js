import { useState, useEffect } from 'react';

/**
 * Hook that returns true when the viewport matches the given media query.
 * Example: const isMobile = useMediaQuery('(max-width: 1023px)');
 */
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

export default useMediaQuery;
