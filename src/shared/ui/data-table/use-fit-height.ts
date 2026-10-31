import { useLayoutEffect, useRef, useState } from "react";

const MIN_HEIGHT = 360;
// room left under the table at the bottom of the screen
const BOTTOM_GAP = 24;

// the card fills the screen from its top so only the rows scroll; a table in a dialog keeps its height
const useFitHeight = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [maxHeight, setMaxHeight] = useState<number>();

  useLayoutEffect(() => {
    const card = ref.current;
    const page = card?.closest("main");
    if (!card || !page) return;

    const fit = () => {
      const offset = card.getBoundingClientRect().top - page.getBoundingClientRect().top + page.scrollTop;
      setMaxHeight(Math.max(MIN_HEIGHT, page.clientHeight - offset - BOTTOM_GAP));
    };
    fit();
    // content above the table can grow or shrink (a banner, a filter row), which moves where it starts
    const observer = new ResizeObserver(fit);
    observer.observe(page);
    if (page.firstElementChild) observer.observe(page.firstElementChild);
    return () => observer.disconnect();
  }, []);

  return { ref, maxHeight };
};

export default useFitHeight;
