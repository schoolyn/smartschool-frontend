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
