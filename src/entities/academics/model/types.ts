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
  sectionCount?: number;
  studentCount?: number;
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
  studentCount?: number;
}

export interface ISubject {
  id: string;
  name: string;
  code: string;
  academicYearId: string;
  type: string;
  status: string;
  applicableClassIds?: string[];
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
