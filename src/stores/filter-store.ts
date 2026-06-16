"use client";

import { create } from "zustand";

export type SortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "name_desc"
  | "popularity";

interface FilterState {
  /** Active category slug */
  category: string | null;
  /** Active subcategory slug */
  subcategory: string | null;
  /** Selected sizes (multi-select) */
  sizes: string[];
  /** Selected colors (multi-select) */
  colors: string[];
  /** Price range in paise [min, max] */
  priceRange: [number, number];
  /** Sort order */
  sortBy: SortOption;
  /** Search query */
  searchQuery: string;
  /** Only show in-stock items */
  inStockOnly: boolean;
  /** Current page for pagination */
  page: number;

  // Actions
  setCategory: (category: string | null) => void;
  setSubcategory: (subcategory: string | null) => void;
  toggleSize: (size: string) => void;
  toggleColor: (color: string) => void;
  setPriceRange: (range: [number, number]) => void;
  setSortBy: (sort: SortOption) => void;
  setSearchQuery: (query: string) => void;
  setInStockOnly: (inStock: boolean) => void;
  setPage: (page: number) => void;
  /** Reset all filters to defaults */
  resetFilters: () => void;
  /** Count of active filters (excluding sort and search) */
  getActiveFilterCount: () => number;
}

const DEFAULT_PRICE_RANGE: [number, number] = [0, 5000000]; // ₹0 to ₹50,000

export const useFilterStore = create<FilterState>((set, get) => ({
  category: null,
  subcategory: null,
  sizes: [],
  colors: [],
  priceRange: DEFAULT_PRICE_RANGE,
  sortBy: "newest",
  searchQuery: "",
  inStockOnly: false,
  page: 1,

  setCategory: (category) => set({ category, subcategory: null, page: 1 }),
  setSubcategory: (subcategory) => set({ subcategory, page: 1 }),
  toggleSize: (size) =>
    set((s) => ({
      sizes: s.sizes.includes(size)
        ? s.sizes.filter((sz) => sz !== size)
        : [...s.sizes, size],
      page: 1,
    })),
  toggleColor: (color) =>
    set((s) => ({
      colors: s.colors.includes(color)
        ? s.colors.filter((c) => c !== color)
        : [...s.colors, color],
      page: 1,
    })),
  setPriceRange: (range) => set({ priceRange: range, page: 1 }),
  setSortBy: (sortBy) => set({ sortBy, page: 1 }),
  setSearchQuery: (searchQuery) => set({ searchQuery, page: 1 }),
  setInStockOnly: (inStockOnly) => set({ inStockOnly, page: 1 }),
  setPage: (page) => set({ page }),
  resetFilters: () =>
    set({
      category: null,
      subcategory: null,
      sizes: [],
      colors: [],
      priceRange: DEFAULT_PRICE_RANGE,
      sortBy: "newest",
      searchQuery: "",
      inStockOnly: false,
      page: 1,
    }),
  getActiveFilterCount: () => {
    const s = get();
    let count = 0;
    if (s.category) count++;
    if (s.subcategory) count++;
    if (s.sizes.length > 0) count += s.sizes.length;
    if (s.colors.length > 0) count += s.colors.length;
    if (
      s.priceRange[0] !== DEFAULT_PRICE_RANGE[0] ||
      s.priceRange[1] !== DEFAULT_PRICE_RANGE[1]
    )
      count++;
    if (s.inStockOnly) count++;
    return count;
  },
}));
