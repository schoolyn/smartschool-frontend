import { useTranslation } from "react-i18next";
import { BellIcon } from "@heroicons/react/24/outline";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/ui/kit/sheet";
import Spinner from "@/shared/ui/spinner";
import { useNotifications } from "@/entities/notification";
import { INotification } from "@/entities/notification";

const timeAgo = (isoDate: string) => {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NotificationSheet = () => {
  const { t } = useTranslation();
  const { notifications, unreadCount, isLoading, isSheetOpen, openSheet, closeSheet, markAsRead, markAllAsRead } =
    useNotifications();

  const handleItemClick = (notification: INotification) => {
    if (!notification.readAt) markAsRead(notification.id);
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={(open) => (open ? openSheet() : closeSheet())}>
      <SheetContent className="max-w-md">
        <SheetHeader className="flex items-center justify-between pr-14">
          <SheetTitle>{t("labels.notifications")}</SheetTitle>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="rounded-md px-2 py-1 text-xs font-medium text-primary-600 hover:bg-gray-50 hover:text-primary-700"
            >
              {t("labels.mark_all_as_read")}
            </button>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
              <BellIcon className="h-10 w-10" />
              <p className="text-sm">{t("labels.no_notifications")}</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  onClick={() => handleItemClick(notification)}
                  className={`cursor-pointer px-4 py-3 hover:bg-gray-50 ${
                    !notification.readAt ? "bg-primary-50/60" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!notification.readAt && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-600" />}
                    <div className={`min-w-0 ${notification.readAt ? "ml-4" : ""}`}>
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="mt-0.5 text-sm text-gray-600 line-clamp-2">{notification.body}</p>
                      <p className="mt-1 text-xs text-gray-400">{timeAgo(notification.createdAt)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationSheet;
