import { useTranslation } from "react-i18next";
import { PlusIcon } from "@heroicons/react/20/solid";

import Spinner from "@/shared/ui/spinner";
import EmptyState from "@/shared/ui/empty-state";
import SectionHeader from "@/shared/ui/section-header";
import CustomSelectDropdown from "@/shared/ui/custom-select";
import DeleteConfirmationDialog from "@/shared/ui/delete-confirmation-dialog";
import { DateField, FileField } from "@/shared/ui/form-fields";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/kit/form";
import { Button } from "@/shared/ui/kit/button";
import { Textarea } from "@/shared/ui/kit/textarea";
import { useLeaveRequestsController } from "./leave-requests-controller";
import { SelectOption } from "@/shared/types";

const statusBadgeClass: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-600",
};

const LeaveRequests = () => {
  const { t } = useTranslation();
  const c = useLeaveRequestsController();
  const childOptions = c.children.map((child): SelectOption => ({
    id: child.studentId.id,
    name: child.studentId.name,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SectionHeader
        title="Leave Requests"
        description="Request leave for your child and track its status"
        action={{
          label: "New Leave Request",
          icon: PlusIcon,
          onClick: c.toggleForm,
          disabled: c.children.length === 0,
          title:
            c.children.length === 0
              ? "Leave can be requested once the school links your child to this account"
              : undefined,
        }}
      />

      {c.showForm && (
        <Form {...c.form}>
          <form onSubmit={c.onSubmit} className="bg-white shadow rounded-lg p-4 space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={c.form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Child</FormLabel>
                    <FormControl>
                      <CustomSelectDropdown
                        placeholder="Select child"
                        options={childOptions}
                        value={childOptions.find((option) => option.id === field.value) ?? null}
                        onChange={(o) => field.onChange(String(o.id))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DateField form={c.form} name="fromDate" label="From Date" />
              <DateField form={c.form} name="toDate" label="To Date" />
            </div>

            <FormField
              control={c.form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FileField
              form={c.form}
              name="attachment"
              label={t("labels.attachment")}
              accept=".pdf,.png,.jpg,.jpeg"
              maxBytes={10 * 1024 * 1024}
              hint="PDF, PNG or JPG, up to 10 MB"
            />

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => c.setShowForm(false)}>
                {t("buttons.cancel")}
              </Button>
              <Button type="submit" disabled={c.isCreating}>
                {t("buttons.save")}
              </Button>
            </div>
          </form>
        </Form>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Your Requests</h2>
        </div>
        {c.isLoading ? (
          <Spinner />
        ) : c.leaveRequests.length === 0 ? (
          <EmptyState
            title="No leave requests yet"
            description={
              c.children.length
                ? "Use New Leave Request to ask for leave for your child."
                : "Leave can be requested once the school links your child to this account."
            }
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {c.leaveRequests.map((lr) => (
              <div key={lr.id} className="px-4 py-4 flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {typeof lr.studentId === "object" ? lr.studentId.name : ""}{" "}
                    <span
                      className={`ml-2 inline-block px-2 py-0.5 text-xs rounded-full capitalize ${statusBadgeClass[lr.status]}`}
                    >
                      {lr.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(lr.fromDate).toLocaleDateString()} – {new Date(lr.toDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{lr.reason}</p>
                  {lr.decisionNote && <p className="text-xs text-gray-500 mt-1">Note from school: {lr.decisionNote}</p>}
                  {lr.attachmentURL && (
                    <a
                      href={lr.attachmentURL}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-xs text-primary-600 hover:underline"
                    >
                      {t("labels.attachment")}
                    </a>
                  )}
                </div>
                {lr.status === "pending" && (
                  <Button
                    variant="link"
                    onClick={() => c.handleCancel(lr.id)}
                    className="text-red-600 hover:text-red-800 shrink-0"
                  >
                    {t("buttons.cancel")}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmationDialog
        open={!!c.leaveRequestIdPendingCancel}
        title="Cancel Leave Request"
        description="Are you sure you want to cancel this leave request?"
        isLoading={c.isCancelling}
        confirmLabel="Cancel Request"
        cancelLabel="Keep It"
        onClose={c.cancelDialogClose}
        onConfirm={c.confirmCancel}
      />
    </div>
  );
};

export default LeaveRequests;
