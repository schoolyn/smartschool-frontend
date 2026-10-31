export interface IPromotionCandidate {
  student: { id: string; name: string; admissionNumber: string; photoUrl?: string | null };
  rollNumber: string;
  result: {
    examName: string;
    examType: string;
    promotionStatus: "pass" | "fail" | "pending";
    percentage: number | null;
    grade: string | null;
  } | null;
}

// pass_out: finished the final class and leaves the school, records kept
export type PromotionAction = "promote" | "detain" | "transfer" | "withdraw" | "pass_out";

// one section's promotion progress: waiting students by result, and those already moved on
export interface IPromotionSectionStats {
  sectionId: string;
  waiting: number;
  moved: number;
  pass: number;
  fail: number;
  noResult: number;
}

export interface IPromotionDecisionResult {
  studentId: string;
  success: boolean;
  message?: string;
}
