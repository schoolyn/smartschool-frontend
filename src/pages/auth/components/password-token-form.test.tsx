import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import toast from "react-hot-toast";

import ResetPassword from "../reset-password";
import SetPassword from "../set-password";

const mutate = vi.fn();
const endSession = vi.fn();
const hook = () => ({ mutate, isPending: false });

vi.mock("../service", () => ({ useSetUserPassword: () => hook(), useResetUserPassword: () => hook() }));
vi.mock("@/context/theme-context", () => ({ useTheme: () => ({ theme: "light" }) }));
vi.mock("@/context/auth-context", () => ({ useAuth: () => ({ endSession }) }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn(), error: vi.fn() } }));

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/login" element={<p>login page</p>} />
      </Routes>
    </MemoryRouter>,
  );

const fill = async (password: string, confirm = password) => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("New password"), password);
  await user.type(screen.getByLabelText("Confirm password"), confirm);
  await user.click(screen.getByRole("button", { name: /^(Reset|Set) Password$/ }));
};

beforeEach(() => {
  mutate.mockReset();
  endSession.mockClear();
  vi.mocked(toast.success).mockClear();
});

describe("reset password page", () => {
  it("explains that the link is unusable when it carries no token", () => {
    renderAt("/reset-password");

    expect(screen.getByText(/reset link is invalid or missing its token/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("New password")).not.toBeInTheDocument();
  });

  it("does not submit a weak password, and says why", async () => {
    renderAt("/reset-password?token=abc");
    await fill("alllowercase");

    expect(await screen.findByText(/at least 3 of: lowercase, uppercase, number, symbol/i)).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("does not submit passwords that differ", async () => {
    renderAt("/reset-password?token=abc");
    await fill("Sunrise#2026", "Sunrise#2027");

    expect(await screen.findByText("Passwords do not match.")).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("sends the emailed token with the new password, then returns to sign-in", async () => {
    mutate.mockImplementation((_vars, options) => options.onSuccess());
    renderAt("/reset-password?token=emailed-token");
    await fill("Sunrise#2026");

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith({ token: "emailed-token", password: "Sunrise#2026" }, expect.any(Object)),
    );
    expect(toast.success).toHaveBeenCalledWith("Password reset successfully. You can now sign in.");
    // an old session on this device is dropped, so sign-in shows instead of bouncing into that account
    expect(endSession).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("login page")).toBeInTheDocument();
  });

  it("shows the server's reason, for example an expired link, and stays on the page", async () => {
    mutate.mockImplementation((_vars, options) =>
      options.onError({ response: { Error: { message: "Password reset token is invalid or has expired." } } }),
    );
    renderAt("/reset-password?token=old");
    await fill("Sunrise#2026");

    expect(await screen.findByText("Password reset token is invalid or has expired.")).toBeInTheDocument();
    expect(screen.queryByText("login page")).not.toBeInTheDocument();
  });
});

describe("set password page (invite link)", () => {
  it("uses the same form with its own wording", async () => {
    mutate.mockImplementation((_vars, options) => options.onSuccess());
    renderAt("/set-password?token=invite-token");

    expect(screen.getByRole("heading", { name: "Set your password" })).toBeInTheDocument();
    await fill("Sunrise#2026");

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Password set successfully. You can now sign in."));
  });
});
