import { PlusIcon } from "@heroicons/react/20/solid";

import CustomSelectDropdown from "@/shared/ui/custom-select";
import DataTable from "@/shared/ui/data-table";
import DeleteConfirmationDialog from "@/shared/ui/delete-confirmation-dialog";
import { ExportDialog } from "@/features/export-dialog";
import SectionHeader from "@/shared/ui/section-header";
import { Button } from "@/shared/ui/kit/button";
import { Label } from "@/shared/ui/kit/label";
import { SelectOption } from "@/shared/types";
import BulkUploadModal from "../student-modal/bulk-upload-modal";
import { studentColumns } from "./students-list-columns";
import useStudentsListController from "./students-list-controller";

const StudentsList = () => {
  const {
    t,
    organizationId,
    studentDetail,
    isBulkModalOpen,
    onClickBulkUpload,
    onCloseBulkModal,
    onBulkImported,
    studentTotalCount,
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
    isLoadingGetStudentDetails,
    isDeletingStudent,
    isFetchingStudentList,
    onClickAddStudent,
    handleClassFilterChange,
    handleDeleteAction,
    handleDeleteStudent,
    handleResendInvite,
    onCancelDeleteModal,
    navigateToStudentDetails,
    onClickEditStudent,
    openExport,
    exportDialog,
    canManage,
    issueCertificate,
  } = useStudentsListController();

  const columns = studentColumns({
    t,
    open: navigateToStudentDetails,
    edit: onClickEditStudent,
    resendInvite: handleResendInvite,
    remove: handleDeleteAction,
    issueCertificate,
  });

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        title="Students"
        description="View, search and manage every enrolled student"
        action={{ label: "New Admission", icon: PlusIcon, onClick: onClickAddStudent, hidden: !canManage }}
      />

      <div>
        <DataTable
          columns={columns}
          data={studentDetail ?? []}
          getRowId={(student) => student.id}
          isLoading={isLoadingGetStudentDetails || isFetchingStudentList}
          search={{ placeholder: t("messages.search"), value: searchInput, onChange: handleSearchChange }}
          pagination={{
            page,
            pageSize,
            total: studentTotalCount ?? 0,
            onPageChange: setPage,
            onPageSizeChange: setPageSize,
          }}
          itemLabel={{ one: "student", other: "students" }}
          toolbar={
            <>
              <Label htmlFor="class-filter" className="mb-0 whitespace-nowrap">
                {t("labels.filter_by_class")}
              </Label>
              <div className="w-full sm:w-48">
                <CustomSelectDropdown
                  options={[
                    { id: "all", name: t("labels.all_classes") } as SelectOption,
                    ...CLASS_OPTIONS.map((klass) => ({ id: klass.id, name: klass.name })),
                  ]}
                  value={
                    classFilter === "all"
                      ? { id: "all", name: t("labels.all_classes") }
                      : CLASS_OPTIONS.find((k) => k.id === classFilter)
                        ? { id: classFilter, name: CLASS_OPTIONS.find((k) => k.id === classFilter)!.name }
                        : { id: "all", name: t("labels.all_classes") }
                  }
                  onChange={(o) => handleClassFilterChange(String(o.id))}
                />
              </div>
            </>
          }
          actions={[
            { label: "Export CSV", onClick: openExport, disabled: !studentTotalCount },
            { label: "Bulk Upload (CSV)", onClick: onClickBulkUpload, hidden: !canManage },
          ]}
          empty={
            searchTerm
              ? {
                  title: "No matching students",
                  description: `No student matches "${searchTerm}".`,
                  action: (
                    <Button variant="secondary" onClick={clearFilters}>
                      Clear search
                    </Button>
                  ),
                }
              : {
                  title: "No students yet",
                  description:
                    "Admit your first student with New Admission, or bring a whole class in with Bulk Upload (CSV).",
                }
          }
        />
      </div>

      <BulkUploadModal
        isOpen={isBulkModalOpen}
        organizationId={organizationId}
        onClose={onCloseBulkModal}
        onImported={onBulkImported}
      />

      <DeleteConfirmationDialog
        open={isDeleteModalOpen}
        title="Delete Student"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-medium italic text-gray-700">
              {studentDetail?.find((std) => std.id === deleteStudentId)?.name || "this student"}
            </span>
            ? This action cannot be undone.
          </>
        }
        isLoading={isDeletingStudent}
        onClose={onCancelDeleteModal}
        onConfirm={handleDeleteStudent}
      />

      <ExportDialog {...exportDialog} />
    </div>
  );
};

export default StudentsList;
