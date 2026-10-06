import { ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";

export type NoticeAudienceScope = "SCHOOL" | "ROLE" | "CLASS" | "SECTION";

export interface INoticeAudience {
  scope: NoticeAudienceScope;
  roles: string[];
  classIds: string[];
  sectionIds: string[];
}

export interface INotice {
  id: string;
  title: string;
  content: string;
  date: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  attachmentURL: string;
  audience?: INoticeAudience;
  pinned?: boolean;
}

export interface INotification {
  id: string;
  type: string;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  readAt: string | null;
  createdAt: string;
}

export interface ICreateNoticeRequest {
  title: string;
  content: string;
  type: string;
  date?: string;
  attachment?: File | null;
  audience?: INoticeAudience;
}

export interface IHomework {
  id: string;
  title: string;
  description: string;
  classId: { id: string; name: string } | string;
  sectionId: { id: string; name: string } | string;
  subjectId: { id: string; name: string; code: string } | string;
  assignedDate: string;
  dueDate: string;
  status: string;
  attachmentURL: string | null;
  createdAt: string;
}

export interface ILeaveRequest {
  id: string;
  studentId: { id: string; name: string } | string;
  requestedByUserId: { id: string; name: string; email: string } | string;
  classId: string;
  sectionId: string;
  fromDate: string;
  toDate: string;
  reason: string;
  attachmentURL: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  decidedBy?: string;
  decisionNote?: string;
  decidedAt?: string;
  createdAt: string;
}

// Report Types
export interface IReport {
  id: string;
  studentId: string;
  academicYear: string;
  term: string;
  subjects: {
    name: string;
    grade: string;
    remarks: string;
  }[];
  overallRemarks: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateReportRequest {
  studentId: string;
  academicYear: string;
  term: string;
  subjects: {
    name: string;
    grade: string;
    remarks: string;
  }[];
  overallRemarks: string;
}

// Fee Types
export interface IFee {
  id: string;
  studentId: string;
  amount: number;
  dueDate: string;
  status: "pending" | "paid" | "overdue";
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateFeeRequest {
  studentId: string;
  amount: number;
  dueDate: string;
  description: string;
}

// Student Types
export interface IStudent {
  id: string;
  name: string;
  classId: string;
  rollNumber: string;
  parentId: string;
  dateOfBirth: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateStudentRequest {
  name: string;
  classId: string;
  rollNumber: string;
  parentId: string;
  dateOfBirth: string;
}

export interface IAxiosResponse<T> {
  data: { Data: T; Status: string };
}

export interface IAPIError {
  response: {
    Status: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
    Error?: {
      message: string;
      name: string;
      code?: string;
      errorCode?: string;
    };
  };
  status: number;
}

export interface IForgetPasswordRequest {
  email: string;
  captcha_token: string | null;
}

export interface ILoginResponse {
  id: string;
  email: string;
  token: string;
  refreshToken?: string;
  name: string;
  role: "admin" | "parent" | "teacher";
  isPlatformAdmin?: boolean;
  permissions: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    isGlobalAdmin: boolean;
  };
  preferences?: IUserPreferences;
  avatar?: IUserAvatar;
}

export interface IForgotPassword {
  email: string;
}

export interface IAddUser {
  id: number;
  username: string;
  email: string;
  role: "admin" | "parent" | "teacher";
}

export interface IAddUserValue {
  name: string;
  email: string;
  role: string;
  permissions: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export interface IAllUserDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  permissions: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export interface FormData {
  fullname: string;
  email: string;
  role: "admin" | "parent" | "teacher";
  permissions: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export interface RoleOption {
  value: "admin" | "parent" | "teacher";
  label: string;
  description: string;
  icon: ReactNode;
}

export interface PermissionOption {
  id: keyof FormData["permissions"];
  label: string;
  description: string;
  icon: ReactNode;
}

export interface ICreateUpdateUserModalProps {
  t: (key: string) => string;
  isOpen: boolean;
  form: UseFormReturn<FormData>;
  roleOptions: RoleOption[];
  permissionOptions: PermissionOption[];
  isEditUser: boolean;
  isEditingSelf?: boolean;
  isLoadingAddUserDetail: boolean;
  isLoadingUpdateUserDetail?: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  handlePermissionChange: (permission: keyof FormData["permissions"]) => void;
}

export interface EditUserModalProps {
  t: (t: string) => string;
  isOpen: boolean;
  formData: FormData;
  isLoadingUpdateUserDetail: boolean;
  roleOptions: RoleOption[];
  permissionOptions: PermissionOption[];
  onClose: () => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  handleSubmit: (e: React.FormEvent) => void;
  handlePermissionChange: (permission: keyof FormData["permissions"]) => void;
}

export interface IUpdateUserValue {
  id: string;
  name: string;
  email: string;
  role: "admin" | "parent" | "teacher";
  permissions: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export interface IUserPreferences {
  theme: "light" | "dark";
  locale: "en" | "hi";
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export interface IUserAvatar {
  publicId: string;
  url: string;
}

export interface IUserDetailResponse {
  id: string;
  email: string;
  token: string;
  role: "admin" | "parent" | "teacher";
  isPlatformAdmin?: boolean;
  permissions: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    isGlobalAdmin: boolean;
  };
  preferences?: IUserPreferences;
  avatar?: IUserAvatar;
}

export interface IRoleOptionDropDown {
  value: "all" | "admin" | "parent" | "teacher";
  label: string;
  description: string;
  icon: React.ReactNode;
}

export interface IOrganization {
  id: string;
  name: string;
  description: string;
  country: string;
  users: string[];
  address: string;
  pincode: string;
  status: string;
  logo?: {
    publicId: string;
    url: string;
  };
}

export interface IAccount {
  id: string;
  name: string;
  ownerUserId: { id: string; name: string; email: string } | string;
  status: "active" | "trial" | "suspended";
  createdAt: string;
  organizations: IOrganization[];
}

export interface ICreateAccountValue {
  accountName: string;
  ownerEmail: string;
  ownerName: string;
  schoolName: string;
  address: string;
  pincode: string;
  description?: string;
}

export interface IAddOrganizationToAccountValue {
  schoolName: string;
  address: string;
  pincode: string;
  description?: string;
}

export interface ICreateOrganizationValue {
  name: string;
  address: string;
  pincode: string;
  description?: string;
}

export interface IAcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: string;
}

export interface IClass {
  id: string;
  name: string;
  academicYearId: string;
  numericLevel?: number;
  sequence?: number;
  status: string;
}

export interface ISection {
  id: string;
  name: string;
  classId: string;
  academicYearId: string;
  classTeacherId?: { id: string; name: string; email: string } | null;
  roomNumber?: string;
  capacity?: number;
  status: string;
}

export interface ISubject {
  id: string;
  name: string;
  code: string;
  academicYearId: string;
  type: string;
  status: string;
}

export interface ITeacherAssignment {
  id: string;
  teacherUserId: { id: string; name: string; email: string };
  academicYearId: string;
  classId: { id: string; name: string };
  sectionId: { id: string; name: string };
  subjectId?: { id: string; name: string; code: string } | null;
  assignmentRole: "SUBJECT_TEACHER" | "CLASS_TEACHER";
  status: string;
}

export interface IPTMEvent {
  id: string;
  academicYearId: string;
  title: string;
  date: string;
  mode: "onsite" | "online";
  venue?: string;
  defaultMeetingLink?: string;
  sectionIds: string[];
  slotDurationMins: number;
  status: string;
  createdAt: string;
}

export interface IPTMSlot {
  id: string;
  ptmEventId: string;
  teacherUserId: { id: string; name: string; email: string } | string;
  sectionId: string;
  startAt: string;
  endAt: string;
  capacity: number;
  bookedCount: number;
  meetingLink?: string;
  status: string;
}

export interface IPTMBooking {
  id: string;
  ptmEventId: string;
  slotId: IPTMSlot | string;
  studentId: { id: string; name: string; admissionNumber: string } | string;
  parentUserId: string;
  status: string;
  parentNote?: string;
  teacherNote?: string;
}

export interface IGradingBand {
  grade: string;
  minPercent: number;
  maxPercent: number;
  gradePoint: number;
}

export interface IGradingScheme {
  id: string;
  name: string;
  bands: IGradingBand[];
  passPercent: number;
}

export interface IExam {
  id: string;
  academicYearId: string;
  name: string;
  term?: string;
  type: string;
  startDate: string;
  endDate: string;
  classIds: { id: string; name: string }[];
  gradingSchemeId: { id: string; name: string } | string;
  status: string;
  publishedAt?: string;
}

export interface IExamSubject {
  id: string;
  examId: string;
  classId: { id: string; name: string } | string;
  subjectId: { id: string; name: string; code: string } | string;
  examDate?: string;
  maxMarks: number;
  passMarks: number;
  hasPractical: boolean;
  practicalMaxMarks: number;
}

export interface IMarks {
  id: string;
  examSubjectId: string;
  studentId: string;
  theoryMarks: number;
  practicalMarks: number;
  totalMarks: number;
  isAbsent: boolean;
  status: string;
}

export interface IMarksSheetItem {
  student: { id: string; name: string; rollNumber?: string };
  marks: IMarks | null;
}

export interface IResultSubjectRow {
  subjectId: { id: string; name: string; code: string } | string;
  obtained: number;
  max: number;
  isAbsent: boolean;
  grade: string | null;
  gradePoint: number | null;
}

export interface IResult {
  id: string;
  academicYearId: string;
  examId: { id: string; name: string; term?: string; type: string; startDate: string } | string;
  studentId: string;
  classId: string;
  sectionId?: string;
  subjects: IResultSubjectRow[];
  totals: { obtained: number; max: number; percentage: number };
  grade: string | null;
  gpa: number | null;
  rankInClass?: number;
  rankInSection?: number;
  promotionStatus: "pass" | "fail" | "pending";
  version: number;
  status: string;
  publishedAt: string;
}

export interface IFeeHead {
  id: string;
  name: string;
  code: string;
  category: string;
  isRefundable: boolean;
}

export interface IFeeStructure {
  id: string;
  academicYearId: string;
  name: string;
  classIds: { id: string; name: string }[];
  sectionIds: { id: string; name: string }[];
  items: { feeHeadId: { id: string; name: string; code: string }; amount: number }[];
  installments: { label: string; dueDate: string; amount: number }[];
  version: number;
  status: string;
}

export interface IFeeInstallmentBalance {
  label: string;
  dueDate: string;
  netAmount: number;
  paidAmount: number;
  balance: number;
}

export interface IPayment {
  id: string;
  academicYearId: string;
  studentId: { id: string; name: string; admissionNumber: string } | string;
  studentFeeId: string;
  entryType: "payment" | "reversal";
  amount: number;
  allocations: { installmentLabel: string; amount: number }[];
  method: string;
  instrumentRef?: string;
  receiptNumber: string;
  reversalOfPaymentId?: string;
  paidAt: string;
  remarks?: string;
}

export interface IFeeConcession {
  id: string;
  reason: string;
  amount: number;
  approvedBy?: string;
  approvedAt: string;
}

export interface IStudentFeeSummary {
  studentFeeId: string;
  academicYearId: string;
  studentId?: string;
  studentName?: string;
  installments: IFeeInstallmentBalance[];
  concessions?: IFeeConcession[];
  totalNet: number;
  totalPaid: number;
  totalBalance: number;
  payments: IPayment[];
}

export interface IStudentDetails {
  id: string;
  name: string;
  classId: string;
  rollNumber: string;
  parentEmail: string;
  dateOfBirth: string;
}

export interface IStudentFormData {
  id?: string;
  admissionNumber: string;
  admissionDate: string;
  name: string;
  academicYearId: string;
  classId: string;
  sectionId: string;
  rollNumber: string;
  dateOfBirth: string;
  parentEmail: string;
  city: string;
  state: string;
  address: string;
  parentName: string;
  phoneNumber: string;
}

export interface IStudentEnrollment {
  academicYearId: string;
  classId: { id: string; name: string } | null;
  sectionId: { id: string; name: string } | null;
  rollNumber: string;
}

export interface IPromotionCandidate {
  student: { id: string; name: string; admissionNumber: string };
  rollNumber: string;
  result: {
    examName: string;
    examType: string;
    promotionStatus: "pass" | "fail" | "pending";
    percentage: number | null;
    grade: string | null;
  } | null;
}

export type PromotionAction = "promote" | "detain" | "transfer" | "withdraw";

export interface IPromotionDecisionResult {
  studentId: string;
  success: boolean;
  message?: string;
}

export interface IEnrollmentHistoryEntry {
  id: string;
  academicYearId: { id: string; name: string } | null;
  classId: { id: string; name: string } | null;
  sectionId: { id: string; name: string } | null;
  rollNumber: string;
  status: "ACTIVE" | "PROMOTED" | "DETAINED" | "TRANSFERRED" | "WITHDRAWN";
  joinedOn: string;
  leftOn?: string;
}

export interface IGuardian {
  id: string;
  parentUserId: { id: string; name: string; email: string; phoneNumber: string; status: string };
  relationshipType: "FATHER" | "MOTHER" | "GUARDIAN" | "OTHER";
  isPrimaryGuardian: boolean;
  isEmergencyContact: boolean;
  canPickup: boolean;
  communicationPreference: string[];
  status: string;
}

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface IAttendanceRecord {
  id: string;
  studentId: { id: string; name: string } | string;
  status: AttendanceStatus;
  reason?: string;
  date?: string;
}

export interface IAttendanceSession {
  id: string;
  sectionId: string;
  date: string;
  status: string;
  summary: { present: number; absent: number; late: number; excused: number; total: number };
}

export interface IStaffProfile {
  id: string;
  userId: string;
  employeeCode?: string;
  designation?: string;
  department?: string;
  qualification?: string;
  dateOfJoining?: string;
  address?: string;
  status: string;
}

export interface ITeacherDirectoryEntry {
  userId: string;
  name: string;
  email: string;
  phoneNumber?: string;
  status: string;
  staffProfile: IStaffProfile | null;
}

export interface IAddGuardianValue {
  parentEmail: string;
  parentName?: string;
  phoneNumber?: string;
  relationshipType: string;
  isPrimaryGuardian: boolean;
  isEmergencyContact: boolean;
  canPickup: boolean;
}

export interface ICreateUpdateStudentModalProps {
  t: (key: string) => string;
  isOpen: boolean;
  organizationId: string;
  form: UseFormReturn<IStudentFormData>;
  isEditStudent: boolean;
  currentStep: number;
  isParentExist: boolean;
  isLoadingAddStudent: boolean;
  isLoadingUpdateStudent: boolean;
  onClose: () => void;
  nextStep: () => void;
  prevStep: () => void;
  onSubmit: (e: React.FormEvent) => void;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

export interface SelectOption {
  id: string | number;
  name: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface SelectDropdownProps {
  options: SelectOption[];
  value: SelectOption | null;
  onChange: (value: SelectOption) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export interface IEmailLog {
  id: string;
  recipientEmail: string;
  type: string;
  subject: string;
  status: "sent" | "failed" | "skipped";
  reason?: string;
  createdAt: string;
}
