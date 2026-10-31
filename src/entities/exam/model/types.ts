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
  // exams that grade with it
  examCount?: number;
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
  progress?: IExamProgress;
}

// where an exam stands, worked out by the server from its subjects and marks
export type ExamStage = "setup" | "marks" | "ready" | "published";

export interface IExamProgress {
  classes: number;
  classesWithSubjects: number;
  subjects: number;
  // marks a fully entered exam holds: each subject times the students of its class
  expected: number;
  entered: number;
  verified: number;
  stage: ExamStage;
}

export interface IExamOverviewSubject extends IExamSubject {
  expected: number;
  entered: number;
  verified: number;
}

export interface IExamOverview {
  item: IExam & { progress: IExamProgress };
  classes: { id: string; name: string; students: number; subjects: IExamOverviewSubject[] }[];
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
