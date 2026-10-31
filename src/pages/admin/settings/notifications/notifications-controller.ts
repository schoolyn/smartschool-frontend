import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { useGetEmailNotificationLog, useUpdateEmailNotificationSettings } from "@/entities/notification";

const useNotificationsController = () => {
  const { t } = useTranslation();
  const { organizationId } = useParams<{ organizationId: string }>();

  const getEmailNotificationLog = useGetEmailNotificationLog(organizationId || "");
  const updateSettings = useUpdateEmailNotificationSettings(organizationId || "");

  const emailNotificationsEnabled = getEmailNotificationLog.data?.settings.emailNotificationsEnabled ?? true;
  const feeRemindersEnabled = getEmailNotificationLog.data?.settings.feeRemindersEnabled ?? true;
  const emailLog = getEmailNotificationLog.data?.rows || [];

  const toggleEmailNotifications = (checked: boolean) => {
    updateSettings.mutate(
      { emailNotificationsEnabled: checked },
      {
        onSuccess: () =>
          toast.success(
            checked ? "Email notifications enabled for this school." : "Email notifications turned off for this school."
          ),
        onError: () => toast.error("Could not update the setting. Please try again."),
      }
    );
  };

  const toggleFeeReminders = (checked: boolean) => {
    updateSettings.mutate(
      { feeRemindersEnabled: checked },
      {
        onSuccess: () =>
          toast.success(checked ? "Parents will get fee due reminders." : "Fee due reminders turned off."),
        onError: () => toast.error("Could not update the setting. Please try again."),
      }
    );
  };

  return {
    t,
    emailNotificationsEnabled,
    feeRemindersEnabled,
    emailLog,
    isLoading: getEmailNotificationLog.isLoading,
    isUpdating: updateSettings.isPending,
    toggleEmailNotifications,
    toggleFeeReminders,
  };
};

export default useNotificationsController;
