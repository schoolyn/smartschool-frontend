import DataTable, { DataTableColumn } from "@/shared/ui/data-table";
import { Switch } from "@/shared/ui/kit/switch";
import { IEmailLog } from "@/entities/notification";
import useNotificationsController from "./notifications-controller";

const statusColors: Record<string, string> = {
  // waiting in the email queue, or being retried after a failed attempt
  queued: "bg-amber-100 text-amber-800",
  sent: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  skipped: "bg-gray-100 text-gray-600",
};

const columns: DataTableColumn<IEmailLog>[] = [
  {
    id: "recipient",
    header: "Recipient",
    cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.recipientEmail}</span>,
  },
  {
    id: "subject",
    header: "Subject",
    cell: ({ row }) => (
      <span className="text-gray-600">
        {row.original.subject}
        {row.original.reason && <span className="block text-xs text-gray-400">{row.original.reason}</span>}
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    meta: { align: "center" },
    cell: ({ row }) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[row.original.status]}`}>
        {row.original.status}
      </span>
    ),
  },
  {
    id: "date",
    header: "Date",
    meta: { align: "center", className: "text-gray-500" },
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
];

const Notifications = () => {
  const {
    t,
    emailNotificationsEnabled,
    feeRemindersEnabled,
    emailLog,
    isLoading,
    isUpdating,
    toggleEmailNotifications,
    toggleFeeReminders,
  } = useNotificationsController();

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">{t("labels.email_notifications")}</p>
            <p className="text-sm text-gray-500 mt-1">
              Turn off to stop every email Opscul sends for this school - fee receipts, notices, homework, attendance,
              results and leave-request updates. A parent or staff member can still turn their own email notifications
              off separately regardless of this setting.
            </p>
          </div>
          <Switch
            checked={emailNotificationsEnabled}
            disabled={isUpdating}
            onCheckedChange={toggleEmailNotifications}
          />
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-6">
          <div>
            <p className="text-sm font-medium text-gray-900">Fee due reminders</p>
            <p className="text-sm text-gray-500 mt-1">
              Remind parents in the app three days before an instalment is due, then once a week while it stays unpaid.
              Reminders are emailed too while email notifications are on.
            </p>
          </div>
          <Switch checked={feeRemindersEnabled} disabled={isUpdating} onCheckedChange={toggleFeeReminders} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Recent email activity</h3>
        <DataTable
          columns={columns}
          data={emailLog}
          getRowId={(log) => log.id}
          isLoading={isLoading}
          itemLabel={{ one: "email", other: "emails" }}
          pagination={{ pageSize: 20 }}
          empty={{ title: "No emails sent yet", description: "Every email the school sends will be listed here." }}
        />
      </div>
    </div>
  );
};

export default Notifications;
