import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";

import { useAuth } from "@/entities/session";
import {
  useGetMyNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "../api/notifications-service";
import { INotification } from "./types";
import { USER_ACCESS_KEY } from "@/shared/lib";

interface NotificationContextType {
  notifications: INotification[];
  unreadCount: number;
  isLoading: boolean;
  isSheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { organizationId } = useParams();
  const { user } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState<INotification[]>([]);

  const { data, isLoading } = useGetMyNotifications(organizationId);
  const markReadMutation = useMarkNotificationRead(organizationId);
  const markAllReadMutation = useMarkAllNotificationsRead(organizationId);

  // the server list wins once fetched; live-pushed items only fill the gap before the first fetch
  useEffect(() => {
    if (data) setLiveNotifications([]);
  }, [data]);

  // switching school starts from that school's list
  const currentOrganization = useRef(organizationId);
  useEffect(() => {
    currentOrganization.current = organizationId;
    setLiveNotifications([]);
  }, [organizationId]);

  useEffect(() => {
    if (!user?.id || !Cookies.get(USER_ACCESS_KEY.TOKEN)) return;

    // the token is read on every (re)connect, so a reconnect after the token was refreshed still gets in
    const socket: Socket = io(import.meta.env.VITE_API_URL, {
      auth: (cb) => cb({ token: Cookies.get(USER_ACCESS_KEY.TOKEN) }),
      withCredentials: true,
    });

    // the server sends a person's notifications from every school they belong to; only this school's show here
    socket.on("notification:new", (notification: INotification) => {
      if (notification.organizationId && notification.organizationId !== currentOrganization.current) return;
      setLiveNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  const fetchedNotifications = data?.items || [];
  const notifications = [
    ...liveNotifications.filter((live) => !fetchedNotifications.some((n) => n.id === live.id)),
    ...fetchedNotifications,
  ];
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        isSheetOpen,
        openSheet: () => setIsSheetOpen(true),
        closeSheet: () => setIsSheetOpen(false),
        markAsRead: (notificationId: string) => markReadMutation.mutate(notificationId),
        markAllAsRead: () => markAllReadMutation.mutate(),
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
