import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// a page's tab kept in ?tab=, so links, refresh and Back open the same tab; unknown values fall back
const useTabParam = <T extends string>(keys: readonly T[], fallback: T) => {
  const [params, setParams] = useSearchParams();
  const asked = params.get("tab") as T | null;
  const tab = asked && keys.includes(asked) ? asked : fallback;

  // the address always names the open tab, so the sidebar can highlight it
  useEffect(() => {
    if (asked !== tab && tab) {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("tab", tab);
          return next;
        },
        { replace: true }
      );
    }
  }, [asked, tab, setParams]);

  // a new tab starts clean: one tab's search or page never carries into the next
  const setTab = (next: T) => setParams({ tab: next }, { replace: true });

  return [tab, setTab] as const;
};

export default useTabParam;
