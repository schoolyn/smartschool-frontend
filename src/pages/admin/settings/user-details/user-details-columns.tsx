import { TFunction } from "i18next";

import { DataTableColumn } from "@/shared/ui/data-table";
import { Badge, BadgeTone } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";
import { IAllUserDetails } from "@/entities/user";

const STATUS_TONE: Record<string, BadgeTone> = { active: "green", pending: "yellow", suspended: "red" };

interface UserColumnActions {
  t: TFunction;
  isSelf: (userId: string) => boolean;
  manageAccess: (userId: string) => void;
  edit: (userId: string) => void;
  remove: (userId: string) => void;
}

export const userColumns = ({
  t,
  isSelf,
  manageAccess,
  edit,
  remove,
}: UserColumnActions): DataTableColumn<IAllUserDetails>[] => [
  {
    id: "name",
    header: t("labels.username"),
    cell: ({ row }) => <span className="text-gray-900">{row.original.name}</span>,
  },
  { id: "email", header: t("labels.email"), meta: { align: "center" }, cell: ({ row }) => row.original.email },
  {
    id: "role",
    header: t("labels.role"),
    meta: { align: "center" },
    cell: ({ row }) => (
      <Badge tone={row.original.role === "admin" ? "green" : "gray"} className="capitalize">
        {row.original.role}
      </Badge>
    ),
  },
  {
    id: "status",
    header: "Status",
    meta: { align: "center" },
    cell: ({ row }) => (
      <Badge tone={STATUS_TONE[row.original.status] ?? "gray"} className="capitalize">
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: t("labels.actions"),
    meta: { align: "center" },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <>
          {user.role !== "parent" && (
            <Button variant="link" className="mr-4" onClick={() => manageAccess(user.id)}>
              Manage access
            </Button>
          )}
          <Button variant="link" className="mr-4" onClick={() => edit(user.id)}>
            {t("labels.edit")}
          </Button>
          {!isSelf(user.id) && (
            <Button variant="link" className="text-red-600 hover:text-red-800" onClick={() => remove(user.id)}>
              Remove
            </Button>
          )}
        </>
      );
    },
  },
];
