import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import toast from "react-hot-toast";
import type { ReactNode } from "react";

import useError from "./error";

const navigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useNavigate: () => navigate,
}));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("react-hot-toast", () => ({ default: { error: vi.fn(), success: vi.fn() } }));

const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;

const failed = (Error?: { code?: string; name?: string; message?: string }) => ({
  isError: true,
  error: { response: { Status: "failure", Error } },
});

const report = (mutation: ReturnType<typeof failed>) =>
  renderHook(() => useError({ mutation: mutation as never }), { wrapper });

beforeEach(() => {
  navigate.mockClear();
  vi.mocked(toast.error).mockClear();
});

describe("useError", () => {
  it("shows the server's message for a refused action, so the person knows why", () => {
    report(
      failed({
        code: "EX-00114",
        name: "ConflictError",
        message: "This student already has records. Withdraw the student instead.",
      }),
    );

    expect(toast.error).toHaveBeenCalledWith("This student already has records. Withdraw the student instead.");
  });

  it("does not mistake 'Student not found' for a sign-in failure, even though they share a code", () => {
    report(failed({ code: "EX-00101", name: "NotFoundError", message: "Student not found." }));

    expect(toast.error).toHaveBeenCalledWith("Student not found.");
  });

  it("still shows the localised sign-in message for a failed sign-in", () => {
    report(failed({ code: "EX-00101", name: "ValidationError", message: "Email or password seems to be wrong." }));

    expect(toast.error).toHaveBeenCalledWith("messages.invalid_credentials");
  });

  it("falls back to a generic message when the server sent none", () => {
    report(failed(undefined));

    expect(toast.error).toHaveBeenCalledWith("messages.something_went_wrong");
  });

  it("sends an expired session to sign-in", () => {
    report(failed({ code: "EX-00001", name: "AuthenticationError", message: "expired" }));

    expect(navigate).toHaveBeenCalledWith("/login");
    expect(toast.error).not.toHaveBeenCalled();
  });
});
