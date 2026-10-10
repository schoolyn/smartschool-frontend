import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import EmptyState from "@/components/empty-state";
import FormDialog from "@/components/form-dialog";
import RowMenu, { RowMenuItem } from "@/components/row-menu";
import Spinner from "@/components/spinner";
import StatusBadge from "@/components/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Switch } from "@/components/ui/switch";
import { useMutationFeedback } from "@/hooks";
import { IAcademicYear } from "@/types";
import { useCreateAcademicYear, useGetAcademicYears, useUpdateAcademicYear } from "../service/academics-service";
import { defaultYearFormValues, yearFormSchema, YearFormValues } from "../classes.schema";
import { TextField } from "../components/form-fields";
import Toolbar, { PrimaryButton } from "../components/toolbar";

type YearAction = "current" | "close" | "reopen";

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

const formatDate = (value: string) => new Date(value).toLocaleDateString();

const YearsTab = ({ organizationId }: { organizationId: string }) => {
  const years = useGetAcademicYears(organizationId);
  const createYear = useCreateAcademicYear(organizationId);
  const updateYear = useUpdateAcademicYear(organizationId);

  const [dialog, setDialog] = useState<{ year?: IAcademicYear } | null>(null);
  const [pending, setPending] = useState<{ action: YearAction; year: IAcademicYear } | null>(null);

  const form = useForm<YearFormValues>({ resolver: zodResolver(yearFormSchema), defaultValues: defaultYearFormValues });

  useEffect(() => {
    if (!dialog) return;
    const year = dialog.year;
    form.reset(
      year
        ? {
            name: year.name,
            startDate: year.startDate.slice(0, 10),
            endDate: year.endDate.slice(0, 10),
            isCurrent: year.isCurrent,
          }
        : defaultYearFormValues,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog]);

  const closeAll = () => {
    setDialog(null);
    setPending(null);
  };

  useMutationFeedback(createYear, "Academic year created", closeAll);
  useMutationFeedback(updateYear, "Academic year updated", closeAll);

  const submit = form.handleSubmit((values) => {
    if (dialog?.year) {
      updateYear.mutate({
        id: dialog.year.id,
        name: values.name,
        startDate: values.startDate,
        endDate: values.endDate,
      });
    } else {
      createYear.mutate(values);
    }
  });

  const confirm = () => {
    if (!pending) return;
    const { action, year } = pending;
    updateYear.mutate(
      action === "current"
        ? { id: year.id, isCurrent: true }
        : { id: year.id, status: action === "close" ? "closed" : "active" },
    );
  };

  const menuFor = (year: IAcademicYear): RowMenuItem[] => [
    { label: "Edit", onSelect: () => setDialog({ year }) },
    ...(!year.isCurrent && year.status !== "closed"
      ? [{ label: "Set as current", onSelect: () => setPending({ action: "current" as const, year }) }]
      : []),
    ...(!year.isCurrent && year.status !== "closed"
      ? [{ label: "Close year", onSelect: () => setPending({ action: "close" as const, year }), danger: true }]
      : []),
    ...(year.status === "closed"
      ? [{ label: "Reopen year", onSelect: () => setPending({ action: "reopen" as const, year }) }]
      : []),
  ];

  const items = years.data?.items ?? [];
  const addButton = <PrimaryButton onClick={() => setDialog({})}>+ Add academic year</PrimaryButton>;

  return (
    <div className="rounded-lg bg-white shadow">
      <Toolbar title="Academic years">{items.length > 0 && addButton}</Toolbar>

      {years.isLoading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState
          title="No academic years yet"
          description="Everything else (classes, subjects, students) belongs to an academic year, so start by adding the current one."
          action={addButton}
        />
      ) : (
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableHead>Year</TableHead>
              <TableHead>Starts</TableHead>
              <TableHead>Ends</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableHeader>
            <TableBody>
              {items.map((year) => (
                <TableRow key={year.id}>
                  <TableCell className="font-medium text-gray-900">{year.name}</TableCell>
                  <TableCell>{formatDate(year.startDate)}</TableCell>
                  <TableCell>{formatDate(year.endDate)}</TableCell>
                  <TableCell>
                    <StatusBadge status={year.isCurrent ? "current" : year.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <RowMenu items={menuFor(year)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <FormDialog
        form={form}
        open={!!dialog}
        onClose={() => setDialog(null)}
        title={dialog?.year ? "Edit academic year" : "Add academic year"}
        description={dialog?.year ? undefined : "For example 2026-27, running from April to March."}
        submitLabel={dialog?.year ? "Save changes" : "Add year"}
        isSubmitting={createYear.isPending || updateYear.isPending}
        onSubmit={submit}
      >
        <TextField form={form} name="name" label="Name" placeholder="2026-27" autoFocus />
        <div className="grid grid-cols-2 gap-4">
          <TextField form={form} name="startDate" label="Starts" type="date" />
          <TextField form={form} name="endDate" label="Ends" type="date" />
        </div>
        {!dialog?.year && (
          <label className="flex items-center gap-3 text-sm text-gray-700">
            <Switch
              checked={form.watch("isCurrent")}
              onCheckedChange={(checked) => form.setValue("isCurrent", checked)}
            />
            Make this the current year
          </label>
        )}
      </FormDialog>

      <DeleteConfirmationDialog
        open={!!pending}
        onClose={() => setPending(null)}
        onConfirm={confirm}
        isLoading={updateYear.isPending}
        tone={pending?.action === "close" ? "danger" : "neutral"}
        title={pending ? ACTION_COPY[pending.action].title(pending.year.name) : ""}
        description={pending ? ACTION_COPY[pending.action].description : ""}
        confirmLabel={pending ? ACTION_COPY[pending.action].confirm : ""}
      />
    </div>
  );
};

export default YearsTab;
