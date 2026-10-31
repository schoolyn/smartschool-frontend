import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Cookies from "js-cookie";

import { AuthenticatedRoute, FallbackRoute, ProtectedRoute, PublicRoute } from "./route-guards";

type MockUser = { role?: "admin" | "teacher" | "parent"; isPlatformAdmin?: boolean } | null;

let mockUser: MockUser = null;
let mockIsMobile = false;

vi.mock("@/entities/session/model/auth-context", () => ({ useAuth: () => ({ user: mockUser }) }));
// role checks are tested with TenantProvider itself; here it only has to receive it
let receivedRole: string | undefined;
vi.mock("@/entities/session/model/tenant-context", () => ({
  TenantProvider: ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) => {
    receivedRole = requiredRole;
    return children;
  },
}));
vi.mock("@/features/theme/model/theme-context", () => ({ useTheme: () => ({ theme: "light" }) }));
vi.mock("@/shared/lib/hooks/is-mobile/is-mobile", () => ({ default: () => mockIsMobile }));

const renderAt = (path: string, element: React.ReactNode) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/page" element={element} />
        <Route path="/login" element={<p>login page</p>} />
        <Route path="/not-access" element={<p>not access page</p>} />
        <Route path="/organization" element={<p>organization page</p>} />
        <Route path="/org1/teacher/dashboard" element={<p>teacher home</p>} />
        <Route path="*" element={<FallbackRoute />} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  mockUser = null;
  mockIsMobile = false;
  Cookies.remove("kidSightOrganizationId");
});

describe("ProtectedRoute", () => {
  const page = (role: "admin" | "teacher" | "parent") => (
    <ProtectedRoute role={role}>
      <p>secret page</p>
    </ProtectedRoute>
  );

  it("sends a signed-out visitor to login", () => {
    renderAt("/page", page("admin"));
    expect(screen.getByText("login page")).toBeInTheDocument();
  });

  it("hands the page's role to the school check, since a person's role differs from school to school", () => {
    mockUser = { role: "teacher" };
    renderAt("/page", page("admin"));
    expect(receivedRole).toBe("admin");
  });

  it("renders the page for the matching role", () => {
    mockUser = { role: "admin" };
    renderAt("/page", page("admin"));
    expect(screen.getByText("secret page")).toBeInTheDocument();
  });

  it("shows the larger-screen notice instead of the page on phones", () => {
    mockUser = { role: "admin" };
    mockIsMobile = true;
    renderAt("/page", page("admin"));
    expect(screen.queryByText("secret page")).not.toBeInTheDocument();
    expect(screen.getByText("Best viewed on a larger screen")).toBeInTheDocument();
  });
});

describe("PublicRoute", () => {
  const page = (
    <PublicRoute>
      <p>public page</p>
    </PublicRoute>
  );

  it("shows the page to a signed-out visitor", () => {
    renderAt("/page", page);
    expect(screen.getByText("public page")).toBeInTheDocument();
  });

  it("sends a signed-in user to the school picker, which opens their school in their role there", () => {
    mockUser = { isPlatformAdmin: false };
    renderAt("/page", page);
    expect(screen.getByText("organization page")).toBeInTheDocument();
  });
});

describe("AuthenticatedRoute", () => {
  it("requires a signed-in user, whatever the role", () => {
    const page = (
      <AuthenticatedRoute>
        <p>picker</p>
      </AuthenticatedRoute>
    );
    renderAt("/page", page);
    expect(screen.getByText("login page")).toBeInTheDocument();
  });
});

describe("FallbackRoute", () => {
  it("sends unknown URLs to login when signed out", () => {
    renderAt("/nowhere", null);
    expect(screen.getByText("login page")).toBeInTheDocument();
  });

  it("sends unknown URLs to /not-access for a signed-in user", () => {
    mockUser = { role: "admin" };
    renderAt("/nowhere", null);
    expect(screen.getByText("not access page")).toBeInTheDocument();
  });
});
