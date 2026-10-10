import { useCallback, useEffect, useState } from "react";

// cycles through `length` items on a timer; picking one manually stops the timer for good
export const useAutoAdvance = (length: number, intervalMs: number) => {
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % length), intervalMs);
    return () => window.clearInterval(id);
  }, [auto, length, intervalMs]);

  const select = useCallback((next: number) => {
    setAuto(false);
    setIndex(next);
  }, []);

  return { index, select };
};
