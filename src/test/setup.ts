import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// test.globals is off so RTL's auto-cleanup never registers; without this DOM leaks between tests
afterEach(() => cleanup());

// real i18next init fetches over http and suspends; tests only need t() to echo the key
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
