import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import NotificationSheet from "./notification-sheet";
import { INotification } from "@/entities/notification";

const markAsRead = vi.fn();
const markAllAsRead = vi.fn();
const closeSheet = vi.fn();
const openSheet = vi.fn();

let mockState: {
  notifications: INotification[];
  unreadCount: number;
  isLoading: boolean;
  isSheetOpen: boolean;
};

vi.mock("@/entities/notification/model/notification-context", () => ({
  useNotifications: () => ({
    ...mockState,
    openSheet,
    closeSheet,
    markAsRead,
    markAllAsRead,
  }),
}));

const buildNotification = (overrides: Partial<INotification> = {}): INotification => ({
  id: "n1",
  type: "notice",
  title: "New homework assigned",
  body: "Math homework due Friday",
  readAt: null,
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe("NotificationSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = { notifications: [], unreadCount: 0, isLoading: false, isSheetOpen: true };
  });

  it("renders nothing when closed", () => {
    mockState.isSheetOpen = false;
    render(<NotificationSheet />);
    expect(screen.queryByText("labels.notifications")).not.toBeInTheDocument();
  });

  it("shows the empty state when there are no notifications", () => {
    render(<NotificationSheet />);
    expect(screen.getByText("labels.no_notifications")).toBeInTheDocument();
  });

  it("renders each notification's title and body", () => {
    mockState.notifications = [
      buildNotification({ id: "n1", title: "New homework assigned" }),
      buildNotification({ id: "n2", title: "Attendance marked absent", readAt: new Date().toISOString() }),
    ];
    render(<NotificationSheet />);
    expect(screen.getByText("New homework assigned")).toBeInTheDocument();
    expect(screen.getByText("Attendance marked absent")).toBeInTheDocument();
  });

  it("marks an unread notification as read when clicked", () => {
    mockState.notifications = [buildNotification({ id: "n1", readAt: null })];
    render(<NotificationSheet />);
    fireEvent.click(screen.getByText("New homework assigned"));
    expect(markAsRead).toHaveBeenCalledWith("n1");
  });

  it("does not re-mark an already-read notification as read", () => {
    mockState.notifications = [buildNotification({ id: "n1", readAt: new Date().toISOString() })];
    render(<NotificationSheet />);
    fireEvent.click(screen.getByText("New homework assigned"));
    expect(markAsRead).not.toHaveBeenCalled();
  });

  it("shows the mark-all-as-read action only when there are unread notifications", () => {
    mockState.notifications = [buildNotification({ id: "n1", readAt: null })];
    mockState.unreadCount = 1;
    render(<NotificationSheet />);
    const markAllButton = screen.getByText("labels.mark_all_as_read");
    fireEvent.click(markAllButton);
    expect(markAllAsRead).toHaveBeenCalledTimes(1);
  });

  it("hides the mark-all-as-read action when everything is read", () => {
    mockState.notifications = [buildNotification({ id: "n1", readAt: new Date().toISOString() })];
    mockState.unreadCount = 0;
    render(<NotificationSheet />);
    expect(screen.queryByText("labels.mark_all_as_read")).not.toBeInTheDocument();
  });
});
