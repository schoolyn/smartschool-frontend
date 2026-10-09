import { useEffect, useState } from "react";

// counts from 0 up to target with an ease-out curve; jumps straight to the target when the user
// prefers reduced motion
export const useCountUp = (target: number | null, duration = 700) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === null) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const progress = reduce ? 1 : Math.min(1, (now - start) / duration);
      setValue(progress < 1 ? Math.round(target * (1 - Math.pow(1 - progress, 3))) : target);
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
};
