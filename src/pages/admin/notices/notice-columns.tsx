import { DocumentArrowDownIcon, EyeIcon } from "@heroicons/react/24/outline";

import { DataTableColumn } from "@/shared/ui/data-table";
import RowMenu from "@/shared/ui/row-menu";
import { INotice } from "@/entities/notice";

interface NoticeColumnActions {
  viewAttachment: (attachmentURL: string, fileName: string) => void;
  downloadAttachment: (attachmentURL: string, fileName: string) => void;
  preview: (notice: INotice) => void;
  remove: (noticeId: string) => void;
}

const audienceLabel = (audience: INotice["audience"]) =>
  audience?.scope === "SCHOOL" || !audience
    ? "Whole School"
    : audience.scope === "ROLE"
      ? `Roles: ${audience.roles.join(", ")}`
      : audience.scope === "CLASS"
        ? `${audience.classIds.length} class(es)`
        : `${audience.sectionIds.length} section(s)`;

export const noticeColumns = ({
  viewAttachment,
  downloadAttachment,
  preview,
  remove,
}: NoticeColumnActions): DataTableColumn<INotice>[] => [
  {
    id: "title",
    header: "Title",
    cell: ({ row }) => (
      <>
        <div className="text-sm font-medium text-gray-900">{row.original.title}</div>
        <div className="text-sm text-gray-500 truncate max-w-xs">{row.original.content}</div>
      </>
    ),
  },
  {
    id: "type",
    header: "Type",
    meta: { align: "center" },
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.original.type === "holiday" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}
      >
        {row.original.type}
      </span>
    ),
  },
  {
    id: "audience",
    header: "Audience",
    meta: { align: "center" },
    cell: ({ row }) => (
      <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-100 text-gray-700">
        {audienceLabel(row.original.audience)}
      </span>
    ),
  },
  {
    id: "date",
    header: "Date",
    meta: { align: "center", className: "text-gray-500" },
    // the event date when set, else when it was published
    cell: ({ row }) =>
      new Date(row.original.date || row.original.publishAt || row.original.createdAt).toLocaleDateString(),
  },
  {
    id: "createdAt",
    header: "Created At",
    meta: { align: "center", className: "text-gray-500" },
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: "actions",
    header: "Actions",
    meta: { align: "center" },
    cell: ({ row }) => {
      const notice = row.original;
      return (
        <div className="flex justify-center items-center gap-2">
          {notice.attachmentURL && (
            <>
              <button
                onClick={() => viewAttachment(notice.attachmentURL!, notice.title)}
                className="text-primary-600 hover:text-primary-900"
                title="View attachment"
              >
                <EyeIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => downloadAttachment(notice.attachmentURL!, `notice-${notice.id}`)}
                className="text-primary-600 hover:text-primary-900"
                title="Download attachment"
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
              </button>
            </>
          )}
          <RowMenu
            items={[
              { label: "Preview", onSelect: () => preview(notice) },
              { label: "Delete", onSelect: () => remove(notice.id), danger: true },
            ]}
          />
        </div>
      );
    },
  },
];
