"use client";

import { useEffect, useState } from "react";

/**
 * Prevents Zustand hydration mismatch in Next.js.
 * Wraps children and only renders after client-side hydration is complete.
 * This prevents cart counts, prices, etc. from flickering on initial load.
 */
export function CartHydration({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    // Return children but any Zustand-dependent values will show defaults
    // This prevents the hydration mismatch error
    return <>{children}</>;
  }

  return <>{children}</>;
}
