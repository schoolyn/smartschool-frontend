export interface IHomework {
  id: string;
  title: string;
  description: string;
  classId: { id: string; name: string } | string;
  sectionId: { id: string; name: string } | string;
  subjectId: { id: string; name: string; code: string } | string;
  assignedDate: string;
  dueDate: string;
  status: string;
  attachmentURL: string | null;
  createdAt: string;
}
