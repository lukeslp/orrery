/*
 * Shared UI styles and responsive helpers
 */

import { useState, useEffect } from 'react';

// ─── Glass panel style ──────────────────────────────────────────────────────────

export const glass: React.CSSProperties = {
  background: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid var(--panel-border, rgba(255,255,255,0.08))',
  borderRadius: 6,
};

// ─── Responsive hook ────────────────────────────────────────────────────────────

export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}
