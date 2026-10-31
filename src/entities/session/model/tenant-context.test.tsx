import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { TenantProvider, useTenant } from "./tenant-context";

let mockOrgId = "org-1";
vi.mock("react-router-dom", () => ({
  useParams: () => ({ organizationId: mockOrgId }),
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{to}</div>,
}));

let mockUser: { isPlatformAdmin?: boolean; role?: string } | null = { isPlatformAdmin: false };
vi.mock("./auth-context", () => ({
  useAuth: () => ({ user: mockUser }),
}));

let mockIsLoading = false;
let mockOrganizations: { id: string; name: string; myRole?: string | null }[] = [{ id: "org-1", name: "School One" }];
vi.mock("../api/auth-service", () => ({
  useGetAllOrganizations: () => ({ isLoading: mockIsLoading, data: { items: mockOrganizations } }),
}));

const Consumer = () => {
  const { organizationId, organization } = useTenant();
  return (
    <div data-testid="consumer">
      {organizationId} / {organization?.name}
    </div>
  );
};

describe("TenantProvider", () => {
  it("shows a loading state while memberships are still resolving", () => {
    mockIsLoading = true;
    render(
      <TenantProvider>
        <Consumer />
      </TenantProvider>
    );
    expect(screen.queryByTestId("consumer")).not.toBeInTheDocument();
    mockIsLoading = false;
  });

  it("renders children when the route's organizationId matches a real membership", () => {
    mockOrgId = "org-1";
    mockOrganizations = [{ id: "org-1", name: "School One" }];
    render(
      <TenantProvider>
        <Consumer />
      </TenantProvider>
    );
    expect(screen.getByTestId("consumer")).toHaveTextContent("org-1 / School One");
  });

  it("redirects to /not-access when the organizationId isn't one of the user's memberships", () => {
    mockOrgId = "someone-elses-school";
    mockOrganizations = [{ id: "org-1", name: "School One" }];
    mockUser = { isPlatformAdmin: false };
    render(
      <TenantProvider>
        <Consumer />
      </TenantProvider>
    );
    expect(screen.getByTestId("navigate")).toHaveTextContent("/not-access");
    expect(screen.queryByTestId("consumer")).not.toBeInTheDocument();
  });

  it("lets a platform admin through even without a membership in that org", () => {
    mockOrgId = "someone-elses-school";
    mockOrganizations = [{ id: "org-1", name: "School One" }];
    mockUser = { isPlatformAdmin: true };
    render(
      <TenantProvider>
        <Consumer />
      </TenantProvider>
    );
    expect(screen.getByTestId("consumer")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
  });

  describe("role in the school", () => {
    const renderArea = (requiredRole: "admin" | "teacher" | "parent") =>
      render(
        <TenantProvider requiredRole={requiredRole}>
          <Consumer />
        </TenantProvider>
      );

    it("opens the area matching the person's role in this school, even if their account role is different", () => {
      mockOrgId = "org-1";
      mockUser = { role: "teacher" };
      mockOrganizations = [{ id: "org-1", name: "School One", myRole: "admin" }];
      renderArea("admin");
      expect(screen.getByTestId("consumer")).toBeInTheDocument();
    });

    it("sends someone in another role's area to their own area of that school", () => {
      mockOrgId = "org-1";
      mockUser = { role: "admin" };
      mockOrganizations = [{ id: "org-1", name: "School One", myRole: "parent" }];
      renderArea("admin");
      expect(screen.getByTestId("navigate")).toHaveTextContent("/org-1/parent/dashboard");
    });
  });
});
