import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import debounce from "lodash.debounce";
import toast from "react-hot-toast";

import { useDeleteStudent, useGetStudentDetails, useReinviteParent } from "@/entities/student";
import { useNavigate, useParams } from "react-router-dom";
import { downloadStudentsCsv } from "@/entities/student";
import { useError, useExportRows, usePaging } from "@/shared/lib/hooks";
import { useGetAcademicYears, useGetClasses } from "@/entities/academics";
import { useAreaBase, useCan, useHasModule } from "@/entities/session";

export type StudentListRow = NonNullable<ReturnType<typeof useGetStudentDetails>["data"]>["rows"][number];

const useStudentsListController = () => {
  const { t } = useTranslation();
  const { organizationId } = useParams();
  const areaBase = useAreaBase();
  const navigate = useNavigate();

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const { page, pageSize, setPage, setPageSize, resetPage } = usePaging();
  // what is typed shows at once; the search runs half a second after typing stops
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [deleteStudentId, setDeleteStudentId] = useState<string>("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const navigateToStudentDetails = (studentId: string) => {
    navigate(`${areaBase}/students/detail/${studentId}`);
  };

  const onClickEditStudent = (studentId: string) => navigate(`${areaBase}/students/edit/${studentId}`);

  const runSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
        resetPage();
      }, 500),
    [resetPage]
  );
  useEffect(() => () => runSearch.cancel(), [runSearch]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    runSearch(value);
  };

  const clearFilters = () => {
    runSearch.cancel();
    setSearchInput("");
    setSearchTerm("");
    setClassFilter("all");
    resetPage();
  };

  const handleClassFilterChange = (classId: string) => {
    setClassFilter(classId);
    resetPage();
  };

  const academicYears = useGetAcademicYears(organizationId || "");
  const currentAcademicYearId =
    academicYears.data?.items.find((y) => y.isCurrent)?.id || academicYears.data?.items[0]?.id || "";
  const classesForFilter = useGetClasses(organizationId || "", currentAcademicYearId, "active");
  const CLASS_OPTIONS = classesForFilter.data?.items || [];

  const getStudentDetails = useGetStudentDetails(organizationId || "", classFilter, searchTerm, pageSize, page);

  const { openExport, exportDialog } = useExportRows({
    total: getStudentDetails.data?.pagination.totalItems ?? 0,
    itemLabel: { one: "student", other: "students" },
    download: (limit) => downloadStudentsCsv(organizationId || "", classFilter, searchTerm, limit),
  });

  const can = useCan();
  const hasModule = useHasModule();
  const canManage = can("students.manage");
  const canIssueCertificates = can("certificates.issue") && hasModule("certificates");
  const issueCertificate = canIssueCertificates
    ? (studentId: string) => navigate(`${areaBase}/certificates/issue/${studentId}`)
    : undefined;

  const deleteStudent = useDeleteStudent(organizationId || "");
  const reinviteParent = useReinviteParent();

  useError({ mutation: reinviteParent });

  useError({
    mutation: deleteStudent,
    cb: () => {
      setIsDeleteModalOpen(false);
      setDeleteStudentId("");
    },
  });

  const onClickAddStudent = () => navigate(`${areaBase}/admissions`);

  const onClickBulkUpload = () => {
    setIsBulkModalOpen(true);
  };

  const onCloseBulkModal = () => {
    setIsBulkModalOpen(false);
  };

  const onBulkImported = () => {
    getStudentDetails.refetch();
  };

  const handleDeleteAction = (studentId: string) => {
    setDeleteStudentId(studentId);
    setIsDeleteModalOpen(true);
  };

  const onCancelDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteStudentId("");
  };

  const handleResendInvite = (parentUserId: string) => {
    reinviteParent.mutate(parentUserId, { onSuccess: () => toast.success(t("messages.invite_resent")) });
  };

  const handleDeleteStudent = () => {
    if (!deleteStudentId) return;
    deleteStudent.mutate(deleteStudentId);
  };

  useEffect(() => {
    if (deleteStudent.isSuccess) {
      setIsDeleteModalOpen(false);
      setDeleteStudentId("");
      clearFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteStudent.isSuccess]);

  return {
    t,
    organizationId: organizationId || "",
    isBulkModalOpen,
    onClickBulkUpload,
    onCloseBulkModal,
    onBulkImported,
    handleSearchChange,
    searchInput,
    clearFilters,
    CLASS_OPTIONS,
    page,
    pageSize,
    setPage,
    setPageSize,
    searchTerm,
    classFilter,
    isDeleteModalOpen,
    deleteStudentId,
    studentDetail: getStudentDetails?.data?.rows,
    studentTotalCount: getStudentDetails?.data?.pagination.totalItems,
    isLoadingGetStudentDetails: getStudentDetails.isLoading,
    isDeletingStudent: deleteStudent.isPending,
    isFetchingStudentList: getStudentDetails.isFetching,
    onClickAddStudent,
    setSearchTerm,
    handleClassFilterChange,
    handleDeleteAction,
    handleDeleteStudent,
    handleResendInvite,
    onCancelDeleteModal,
    setClassFilter,
    navigateToStudentDetails,
    onClickEditStudent,
    openExport,
    exportDialog,
    canManage,
    issueCertificate,
  };
};

export default useStudentsListController;
