import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// vitest has no global `afterEach` (test.globals isn't enabled), so RTL's own
// auto-cleanup never registers, without this, DOM from one test leaks into the next
afterEach(() => cleanup());

// real i18next init pulls translations over http and suspends, components under
// test only ever need t() to echo the key back, not the actual translated string
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// jsdom has no ResizeObserver, which Radix dialogs and popovers use to size themselves
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", ResizeObserverStub);
