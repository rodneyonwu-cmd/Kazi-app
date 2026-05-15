import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// ============================================================
// KAZI SWIPE-BACK GESTURE — anywhere on the page, swipe right
// to navigate to the previous screen. Uses pointer events so it
// works for touch, pen, and mouse-drag alike.
//
// Trigger rules:
//   - Horizontal distance >= MIN_DISTANCE px
//   - Vertical drift never exceeds MAX_VERTICAL_DRIFT px during
//     the gesture (cancels if user is scrolling vertically)
//   - Direction is dominantly horizontal: |dx| > 2.5 * |dy|
//   - Completes within MAX_DURATION ms
//
// Skipped when:
//   - Route is in SKIP_ROUTES (auth/onboarding screens)
//   - Gesture starts inside an input/textarea/contenteditable
//   - Gesture starts inside a horizontally-scrollable container
//   - Gesture starts inside an element with `touch-action: none`
//     or `pan-y` (those elements are handling their own gestures —
//     range sliders, bottom-sheet drag handles, carousels, etc.)
//   - Gesture starts inside an element with [data-no-swipe-back]
// ============================================================

const MIN_DISTANCE = 100;
const MAX_DURATION = 500;
const MAX_VERTICAL_DRIFT = 40;
const DIRECTION_RATIO = 2.5;

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

function shouldSkipFromTarget(el) {
  let node = el;
  while (node && node !== document.body) {
    if (node.nodeType === 1) {
      const tag = node.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      if (node.isContentEditable) return true;
      if (node.hasAttribute && node.hasAttribute('data-no-swipe-back')) return true;
      const style = window.getComputedStyle(node);
      const touchAction = style.touchAction;
      if (touchAction === 'none' || touchAction === 'pan-y' || touchAction === 'pan-y pinch-zoom') {
        return true;
      }
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
    let pointerId = null;

    function onPointerDown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (shouldSkipFromTarget(e.target)) return;
      startX = e.clientX;
      startY = e.clientY;
      startT = Date.now();
      tracking = true;
      pointerId = e.pointerId;
    }

    function onPointerMove(e) {
      if (!tracking || e.pointerId !== pointerId) return;
      const dy = e.clientY - startY;
      if (Math.abs(dy) > MAX_VERTICAL_DRIFT) {
        tracking = false;
      }
    }

    function onPointerUp(e) {
      if (!tracking || e.pointerId !== pointerId) return;
      tracking = false;
      pointerId = null;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const dt = Date.now() - startT;
      if (dt > MAX_DURATION) return;
      if (dx < MIN_DISTANCE) return;
      if (Math.abs(dx) < Math.abs(dy) * DIRECTION_RATIO) return;
      navigate(-1);
    }

    function onPointerCancel() {
      tracking = false;
      pointerId = null;
    }

    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerCancel, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
    };
  }, [navigate, pathname]);

  return null;
}
