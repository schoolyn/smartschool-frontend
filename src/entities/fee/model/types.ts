import type { Paged } from "@/shared/types";

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
  lateFee?: { amount: number; graceDays: number };
  version: number;
  status: string;
  // active students in its classes who have no fees for its year yet
  unassignedCount: number;
}

export interface IFeeInstallmentBalance {
  label: string;
  dueDate: string;
  netAmount: number;
  // a late fee already added into netAmount
  lateFeeAmount?: number;
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
  // the structure this record bills, e.g. "Grade 6 fees" or "Transport"
  feeStructureName: string;
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

// fee desk reports (amounts in paise)
export interface IFeeDefaulter {
  studentId: string;
  studentFeeIds: string[];
  overdueAmount: number;
  outstandingAmount: number;
  overdueInstallments: { label: string; dueDate: string; balance: number }[];
  oldestDueDate: string;
  daysOverdue: number;
  student: {
    id: string;
    name: string;
    admissionNumber: string;
    className: string;
    sectionName: string;
    guardian: { name: string; phoneNumber: string; email: string } | null;
  } | null;
}

export interface IFeeDefaultersResult extends Paged<IFeeDefaulter> {
  asOf: string;
  summary: { students: number; overdueAmount: number; outstandingAmount: number };
}

export interface IFeeCollectionSummary {
  from: string;
  to: string;
  totals: { received: number; reversed: number; net: number; payments: number; reversals: number };
  byDay: { date: string; amount: number; count: number }[];
  byMethod: { method: string; amount: number; count: number }[];
  byClass: { classId: string | null; className: string; amount: number; students: number }[];
}
