import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Login from "./login";

const mutate = vi.fn();

vi.mock("../service", () => ({
  useSingIn: () => ({ mutate, isPending: false, isSuccess: false, isError: false, data: undefined }),
}));

vi.mock("../../../context/auth-context", () => ({
  useAuth: () => ({ login: vi.fn() }),
}));

vi.mock("@/context/theme-context", () => ({
  useTheme: () => ({ theme: "light" }),
}));

const renderLogin = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("Login", () => {
  it("shows zod validation errors and does not submit for an invalid email", async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("Email address"), "not-an-email");
    await user.type(screen.getByPlaceholderText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: "buttons.sign_in" }));

    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("submits valid credentials to the sign-in mutation", async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("Email address"), "admin@school.test");
    await user.type(screen.getByPlaceholderText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "buttons.sign_in" }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith({ email: "admin@school.test", password: "secret123" })
    );
  });
});
