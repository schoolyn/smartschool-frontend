import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { useGetEmailNotificationLog, useUpdateEmailNotificationSettings } from "./service/notifications-service";

const useNotificationsController = () => {
  const { t } = useTranslation();
  const { organizationId } = useParams<{ organizationId: string }>();

  const getEmailNotificationLog = useGetEmailNotificationLog(organizationId || "");
  const updateSettings = useUpdateEmailNotificationSettings(organizationId || "");

  const emailNotificationsEnabled = getEmailNotificationLog.data?.settings.emailNotificationsEnabled ?? true;
  const emailLog = getEmailNotificationLog.data?.items || [];

  const toggleEmailNotifications = (checked: boolean) => {
    updateSettings.mutate(checked, {
      onSuccess: () => toast.success(checked ? "Email notifications enabled for this school." : "Email notifications turned off for this school."),
      onError: () => toast.error("Could not update the setting. Please try again."),
    });
  };

  return {
    t,
    emailNotificationsEnabled,
    emailLog,
    isLoading: getEmailNotificationLog.isLoading,
    isUpdating: updateSettings.isPending,
    toggleEmailNotifications,
  };
};

export default useNotificationsController;
