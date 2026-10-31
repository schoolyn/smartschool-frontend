import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { countLabel, ItemLabel } from "@/shared/ui/data-table";
import FormDialog from "@/shared/ui/form-dialog";
import { TextField } from "@/shared/ui/form-fields";
import { EXPORT_CAP, exportSchema, ExportFormValues } from "../model/export-dialog.schema";

export interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  // rows matching the current filters
  total: number;
  itemLabel: ItemLabel;
  isExporting: boolean;
  onExport: (count: number) => void;
}

// asks how many rows to export, up to the cap, before fetching them
const ExportDialog = ({ open, onClose, total, itemLabel, isExporting, onExport }: ExportDialogProps) => {
  const max = Math.max(1, Math.min(total, EXPORT_CAP));
  const form = useForm<ExportFormValues>({ resolver: zodResolver(exportSchema(max)), values: { count: String(max) } });

  return (
    <FormDialog
      form={form}
      open={open}
      onClose={onClose}
      title="Export to CSV"
      description={`${countLabel(total, itemLabel)} in the current filters.${
        total > EXPORT_CAP
          ? ` Up to ${EXPORT_CAP.toLocaleString("en-IN")} can be exported at a time, in the order shown.`
          : ""
      }`}
      submitLabel="Export"
      isSubmitting={isExporting}
      onSubmit={form.handleSubmit((values) => onExport(Number(values.count)))}
      className="max-w-md"
    >
      <TextField form={form} name="count" label="Rows to export" type="number" min={1} max={max} autoFocus />
    </FormDialog>
  );
};

export default ExportDialog;
