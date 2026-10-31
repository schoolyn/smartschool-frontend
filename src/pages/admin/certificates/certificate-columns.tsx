import { DataTableColumn } from "@/shared/ui/data-table";
import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";
import { ICertificate } from "@/entities/certificate";
import { formatDate } from "@/shared/lib";

export const CERTIFICATE_TYPE_LABEL = { bonafide: "Bonafide", transfer: "Transfer certificate" } as const;

interface CertificateColumnActions {
  download: (certificate: ICertificate) => void;
  duplicate?: (certificate: ICertificate) => void;
  busyId?: string;
  withStudent?: boolean;
}

// downloads stay available when the module is locked; a duplicate needs issue rights
export const certificateColumns = ({
  download,
  duplicate,
  busyId,
  withStudent = true,
}: CertificateColumnActions): DataTableColumn<ICertificate>[] => [
  {
    id: "number",
    header: "Number",
    cell: ({ row }) => <span className="whitespace-nowrap font-mono text-xs text-gray-900">{row.original.number}</span>,
  },
  {
    id: "type",
    header: "Type",
    meta: { align: "center" },
    cell: ({ row }) => (
      <Badge tone={row.original.type === "transfer" ? "blue" : "gray"}>
        {CERTIFICATE_TYPE_LABEL[row.original.type]}
      </Badge>
    ),
  },
  ...(withStudent
    ? [
        {
          id: "student",
          header: "Student",
          meta: { align: "center" as const },
          cell: ({ row }: { row: { original: ICertificate } }) => row.original.studentName,
        },
      ]
    : []),
  {
    id: "issuedAt",
    header: "Issued on",
    meta: { align: "center" },
    cell: ({ row }) => formatDate(row.original.issuedAt),
  },
  {
    id: "issuedBy",
    header: "Issued by",
    meta: { align: "center", className: "text-gray-500" },
    cell: ({ row }) => (typeof row.original.issuedBy === "object" ? row.original.issuedBy.name : "-"),
  },
  {
    id: "duplicates",
    header: "Duplicates",
    meta: { align: "center" },
    cell: ({ row }) => row.original.duplicates || "-",
  },
  {
    id: "actions",
    header: "Action",
    meta: { align: "center" },
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-3">
        <Button variant="link" onClick={() => download(row.original)}>
          Download
        </Button>
        {duplicate && (
          <Button variant="link" loading={busyId === row.original.id} onClick={() => duplicate(row.original)}>
            Duplicate
          </Button>
        )}
      </div>
    ),
  },
];
