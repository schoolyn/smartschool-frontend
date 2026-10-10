import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import Spinner from "@/components/spinner";
import NoRecordFound from "@/components/no-record-found";
import CustomSelectDropdown from "@/components/custom-select";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/table";
import { SelectOption } from "@/types";
import { usePageHeader } from "@/hooks";
import SectionHeader from "@/components/section-header";
import { exportToCsv } from "@/utils";

import useStudentsListController from "./students-list-controller";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import CreateUpdateStudentModal from "../student-modal/create-update-student-modal";
import BulkUploadModal from "../student-modal/bulk-upload-modal";
import RowMenu from "@/components/row-menu";
import { studentToCsvRow } from "../student-csv";

// the parent of this student, when they were invited but have not set a password yet
const pendingParent = (student: { parentId?: unknown }) => {
  const parent = student.parentId;
  return parent && typeof parent === "object" && (parent as { status?: string }).status === "pending"
    ? (parent as { id: string })
    : null;
};

const StudentsList = () => {
  const {
    t,
    organizationId,
    form,
    studentDetail,
    isAddModalOpen,
    isBulkModalOpen,
    onClickBulkUpload,
    onCloseBulkModal,
    onBulkImported,
    currentStep,
    isParentExist,
    studentTotalCount,
    handleSearchChange,
    CLASS_OPTIONS,
    indexOfLastItem,
    indexOfFirstItem,
    currentPage,
    itemsPerPage,
    searchTerm,
    classFilter,
    isDeleteModalOpen,
    deleteStudentId,
    isLoadingAddStudent,
    isLoadingGetStudentDetails,
    isLoadingUpdateStudent,
    isDeletingStudent,
    isFetchingStudentList,
    onSubmit,
    onCloseModal,
    nextStep,
    prevStep,
    setCurrentStep,
    onClickAddStudent,
    paginate,
    setSearchTerm,
    setClassFilter,
    handleClassFilterChange,
    handleDeleteAction,
    handleDeleteStudent,
    handleResendInvite,
    onCancelDeleteModal,
    navigateToStudentDetails,
    onClickEditStudent,
  } = useStudentsListController();

  const handleExportCsv = () => {
    exportToCsv(
      "students",
      (studentDetail || []).map(studentToCsvRow)
    );
  };

  usePageHeader({
    actions: (
      <>
        <button
          onClick={handleExportCsv}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Export CSV
        </button>
        <button
          onClick={onClickBulkUpload}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Bulk Upload (CSV)
        </button>
        <button
          onClick={onClickAddStudent}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {t("labels.add_new_student")}
        </button>
      </>
    ),
  });

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader title="Students" description="View, search and manage every enrolled student" />

      {/* Search and Filter Controls */}
      <div className="flex flex-row flex-wrap justify-between items-center mb-6 gap-4">
        {/* Search field + result count */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t("messages.search")}
              onChange={(e) => {
                e.preventDefault();
                handleSearchChange(e.target.value);
              }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          {studentTotalCount !== undefined && studentTotalCount > 0 && (
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {studentTotalCount} {t("labels.records")}
            </span>
          )}
        </div>

        {/* Class filter */}
        <div className="flex items-center gap-3">
          <label htmlFor="class-filter" className="block text-sm font-medium text-gray-700 whitespace-nowrap">
            {t("labels.filter_by_class")}
          </label>
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
        </div>
      </div>

      <div className="py-4">
        {isLoadingGetStudentDetails ? (
          <div className="bg-white shadow rounded-lg border border-gray-200">
            <Spinner />
          </div>
        ) : (
          <>
            {/* Students Table */}
            <Table>
              <TableHeader>
                <TableHead>{t("labels.student_name")}</TableHead>
                <TableHead className="text-center">{t("labels.roll_number")}</TableHead>
                <TableHead className="text-center">{t("labels.class_id")}</TableHead>
                <TableHead className="text-center">{t("labels.date_of_birth")}</TableHead>
                <TableHead className="text-center">{t("labels.actions")}</TableHead>
              </TableHeader>
              {isFetchingStudentList ? (
                <TableBody>
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center">
                      <div className="flex justify-center items-center">
                        <div className="h-8 w-8 border-t-2 border-b-2 border-primary-500 rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                </TableBody>
              ) : studentDetail && studentDetail.length > 0 ? (
                <TableBody>
                  {studentDetail.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-600 font-medium">{student.name.charAt(0)}</span>
                          </div>
                          <div className="ml-4">
                            <div
                              className="text-sm font-medium text-gray-900 hover:text-primary-600 cursor-pointer"
                              onClick={() => navigateToStudentDetails(student.id)}
                            >
                              {student.name}
                            </div>
                            {pendingParent(student) && (
                              <span className="mt-0.5 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                {t("labels.invite_pending")}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{student.currentEnrollment?.rollNumber}</TableCell>
                      <TableCell className="text-center">
                        {student.currentEnrollment?.classId?.name}
                        {student.currentEnrollment?.sectionId?.name
                          ? ` - ${student.currentEnrollment.sectionId.name}`
                          : ""}
                      </TableCell>
                      <TableCell className="text-center">
                        {new Date(student.dateOfBirth).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <RowMenu
                          items={[
                            { label: t("buttons.edit"), onSelect: () => onClickEditStudent(student.id) },
                            ...(pendingParent(student)
                              ? [{ label: t("buttons.resend_invite"), onSelect: () => handleResendInvite(pendingParent(student)!.id) }]
                              : []),
                            { label: t("buttons.delete"), onSelect: () => handleDeleteAction(student.id), danger: true },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <TableBody>
                  <tr>
                    <td colSpan={5}>
                      <NoRecordFound
                        t={t}
                        searchTerm={searchTerm}
                        clearFilters={() => {
                          setSearchTerm("");
                          setClassFilter("all");
                        }}
                      />
                    </td>
                  </tr>
                </TableBody>
              )}
            </Table>

            {/* Pagination */}
            {studentDetail && studentDetail.length > 10 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      {t("labels.showing")}
                      <span className="font-medium">{indexOfFirstItem + 1}</span>
                      {t("labels.to")}
                      <span className="font-medium">{Math.min(indexOfLastItem, studentDetail.length)}</span>
                      {t("labels.of")}
                      <span className="font-medium">{studentDetail.length}</span>
                      {t("labels.results")}
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                          currentPage === 1 ? "cursor-not-allowed" : "hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">{t("labels.previous")}</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path
                            fillRule="evenodd"
                            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {/* Page numbers */}
                      {Array.from({
                        length: Math.ceil(studentDetail.length / itemsPerPage),
                      }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => paginate(index + 1)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            currentPage === index + 1
                              ? "bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}

                      <button
                        onClick={() =>
                          paginate(Math.min(Math.ceil(studentDetail.length / itemsPerPage), currentPage + 1))
                        }
                        disabled={currentPage === Math.ceil(studentDetail.length / itemsPerPage)}
                        className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                          currentPage === Math.ceil(studentDetail.length / itemsPerPage)
                            ? "cursor-not-allowed"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">{t("labels.next")}</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path
                            fillRule="evenodd"
                            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Student Modal */}
      <CreateUpdateStudentModal
        t={t}
        isOpen={isAddModalOpen}
        organizationId={organizationId}
        form={form}
        isEditStudent={false}
        currentStep={currentStep}
        isParentExist={isParentExist}
        isLoadingAddStudent={isLoadingAddStudent}
        isLoadingUpdateStudent={isLoadingUpdateStudent}
        nextStep={nextStep}
        prevStep={prevStep}
        onClose={onCloseModal}
        onSubmit={onSubmit}
        setCurrentStep={setCurrentStep}
      />

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
    </div>
  );
};

export default StudentsList;
