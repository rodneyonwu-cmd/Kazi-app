import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// ============================================================
// KAZI SWIPE-BACK GESTURE — listens for an iOS-style edge swipe
// from the left side of the screen and navigates back in history
// when it completes. Works on any page so users can swipe right
// to return to the previous screen.
//
// Rules:
//   - Must start within EDGE_ZONE px of the left edge
//   - Must travel at least MIN_DISTANCE px horizontally
//   - Must be predominantly horizontal (|dx| > 2 * |dy|)
//   - Must complete within MAX_DURATION ms
//   - Skipped on auth/onboarding routes where there's nothing to
//     go back to inside the app
//   - Skipped when the touch starts inside an input or a
//     horizontally-scrollable container (e.g. carousels)
// ============================================================

const EDGE_ZONE = 30;
const MIN_DISTANCE = 80;
const MAX_DURATION = 600;

const SKIP_ROUTES = new Set([
  '/',
  '/login',
  '/signup',
  '/onboarding',
  '/otp-verification',
  '/forgot-password',
  '/reset-password',
  '/sso-callback',
]);

function isInteractiveTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;
  return false;
}

function startsInsideHorizontalScroller(el) {
  let node = el;
  while (node && node !== document.body) {
    if (node.nodeType === 1) {
      const style = window.getComputedStyle(node);
      const overflowX = style.overflowX;
      if ((overflowX === 'auto' || overflowX === 'scroll') && node.scrollWidth > node.clientWidth) {
        return true;
      }
    }
    node = node.parentNode;
  }
  return false;
}

export default function SwipeBackGesture() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (SKIP_ROUTES.has(pathname)) return;

    let startX = 0;
    let startY = 0;
    let startT = 0;
    let tracking = false;

    function onTouchStart(e) {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      if (t.clientX > EDGE_ZONE) return;
      if (isInteractiveTarget(e.target)) return;
      if (startsInsideHorizontalScroller(e.target)) return;
      startX = t.clientX;
      startY = t.clientY;
      startT = Date.now();
      tracking = true;
    }

    function onTouchMove(e) {
      if (!tracking) return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dy) > Math.abs(dx)) {
        tracking = false;
      }
    }

    function onTouchEnd(e) {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      const dt = Date.now() - startT;
      if (dt > MAX_DURATION) return;
      if (dx < MIN_DISTANCE) return;
      if (Math.abs(dx) < Math.abs(dy) * 2) return;
      navigate(-1);
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', () => { tracking = false; }, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [navigate, pathname]);

  return null;
}
