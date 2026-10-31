export interface ITimetableSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  subjectId: { id: string; name: string; code: string } | null;
  teacherUserId: { id: string; name: string; email: string } | null;
  sectionId: { id: string; name: string } | null;
  classId: { id: string; name: string } | null;
}
