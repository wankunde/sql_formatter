import { useEffect, useState } from 'react';
import type { ViewportMode } from '../components/TopBar';

const TABLET_BREAKPOINT = 1200;
const MOBILE_BREAKPOINT = 768;

function getViewportMode(width: number): ViewportMode {
  if (width >= TABLET_BREAKPOINT) return 'desktop';
  if (width >= MOBILE_BREAKPOINT) return 'tablet';
  return 'mobile';
}

export function useViewportMode() {
  const [mode, setMode] = useState<ViewportMode>(() => {
    if (typeof window === 'undefined') return 'desktop';
    return getViewportMode(window.innerWidth);
  });

  useEffect(() => {
    const handleResize = () => {
      setMode(getViewportMode(window.innerWidth));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return mode;
}
