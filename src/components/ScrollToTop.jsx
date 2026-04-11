import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ============================================================
// KAZI SCROLL TO TOP — scrolls to the top of the page on every
// pathname change. React Router doesn't reset scroll position
// when navigating between routes by default; this fixes that so
// every page starts at the top, not wherever the previous page
// was scrolled to.
// ============================================================

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset scroll for window, document.documentElement, and
    // document.body — covers every browser and CSS layout pattern.
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window.scrollTo ? 'instant' : 'auto' });
    }
    if (typeof document !== 'undefined') {
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [pathname]);

  return null;
}
