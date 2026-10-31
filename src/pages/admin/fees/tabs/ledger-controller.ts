import { useCan } from "@/entities/session";
import { useError, useExportRows, usePaging } from "@/shared/lib/hooks";
import {
  downloadLedgerCsv,
  useDownloadFeeReceipt,
  useGetOnlinePaymentsForReview,
  useGetPaymentLedger,
} from "@/entities/fee";

const useLedgerController = (organizationId: string) => {
  const { page, pageSize, setPage, setPageSize } = usePaging();
  const ledger = useGetPaymentLedger(organizationId, page, pageSize);
  const toReview = useGetOnlinePaymentsForReview(useCan()("fees.collect") ? organizationId : "").data ?? [];
  const total = ledger.data?.pagination.totalItems ?? 0;
  const downloadReceipt = useDownloadFeeReceipt(organizationId);
  useError({ mutation: downloadReceipt });

  const { openExport, exportDialog } = useExportRows({
    total,
    itemLabel: { one: "payment", other: "payments" },
    download: (limit) => downloadLedgerCsv(organizationId, limit),
  });

  return {
    toReview,
    payments: ledger.data?.rows ?? [],
    isLoading: ledger.isLoading,
    error: ledger.isError ? ledger.error : null,
    retry: () => ledger.refetch(),
    pagination: { page, pageSize, total, onPageChange: setPage, onPageSizeChange: setPageSize },
    openExport,
    exportDialog,
    downloadReceipt: (paymentId: string) => downloadReceipt.mutate(paymentId),
    downloadingId: downloadReceipt.isPending ? downloadReceipt.variables : undefined,
  };
};

export default useLedgerController;
