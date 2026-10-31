import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

import Avatar from "@/shared/ui/avatar";
import DataTable from "@/shared/ui/data-table";
import DatePicker from "@/shared/ui/date-picker";
import DeleteConfirmationDialog from "@/shared/ui/delete-confirmation-dialog";
import EmptyState from "@/shared/ui/empty-state";
import PageLoader from "@/shared/ui/page-loader";
import { Button } from "@/shared/ui/kit/button";
import { usePageHeader } from "@/shared/lib/hooks";
import { formatDate } from "@/shared/lib";
import { IAdmissionPerson, IPostalAddress } from "@/entities/student";
import { SelectOption } from "@/shared/types";
import { CATEGORY_OPTIONS, GENDER_OPTIONS } from "../student-form/student-form.schema";
import DetailCard from "./components/detail-card";
import GuardianModal from "./guardian-modal";
import { attendanceRecordColumns, examResultColumns } from "./student-details-columns";
import useStudentDetailController from "./student-detail-controller";

const enrollmentStatusBadgeClass: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  PROMOTED: "bg-primary-100 text-primary-800",
  DETAINED: "bg-amber-100 text-amber-800",
  TRANSFERRED: "bg-gray-100 text-gray-600",
  WITHDRAWN: "bg-red-100 text-red-800",
  PASSED_OUT: "bg-primary-100 text-primary-800",
};

const labelOf = (options: SelectOption[], id?: string) => options.find((option) => option.id === id)?.name;

// only the last four digits are shown on screen
const maskAadhaar = (aadhaar?: string) => (aadhaar ? `XXXX XXXX ${aadhaar.slice(-4)}` : undefined);

const personLine = (person?: IAdmissionPerson) =>
  [person?.name, person?.phone, person?.email, person?.occupation].filter(Boolean).join(" · ");

const addressLine = (place?: IPostalAddress) =>
  [place?.address, place?.city, place?.state, place?.pincode].filter(Boolean).join(", ");

