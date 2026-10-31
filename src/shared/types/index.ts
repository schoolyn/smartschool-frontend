// every role a person can hold in a school, as the web app names them
export type AccountRole = "admin" | "parent" | "teacher" | "accountant" | "staff";

// mirrors smartschool-backend/core/access/permissions.js
export type PermissionKey =
  | "school.settings"
  | "people.manage"
  | "dashboard.view"
  | "academics.manage"
  | "students.view"
  | "students.manage"
  | "attendance.mark"
  | "homework.manage"
  | "leave.review"
  | "exams.manage"
  | "exams.marks"
  | "notices.manage"
  | "calendar.manage"
  | "ptm.manage"
  | "fees.collect"
  | "fees.reports"
  | "fees.reverse"
  | "fees.concession"
  | "fees.setup"
  | "certificates.issue";

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
  // shown in the open menu when there is nothing to pick yet
  emptyText?: string;
  // set by FormControl, so the field label names the select
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

// every paged list endpoint answers in this shape (smartschool-backend/core/http/pagination.js)
export interface Pagination {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Paged<T> {
  rows: T[];
  pagination: Pagination;
}

export type ModuleKey =
  | "attendance"
  | "homework"
  | "timetable"
  | "leave"
  | "exams"
  | "fees"
  | "onlinePayments"
  | "notices"
  | "calendar"
  | "ptm"
  | "certificates";
