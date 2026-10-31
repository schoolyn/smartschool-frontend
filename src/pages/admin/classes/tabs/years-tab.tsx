import { PlusIcon } from "@heroicons/react/20/solid";

import type { Action } from "@/shared/ui/action-buttons";
import { useHeaderActions } from "@/shared/ui/section-header";
import DataTable from "@/shared/ui/data-table";
import DeleteConfirmationDialog from "@/shared/ui/delete-confirmation-dialog";
import FormDialog from "@/shared/ui/form-dialog";
import { TextField, DateField } from "@/shared/ui/form-fields";
import { Switch } from "@/shared/ui/kit/switch";
import RolloverDialog from "../components/rollover-dialog";
import { yearColumns } from "./years-tab-columns";
import useYearsTabController, { YearAction } from "./years-tab-controller";

const ACTION_COPY: Record<YearAction, { title: (name: string) => string; description: string; confirm: string }> = {
  current: {
    title: (name) => `Make ${name} the current year?`,
    description: "It becomes the year the app opens on. Every other year stops being the current one.",
    confirm: "Make current",
  },
  close: {
    title: (name) => `Close ${name}?`,
    description:
      "A closed year is kept for its records but is no longer used for day-to-day work. You can reopen it later.",
    confirm: "Close year",
  },
  reopen: {
    title: (name) => `Reopen ${name}?`,
    description: "The year becomes active again.",
    confirm: "Reopen",
  },
};

const YearsTab = ({ organizationId }: { organizationId: string }) => {
  const c = useYearsTabController(organizationId);
  const addAction: Action = { label: "Add academic year", icon: PlusIcon, onClick: c.openAdd, variant: "primary" };
  useHeaderActions({
    action: addAction,
    secondaryActions: [{ label: "Start next year", onClick: c.startNextYear, hidden: c.items.length === 0 }],
  });

  return (
    <div>
      <DataTable
        columns={yearColumns(c.menuFor)}
        data={c.items}
        getRowId={(year) => year.id}
        isLoading={c.isLoading}
        itemLabel={{ one: "academic year", other: "academic years" }}
        pagination={{ pageSize: 20 }}
        empty={{
          title: "No academic years yet",
          description:
            "Everything else (classes, subjects, students) belongs to an academic year, so start by adding the current one.",
        }}
      />

      <FormDialog
        form={c.form}
        open={!!c.dialog}
        onClose={c.closeDialog}
        title={c.dialog?.year ? "Edit academic year" : "Add academic year"}
        description={c.dialog?.year ? undefined : "For example 2026-27, running from April to March."}
        submitLabel={c.dialog?.year ? "Save changes" : "Add year"}
        isSubmitting={c.isSubmitting}
        onSubmit={c.submit}
      >
        <TextField form={c.form} name="name" label="Name" placeholder="2026-27" autoFocus />
        <div className="grid grid-cols-2 gap-4">
          <DateField form={c.form} name="startDate" label="Starts" />
          <DateField form={c.form} name="endDate" label="Ends" />
        </div>
        {!c.dialog?.year && (
          <label className="flex items-center gap-3 text-sm text-gray-700">
            <Switch
              checked={c.form.watch("isCurrent")}
              onCheckedChange={(checked) => c.form.setValue("isCurrent", checked)}
            />
            Make this the current year
          </label>
        )}
      </FormDialog>

      <RolloverDialog
        organizationId={organizationId}
        years={c.items}
        sourceYear={c.rolloverFrom}
        onClose={c.closeRollover}
      />

      <DeleteConfirmationDialog
        open={!!c.pending}
        onClose={c.closePending}
        onConfirm={c.confirm}
        isLoading={c.isUpdating}
        tone={c.pending?.action === "close" ? "danger" : "neutral"}
        title={c.pending ? ACTION_COPY[c.pending.action].title(c.pending.year.name) : ""}
        description={c.pending ? ACTION_COPY[c.pending.action].description : ""}
        confirmLabel={c.pending ? ACTION_COPY[c.pending.action].confirm : ""}
      />
    </div>
  );
};

export default YearsTab;
