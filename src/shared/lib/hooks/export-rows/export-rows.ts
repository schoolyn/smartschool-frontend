import { useState } from "react";
import toast from "react-hot-toast";

import type { ItemLabel } from "@/shared/ui/data-table";
import { IAPIError } from "@/shared/types";

interface ExportRowsOptions {
  // rows matching the current filters
  total: number;
  itemLabel: ItemLabel;
  // downloads up to `limit` rows as CSV with the screen's filters
  download: (limit: number) => Promise<void>;
}

// Export button -> dialog asking how many rows -> one server download
const useExportRows = ({ total, itemLabel, download }: ExportRowsOptions) => {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const onExport = async (limit: number) => {
    setIsExporting(true);
    try {
      await download(limit);
      setOpen(false);
    } catch (error) {
      toast.error((error as IAPIError)?.response?.Error?.message || "The export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    openExport: () => setOpen(true),
    exportDialog: { open, onClose: () => setOpen(false), total, itemLabel, isExporting, onExport },
  };
};

export default useExportRows;
