export {
  removeStudentPhoto,
  uploadStudentPhoto,
  useNextAdmissionNumber,
  useSetAdmissionPrefix,
} from "./api/admission-service";
export { useGetStudentAttendanceHistory } from "./api/attendance-history-service";
export { useAddGuardian, useRemoveGuardian, useSetPrimaryGuardian } from "./api/guardian-service";
export { useGetEnrollmentHistory, useTransferStudent, useWithdrawStudent } from "./api/lifecycle-service";
export { useGetMyChildren } from "./api/my-children-service";
export {
  downloadStudentsCsv,
  useAddStudent,
  useBulkImportStudents,
  useDeleteStudent,
  useGetParentByEmail,
  useGetStudentById,
  useGetStudentDetails,
  useReinviteParent,
  useUpdateStudentDetail,
} from "./api/student-service";
export type { IBulkImportResult, IStudentDetailResponse } from "./api/student-service";
export type { IAddGuardianValue, IAdmissionPerson, IPostalAddress, IStudentFormData } from "./model/types";
