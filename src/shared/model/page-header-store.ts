import { create } from "zustand";

export interface PageHeaderConfig {
  title?: string;
  onBack?: () => void;
}

interface PageHeaderState {
  config: PageHeaderConfig | null;
  setConfig: (config: PageHeaderConfig | null) => void;
}

// the open page hands its title and back button to the top bar
export const usePageHeaderStore = create<PageHeaderState>((set) => ({
  config: null,
  setConfig: (config) => set({ config }),
}));
