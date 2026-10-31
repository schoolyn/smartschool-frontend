import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import NotificationBell from "./notification-bell";

const openSheet = vi.fn();
let unreadCount = 0;

vi.mock("@/entities/notification/model/notification-context", () => ({
  useNotifications: () => ({ unreadCount, openSheet }),
}));

// the sheet reads the same mocked context; it renders but stays closed
vi.mock("./notification-sheet", () => ({ default: () => null }));

describe("NotificationBell", () => {
  it("hides the unread badge when there are no unread notifications", () => {
    unreadCount = 0;
    render(<NotificationBell isCollapsed={false} />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("shows the unread count on the badge", () => {
    unreadCount = 3;
    render(<NotificationBell isCollapsed={false} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("caps the badge at 9+", () => {
    unreadCount = 25;
    render(<NotificationBell isCollapsed={false} />);
    expect(screen.getByText("9+")).toBeInTheDocument();
  });

  it("opens the sheet when clicked", () => {
    unreadCount = 1;
    render(<NotificationBell isCollapsed={false} />);
    fireEvent.click(screen.getByRole("button"));
    expect(openSheet).toHaveBeenCalledTimes(1);
  });
});
