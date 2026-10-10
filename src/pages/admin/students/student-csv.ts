import { exportToCsv } from "@/utils";

export const STUDENT_CSV_REQUIRED = [
  "name",
  "dateOfBirth",
  "rollNumber",
  "parentEmail",
  "address",
  "city",
  "state",
] as const;
export const STUDENT_CSV_OPTIONAL = ["parentName", "phoneNumber", "pincode"] as const;

type CsvRow = Record<(typeof STUDENT_CSV_REQUIRED)[number] | (typeof STUDENT_CSV_OPTIONAL)[number], string>;

const SAMPLE_ROWS: CsvRow[] = [
  {
    name: "Aarav Sharma",
    dateOfBirth: "2015-06-21",
    rollNumber: "1",
    parentEmail: "rohit.sharma@example.com",
    parentName: "Rohit Sharma",
    phoneNumber: "9876543210",
    address: "12 Park Street",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411001",
  },
  {
    name: "Diya Patel",
    dateOfBirth: "2015-09-03",
    rollNumber: "2",
    parentEmail: "meera.patel@example.com",
    parentName: "Meera Patel",
    phoneNumber: "9123456780",
    address: "7 Lake Road",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411002",
  },
];

export const downloadStudentSampleCsv = () => exportToCsv("student-upload-sample", SAMPLE_ROWS);

interface ExportableStudent {
  name: string;
  dateOfBirth: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  currentEnrollment?: {
    rollNumber?: string;
    classId?: string | { name?: string } | null;
    sectionId?: string | { name?: string } | null;
  } | null;
  parentId?: string | { name?: string; email?: string; phoneNumber?: string } | null;
}

const nameOf = (value?: string | { name?: string } | null) => (value && typeof value === "object" ? value.name ?? "" : "");

// same headers as the upload template, so an exported file can be edited and uploaded back. class and section come
// last for reading only: an upload takes them from the screen, and ignores these columns
export const studentToCsvRow = (student: ExportableStudent): CsvRow & { class: string; section: string } => {
  const parent = student.parentId && typeof student.parentId === "object" ? student.parentId : null;
  return {
    name: student.name,
    dateOfBirth: student.dateOfBirth,
    rollNumber: student.currentEnrollment?.rollNumber ?? "",
    parentEmail: parent?.email ?? "",
    parentName: parent?.name ?? "",
    phoneNumber: parent?.phoneNumber ?? "",
    address: student.address ?? "",
    city: student.city ?? "",
    state: student.state ?? "",
    pincode: student.pincode ?? "",
    class: nameOf(student.currentEnrollment?.classId),
    section: nameOf(student.currentEnrollment?.sectionId),
  };
};