const StudentDetails = () => {
  const {
    isDeleteModalOpen,
    isGuardianModalOpen,
    setIsGuardianModalOpen,
    studentDetails,
    isLoadingStudentDetail,
    isErrorStudentDetail,
    onBackClick,
    setIsDeleteModalOpen,
    isDeletingStudent,
    handleDeleteStudent,
    addGuardian,
    handleSetPrimaryGuardian,
    handleRemoveGuardian,
    guardianIdPendingRemoval,
    isRemovingGuardian,
    cancelRemoveGuardian,
    confirmRemoveGuardian,
    enrollmentHistory,
    isLoadingEnrollmentHistory,
    isTransferModalOpen,
    setIsTransferModalOpen,
    isWithdrawModalOpen,
    setIsWithdrawModalOpen,
    confirmTransfer,
    confirmWithdraw,
    isTransferring,
    isWithdrawing,
    attendanceSummary,
    attendanceRecords,
    isLoadingAttendance,
    attendanceFrom,
    setAttendanceFrom,
    attendanceTo,
    setAttendanceTo,
    examResults,
    isLoadingExamResults,
    canManage,
    editStudent,
  } = useStudentDetailController();

  const enrollmentLabel = [
    studentDetails?.currentEnrollment?.classId?.name,
    studentDetails?.currentEnrollment?.sectionId?.name,
  ]
    .filter(Boolean)
    .join(" - ");

  usePageHeader({ title: "Student Profile", onBack: onBackClick });

  return (
    <>
      {isLoadingStudentDetail ? (
        <PageLoader />
      ) : isErrorStudentDetail ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Student not found</h2>
          <button
            onClick={onBackClick}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Back to Students
          </button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-5 shadow">
            <div className="flex items-center gap-4">
              {studentDetails?.photoUrl ? (
                <img
                  src={studentDetails.photoUrl}
                  alt={studentDetails.name}
                  className="h-24 w-20 rounded-lg object-cover"
                />
              ) : (
                <Avatar name={studentDetails?.name || ""} size={72} />
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{studentDetails?.name}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {[
                    enrollmentLabel,
                    studentDetails?.admissionNumber && `Adm. no. ${studentDetails.admissionNumber}`,
                    studentDetails?.status,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </div>
            {canManage && (
              <div className="flex gap-3">
                <Button variant="secondary" onClick={editStudent}>
                  <PencilIcon className="h-4 w-4" />
                  Edit details
                </Button>
                <Button variant="secondary" className="text-red-700" onClick={() => setIsDeleteModalOpen(true)}>
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DetailCard
              title="Personal"
              items={[
                {
                  label: "Date of birth",
                  value: studentDetails?.dateOfBirth && formatDate(studentDetails.dateOfBirth),
                },
                { label: "Gender", value: labelOf(GENDER_OPTIONS, studentDetails?.gender) },
                { label: "Blood group", value: studentDetails?.bloodGroup },
                { label: "Aadhaar", value: maskAadhaar(studentDetails?.aadhaarNumber) },
                { label: "Category", value: labelOf(CATEGORY_OPTIONS, studentDetails?.category) },
                { label: "Religion", value: studentDetails?.religion },
                { label: "Mother tongue", value: studentDetails?.motherTongue },
                { label: "Nationality", value: studentDetails?.nationality },
              ]}
            />
            <DetailCard
              title="Admission"
              items={[
                { label: "Admission number", value: studentDetails?.admissionNumber },
                {
                  label: "Admission date",
                  value: studentDetails?.admissionDate && formatDate(studentDetails.admissionDate),
                },
                { label: "Class", value: enrollmentLabel },
                { label: "Roll number", value: studentDetails?.currentEnrollment?.rollNumber },
                { label: "Previous school", value: studentDetails?.previousSchool?.name },
                {
                  label: "Last class / TC no.",
                  value: [studentDetails?.previousSchool?.lastClass, studentDetails?.previousSchool?.tcNumber]
                    .filter(Boolean)
                    .join(" / "),
                },
              ]}
            />
            <DetailCard
              title="Family"
              items={[
                { label: "Father", value: personLine(studentDetails?.father) },
                { label: "Mother", value: personLine(studentDetails?.mother) },
              ]}
            />
            <DetailCard
              title="Address"
              items={[
                {
                  label: "Current",
                  value: addressLine({
                    address: studentDetails?.address,
                    city: studentDetails?.city,
                    state: studentDetails?.state,
                    pincode: studentDetails?.pincode,
                  }),
                },
                { label: "Permanent", value: addressLine(studentDetails?.permanentAddress) },
              ]}
            />
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Guardians</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Parents and guardians linked to this student.</p>
              </div>
              {canManage && (
                <Button variant="secondary" size="sm" onClick={() => setIsGuardianModalOpen(true)}>
                  + Add Guardian
                </Button>
              )}
            </div>
            <div className="border-t border-gray-200 divide-y divide-gray-200">
              {!studentDetails?.guardians?.length ? (
                <EmptyState compact title="No guardians linked yet" />
              ) : (
                studentDetails.guardians.map((g) => (
                  <div key={g.id} className="px-4 py-4 sm:px-6 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {g.parentUserId?.name}{" "}
                        <span className="text-xs font-normal text-gray-500 capitalize">
                          ({g.relationshipType.toLowerCase()})
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {g.parentUserId?.email} {g.parentUserId?.phoneNumber ? `· ${g.parentUserId.phoneNumber}` : ""}
                      </p>
                      <div className="mt-1 flex gap-2">
                        {g.isPrimaryGuardian && (
                          <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded-full">
                            Primary
                          </span>
                        )}
                        {g.isEmergencyContact && (
                          <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded-full">
                            Emergency contact
                          </span>
                        )}
                        {g.canPickup && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                            Can pick up
                          </span>
                        )}
                      </div>
                    </div>
                    {canManage && (
                      <div className="flex gap-3">
                        {!g.isPrimaryGuardian && (
                          <button
                            onClick={() => handleSetPrimaryGuardian(g.id)}
                            className="text-sm text-primary-600 hover:text-primary-800"
                          >
                            Set as primary
                          </button>
                        )}
                        {!g.isPrimaryGuardian && (
                          <button
                            onClick={() => handleRemoveGuardian(g.id)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {canManage && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Enrollment Lifecycle</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Transfer, withdraw, and year-over-year enrollment history.
                  </p>
                </div>
                {studentDetails?.status === "active" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsTransferModalOpen(true)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Transfer
                    </button>
                    <button
                      onClick={() => setIsWithdrawModalOpen(true)}
                      className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      Withdraw
                    </button>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 divide-y divide-gray-200">
                {isLoadingEnrollmentHistory ? (
                  <p className="px-4 py-5 text-sm text-gray-500">Loading history...</p>
                ) : enrollmentHistory.length === 0 ? (
                  <EmptyState compact title="No enrollment history yet" />
                ) : (
                  enrollmentHistory.map((entry) => (
                    <div key={entry.id} className="px-4 py-4 sm:px-6 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {entry.academicYearId?.name || "-"} - {entry.classId?.name || "-"}
                          {entry.sectionId?.name ? ` - ${entry.sectionId.name}` : ""}
                          <span
                            className={`ml-2 inline-block px-2 py-0.5 text-xs rounded-full capitalize ${enrollmentStatusBadgeClass[entry.status]}`}
                          >
                            {entry.status.toLowerCase()}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Roll No. {entry.rollNumber} · Joined {new Date(entry.joinedOn).toLocaleDateString()}
                          {entry.leftOn ? ` · Left ${new Date(entry.leftOn).toLocaleDateString()}` : ""}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Academic Records</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Exam results and attendance, from the school's real records.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5">
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Current Enrollment</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Class</p>
                    <p className="font-medium">
                      {studentDetails?.currentEnrollment?.classId?.name || "-"}
                      {studentDetails?.currentEnrollment?.sectionId?.name
                        ? ` - ${studentDetails.currentEnrollment.sectionId.name}`
                        : ""}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Roll Number</p>
                    <p className="font-medium">{studentDetails?.currentEnrollment?.rollNumber || "-"}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-medium capitalize">{studentDetails?.status || "-"}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Exams Published</p>
                    <p className="font-medium">{examResults.length}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Exam Results</h4>
                <DataTable
                  columns={examResultColumns}
                  data={examResults}
                  getRowId={(result) => result.id}
                  isLoading={isLoadingExamResults}
                  empty={{ title: "No published exam results yet" }}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-medium text-gray-900">Attendance</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <DatePicker
                      value={attendanceFrom}
                      onChange={setAttendanceFrom}
                      placeholder="From"
                      className="w-40"
                    />
                    <span className="text-gray-400">to</span>
                    <DatePicker
                      value={attendanceTo}
                      onChange={setAttendanceTo}
                      min={attendanceFrom || undefined}
                      placeholder="To"
                      className="w-40"
                    />
                  </div>
                </div>
                {isLoadingAttendance ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : !attendanceSummary || attendanceSummary.total === 0 ? (
                  <EmptyState compact title="No attendance recorded yet" />
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-500">Total Marked Days</p>
                      <p className="font-medium">{attendanceSummary.total}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-500">Present Days</p>
                      <p className="font-medium">{attendanceSummary.present}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-500">Absent Days</p>
                      <p className="font-medium">{attendanceSummary.absent}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-500">Attendance %</p>
                      <p className="font-medium">
                        {((attendanceSummary.present / attendanceSummary.total) * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                )}

                {attendanceRecords.length > 0 && (
                  <div className="mt-4 max-h-64 overflow-y-auto">
                    <DataTable
                      columns={attendanceRecordColumns}
                      data={attendanceRecords}
                      getRowId={(record) => record.id}
                      empty={{ title: "No attendance recorded yet" }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <DeleteConfirmationDialog
            open={isDeleteModalOpen}
            title="Delete Student"
            description={
              <>
                Are you sure you want to delete{" "}
                <span className="font-medium italic text-gray-700">{studentDetails?.name || "this student"}</span>? This
                action cannot be undone.
              </>
            }
            isLoading={isDeletingStudent}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteStudent}
          />

          <DeleteConfirmationDialog
            open={!!guardianIdPendingRemoval}
            title="Remove Guardian"
            description="Are you sure you want to remove this guardian from the student? This action cannot be undone."
            confirmLabel="Remove"
            isLoading={isRemovingGuardian}
            onClose={cancelRemoveGuardian}
            onConfirm={confirmRemoveGuardian}
          />

          <DeleteConfirmationDialog
            open={isTransferModalOpen}
            title="Transfer Student"
            description="This marks the student as transferred out and closes their current enrollment. This action cannot be undone from here."
            confirmLabel="Transfer"
            isLoading={isTransferring}
            onClose={() => setIsTransferModalOpen(false)}
            onConfirm={confirmTransfer}
          />

          <DeleteConfirmationDialog
            open={isWithdrawModalOpen}
            title="Withdraw Student"
            description="This marks the student as withdrawn and closes their current enrollment. This action cannot be undone from here."
            confirmLabel="Withdraw"
            isLoading={isWithdrawing}
            onClose={() => setIsWithdrawModalOpen(false)}
            onConfirm={confirmWithdraw}
          />

          <GuardianModal
            isOpen={isGuardianModalOpen}
            isSubmitting={addGuardian.isPending}
            onClose={() => setIsGuardianModalOpen(false)}
            onSubmit={(value) => addGuardian.mutate(value)}
          />
        </div>
      )}
    </>
  );
};

export default StudentDetails;
