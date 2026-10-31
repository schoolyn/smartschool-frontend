import { create } from "zustand";

const COLLAPSE_STORAGE_KEY = "sidebar_collapsed";

interface LayoutState {
  // mobile drawer only; on lg+ the sidebar is always visible via CSS
  isSidebarOpen: boolean;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  toggleCollapse: () => void;
}

// sidebar state read by the layout, header and sidebar directly, instead of passing it down as props
export const useLayoutStore = create<LayoutState>()((set) => ({
  isSidebarOpen: false,
  isCollapsed: localStorage.getItem(COLLAPSE_STORAGE_KEY) === "true",
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleCollapse: () =>
    set((state) => {
      localStorage.setItem(COLLAPSE_STORAGE_KEY, String(!state.isCollapsed));
      return { isCollapsed: !state.isCollapsed };
    }),
}));
