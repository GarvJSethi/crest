"use client";

import { create } from "zustand";

interface UIState {
  /** Whether the mobile sidebar/menu is open */
  isSidebarOpen: boolean;
  /** Whether the cart drawer (slide-over) is open */
  isCartDrawerOpen: boolean;
  /** Whether the search overlay/command palette is open */
  isSearchOpen: boolean;
  /** Whether the mobile menu is open */
  isMobileMenuOpen: boolean;
  /** Currently active modal (null = no modal) */
  activeModal: string | null;

  toggleSidebar: () => void;
  toggleCartDrawer: () => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleSearch: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  setActiveModal: (modal: string | null) => void;
  closeAll: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  isCartDrawerOpen: false,
  isSearchOpen: false,
  isMobileMenuOpen: false,
  activeModal: null,

  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  toggleCartDrawer: () =>
    set((s) => ({ isCartDrawerOpen: !s.isCartDrawerOpen })),
  openCartDrawer: () => set({ isCartDrawerOpen: true }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleMobileMenu: () =>
    set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  setActiveModal: (modal) => set({ activeModal: modal }),
  closeAll: () =>
    set({
      isSidebarOpen: false,
      isCartDrawerOpen: false,
      isSearchOpen: false,
      isMobileMenuOpen: false,
      activeModal: null,
    }),
}));
