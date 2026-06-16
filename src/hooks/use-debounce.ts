"use client";

import { useState, useEffect } from "react";

/**
 * Debounce a value. Useful for search inputs to avoid excessive API calls.
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @example const debouncedSearch = useDebounce(searchQuery, 300);
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
