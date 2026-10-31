import { TFunction } from "i18next";

import Avatar from "@/shared/ui/avatar";
import { DataTableColumn } from "@/shared/ui/data-table";
import RowMenu from "@/shared/ui/row-menu";
import { Button } from "@/shared/ui/kit/button";
import { formatDate } from "@/shared/lib";
import { StudentListRow } from "./students-list-controller";

// the parent of this student, when they were invited but have not set a password yet
const pendingParent = (student: StudentListRow) => {
  const parent = student.parentId;
  return parent && typeof parent === "object" && parent.status === "pending" ? (parent as { id: string }) : null;
};

interface StudentColumnActions {
  t: TFunction;
  open: (studentId: string) => void;
  edit: (studentId: string) => void;
  resendInvite: (parentUserId: string) => void;
  remove: (studentId: string) => void;
  // only when the person may issue and the package includes certificates
  issueCertificate?: (studentId: string) => void;
}

export const studentColumns = ({
  t,
  open,
  edit,
  resendInvite,
  remove,
  issueCertificate,
}: StudentColumnActions): DataTableColumn<StudentListRow>[] => [
  {
    id: "name",
    header: t("labels.student_name"),
    cell: ({ row }) => {
      const student = row.original;
      return (
        <div className="flex items-center">
          <Avatar name={student.name} src={student.photoUrl ?? undefined} size={40} />
          <div className="ml-4">
            <Button
              variant="link"
              className="font-medium text-gray-900 hover:text-primary-600"
              onClick={() => open(student.id)}
            >
              {student.name}
            </Button>
            {pendingParent(student) && (
              <span className="mt-0.5 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {t("labels.invite_pending")}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    id: "rollNumber",
    header: t("labels.roll_number"),
    meta: { align: "center" },
    cell: ({ row }) => row.original.currentEnrollment?.rollNumber,
  },
  {
    id: "class",
    header: t("labels.class_id"),
    meta: { align: "center" },
    cell: ({ row }) => {
      const enrollment = row.original.currentEnrollment;
      return `${enrollment?.classId?.name ?? ""}${enrollment?.sectionId?.name ? ` - ${enrollment.sectionId.name}` : ""}`;
    },
  },
  {
    id: "dateOfBirth",
    header: t("labels.date_of_birth"),
    meta: { align: "center" },
    cell: ({ row }) => formatDate(row.original.dateOfBirth),
  },
  {
    id: "actions",
    header: t("labels.actions"),
    meta: { align: "center" },
    cell: ({ row }) => {
      const student = row.original;
      const parent = pendingParent(student);
      return (
        <RowMenu
          items={[
            { label: t("buttons.edit"), onSelect: () => edit(student.id) },
            ...(parent ? [{ label: t("buttons.resend_invite"), onSelect: () => resendInvite(parent.id) }] : []),
            ...(issueCertificate ? [{ label: "Issue certificate", onSelect: () => issueCertificate(student.id) }] : []),
            { label: t("buttons.delete"), onSelect: () => remove(student.id), danger: true },
          ]}
        />
      );
    },
  },
];
