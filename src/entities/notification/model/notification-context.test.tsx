import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";

import { NotificationProvider, useNotifications } from "./notification-context";
import { INotification } from "./types";

const mockSocketHandlers: Record<string, (payload: unknown) => void> = {};
const mockSocket = {
  on: vi.fn((event: string, handler: (payload: unknown) => void) => {
    mockSocketHandlers[event] = handler;
  }),
  disconnect: vi.fn(),
};
const ioMock = vi.fn();
ioMock.mockReturnValue(mockSocket);

vi.mock("socket.io-client", () => ({
  io: (...args: unknown[]) => ioMock(...args),
}));

vi.mock("js-cookie", () => ({
  default: { get: vi.fn(() => "fake-token") },
}));

vi.mock("react-router-dom", () => ({
  useParams: () => ({ organizationId: "org-1" }),
}));

vi.mock("@/entities/session/model/auth-context", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

let mockQueryData: { items: INotification[]; unread_count: number } | undefined;
let mockIsLoading = false;
const markReadMutate = vi.fn();
const markAllReadMutate = vi.fn();

vi.mock("../api/notifications-service", () => ({
  useGetMyNotifications: () => ({ data: mockQueryData, isLoading: mockIsLoading }),
  useMarkNotificationRead: () => ({ mutate: markReadMutate }),
  useMarkAllNotificationsRead: () => ({ mutate: markAllReadMutate }),
}));

const buildNotification = (overrides: Partial<INotification> = {}): INotification => ({
  id: "n1",
  type: "notice",
  title: "Test notification",
  body: "body",
  readAt: null,
  createdAt: new Date().toISOString(),
  ...overrides,
});

const Consumer = () => {
  const { notifications, unreadCount, isSheetOpen } = useNotifications();
  return (
    <div>
      <span data-testid="unread-count">{unreadCount}</span>
      <span data-testid="sheet-open">{String(isSheetOpen)}</span>
      <ul>
        {notifications.map((n) => (
          <li key={n.id}>{n.title}</li>
        ))}
      </ul>
    </div>
  );
};

describe("NotificationProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockSocketHandlers).forEach((key) => delete mockSocketHandlers[key]);
    mockQueryData = { items: [], unread_count: 0 };
    mockIsLoading = false;
  });

  it("connects the socket once a user is present", () => {
    render(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>
    );
    expect(ioMock).toHaveBeenCalledTimes(1);
    // the token is read on each (re)connect, so a refreshed token is used after a reconnect
    const { auth } = ioMock.mock.calls[0][1];
    const sent = vi.fn();
    auth(sent);
    expect(sent).toHaveBeenCalledWith({ token: "fake-token" });
  });

  it("renders notifications fetched from the server", () => {
    mockQueryData = { items: [buildNotification({ id: "n1", title: "Homework due" })], unread_count: 1 };
    render(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>
    );
    expect(screen.getByText("Homework due")).toBeInTheDocument();
    expect(screen.getByTestId("unread-count").textContent).toBe("1");
  });

  it("prepends a live-pushed notification ahead of the fetched list", () => {
    mockQueryData = { items: [buildNotification({ id: "n1", title: "Existing" })], unread_count: 1 };
    render(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>
    );

    act(() => {
      mockSocketHandlers["notification:new"](buildNotification({ id: "n2", title: "Live pushed" }));
    });

    const items = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(items).toEqual(["Live pushed", "Existing"]);
    expect(screen.getByTestId("unread-count").textContent).toBe("2");
  });

  it("does not duplicate a live push that also exists in the fetched list", () => {
    mockQueryData = { items: [buildNotification({ id: "n1", title: "Existing" })], unread_count: 1 };
    render(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>
    );

    act(() => {
      mockSocketHandlers["notification:new"](buildNotification({ id: "n1", title: "Existing" }));
    });

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("throws when used outside a NotificationProvider", () => {
    const OutsideConsumer = () => {
      useNotifications();
      return null;
    };
    // suppress the expected React error boundary console noise
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<OutsideConsumer />)).toThrow("useNotifications must be used within a NotificationProvider");
    spy.mockRestore();
  });
});
