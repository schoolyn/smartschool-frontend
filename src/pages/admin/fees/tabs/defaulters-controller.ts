import { useCallback, useMemo, useState } from "react";

import type { AcademicFilterValue } from "@/features/academic-filter";
import { useExportRows, usePaging } from "@/shared/lib/hooks";
import { todayInIndia } from "@/shared/lib";
import { downloadDefaultersCsv, useGetFeeDefaulters } from "@/entities/fee";

const useDefaultersController = (organizationId: string) => {
  const [scope, setScope] = useState<AcademicFilterValue>({ academicYearId: "", classId: "", sectionId: "" });
  const [asOf, setAsOf] = useState(todayInIndia());
  const { page, pageSize, setPage, setPageSize, resetPage } = usePaging();

  const filters = useMemo(
    () => ({
      academicYearId: scope.academicYearId || undefined,
      classId: scope.classId || undefined,
      sectionId: scope.sectionId || undefined,
      asOf: asOf || undefined,
    }),
    [scope, asOf]
  );
  const report = useGetFeeDefaulters(organizationId, filters, page, pageSize);
  const total = report.data?.pagination.totalItems ?? 0;

  const onScopeChange = useCallback(
    (next: AcademicFilterValue) => {
      setScope(next);
      resetPage();
    },
    [resetPage]
  );

  const onAsOfChange = (value: string) => {
    setAsOf(value);
    resetPage();
  };

  const { openExport, exportDialog } = useExportRows({
    total,
    itemLabel: { one: "defaulter", other: "defaulters" },
    download: (limit) => downloadDefaultersCsv(organizationId, filters, limit),
  });

  return {
    scope,
    asOf,
    onScopeChange,
    onAsOfChange,
    rows: report.data?.rows ?? [],
    summary: report.data?.summary,
    // no year picked yet means the filter is still loading its default
    isLoading: report.isLoading || !scope.academicYearId,
    isError: report.isError,
    error: report.error,
    retry: () => report.refetch(),
    pagination: { page, pageSize, total, onPageChange: setPage, onPageSizeChange: setPageSize },
    openExport,
    exportDialog,
  };
};

export default useDefaultersController;
