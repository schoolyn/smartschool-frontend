import { useEffect, useRef } from "react";

import { usePageHeaderStore } from "@/shared/model/page-header-store";

interface UsePageHeaderOptions {
  title?: string;
  onBack?: () => void;
}

// pages call this to put their title and optional back button in the top bar
const usePageHeader = ({ title, onBack }: UsePageHeaderOptions) => {
  const setConfig = usePageHeaderStore((state) => state.setConfig);
  // the latest handler runs on click; re-registering on each new function would re-render the page and loop
  const latestBack = useRef(onBack);
  latestBack.current = onBack;
  const hasBack = !!onBack;

  useEffect(() => {
    setConfig({ title, onBack: hasBack ? () => latestBack.current?.() : undefined });
    return () => setConfig(null);
  }, [title, hasBack, setConfig]);
};

export default usePageHeader;
