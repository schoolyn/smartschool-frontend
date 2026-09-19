import PageLoader from "@/components/page-loader";
import NoRecordFound from "@/components/no-record-found";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/table";
import { Switch } from "@/components/ui/switch";
import useNotificationsController from "./notifications-controller";

const statusColors: Record<string, string> = {
  sent: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  skipped: "bg-gray-100 text-gray-600",
};

const Notifications = () => {
  const { t, emailNotificationsEnabled, emailLog, isLoading, isUpdating, toggleEmailNotifications } =
    useNotificationsController();

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">{t("labels.email_notifications")}</p>
            <p className="text-sm text-gray-500 mt-1">
              Turn off to stop every email SmartSchool sends for this school — fee receipts, notices, homework,
              attendance, results and leave-request updates. A parent or staff member can still turn their own
              email notifications off separately regardless of this setting.
            </p>
          </div>
          <Switch checked={emailNotificationsEnabled} disabled={isUpdating} onCheckedChange={toggleEmailNotifications} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm font-medium text-gray-900 mb-4">Recent email activity</p>
        {isLoading ? (
          <PageLoader />
        ) : emailLog.length === 0 ? (
          <NoRecordFound t={t} searchTerm="" clearFilters={() => {}} />
        ) : (
          <Table>
            <TableHeader>
              <TableHead>Recipient</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Date</TableHead>
            </TableHeader>
            <TableBody>
              {emailLog.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium text-gray-900">{log.recipientEmail}</TableCell>
                  <TableCell className="text-gray-600">
                    {log.subject}
                    {log.reason && <span className="block text-xs text-gray-400">{log.reason}</span>}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[log.status]}`}>
                      {log.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default Notifications;
