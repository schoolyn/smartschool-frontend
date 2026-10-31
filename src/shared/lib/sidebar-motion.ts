// opening glides out quickly and lands softly; closing takes a little longer with an even ease-in-out
export const panelMotion = (isCollapsed: boolean) =>
  isCollapsed ? "duration-400 ease-settle" : "duration-350 ease-glide";

export const PANEL_MOTION = "transition-[width]";

// labels slide in just after the panel opens; on close they fade first, then their space closes (see index.css)
export const revealMotion = (isCollapsed: boolean) =>
  isCollapsed ? "sidebar-reveal-out -translate-x-3 opacity-0" : "sidebar-reveal-in translate-x-0 opacity-100";
