import type { ILetterhead } from "@/entities/organization";

export type CertificateType = "bonafide" | "transfer";

export type CertificateGender = "male" | "female" | "other";

export interface ICertificate {
  id: string;
  type: CertificateType;
  number: string;
  studentId: string;
  studentName: string;
  duplicates: number;
  issuedAt: string;
  issuedBy?: { id: string; name: string } | string;
}

export interface ICertificateDraft {
  student: {
    id: string;
    name: string;
    status: string;
    admissionNumber: string;
    dob: string | null;
    academicYearId: string | null;
    academicYear: string;
    className: string;
    sectionName: string;
  };
  answers: Partial<{
    gender: CertificateGender;
    parentName: string;
    fatherName: string;
    motherName: string;
    nationality: string;
    category: string;
    conduct: string;
  }>;
  records: {
    admissionDate: string | null;
    admissionClass: string;
    subjects: string[];
    workingDays: number;
    daysPresent: number;
    lastExam: string;
    promotion: string;
    feesStatus: string;
    duePaise: number;
  } | null;
  existingTc: { id: string; number: string; issuedAt: string } | null;
  letterhead: ILetterhead & { name: string; address: string; logoUrl: string | null };
}
