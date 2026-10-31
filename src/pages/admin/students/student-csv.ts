import { exportToCsv } from "@/shared/lib";

export const STUDENT_CSV_REQUIRED = [
  "name",
  "dateOfBirth",
  "rollNumber",
  "parentEmail",
  "address",
  "city",
  "state",
] as const;
export const STUDENT_CSV_OPTIONAL = [
  "parentName",
  "phoneNumber",
  "pincode",
  "admissionNumber",
  "admissionDate",
] as const;

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
    admissionNumber: "ADM-1021",
    admissionDate: "2021-04-05",
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
    admissionNumber: "",
    admissionDate: "",
  },
];

export const downloadStudentSampleCsv = () => exportToCsv("student-upload-sample", SAMPLE_ROWS);
