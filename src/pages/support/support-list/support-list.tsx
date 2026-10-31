import { PlusIcon } from "@heroicons/react/20/solid";

import DataTable, { DataTableColumn } from "@/shared/ui/data-table";
import ErrorState from "@/shared/ui/error-state";
import SectionHeader from "@/shared/ui/section-header";
import { SupportDialog } from "@/features/support-dialog";
import { Badge } from "@/shared/ui/kit/badge";
import { SupportRequest } from "@/entities/support";
import { STATUS, TOPIC_OPTIONS } from "@/entities/support";
import useSupportListController from "./support-list-controller";

const topicName = (topic: string) => TOPIC_OPTIONS.find((option) => option.id === topic)?.name ?? topic;

const columns: DataTableColumn<SupportRequest>[] = [
  {
    id: "request",
    header: "Request",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">
        #{row.original.number} {row.original.subject}
      </span>
    ),
  },
  { id: "topic", header: "Topic", cell: ({ row }) => topicName(row.original.topic) },
  {
    id: "requester",
    header: "Asked by",
    cell: ({ row }) => row.original.requesterId?.name ?? row.original.requesterId?.email,
  },
  {
    id: "status",
    header: "Status",
    meta: { align: "center" },
    cell: ({ row }) => <Badge tone={STATUS[row.original.status].tone}>{STATUS[row.original.status].label}</Badge>,
  },
  {
    id: "lastMessageAt",
    header: "Last activity",
    accessorKey: "lastMessageAt",
    meta: { align: "center" },
    cell: ({ row }) => new Date(row.original.lastMessageAt).toLocaleString(),
  },
];

const SupportList = () => {
  const c = useSupportListController();

  return (
    <div className="mx-auto max-w-5xl">
      <SectionHeader
        title="Help and support"
        description="Ask the Opscul team for help and follow their replies here."
        action={{ label: "Contact support", icon: PlusIcon, onClick: () => c.setIsAsking(true) }}
      />
      {c.error ? (
        <ErrorState error={c.error} onRetry={c.retry} />
      ) : (
        <DataTable
          columns={c.showsRequester ? columns : columns.filter((column) => column.id !== "requester")}
          data={c.requests}
          getRowId={(request) => request._id}
          isLoading={c.isLoading}
          onRowClick={(request) => c.open(request._id)}
          itemLabel={{ one: "request", other: "requests" }}
          pagination={{ pageSize: 20 }}
          empty={{
            title: "No requests yet",
            description: "If something isn't working or you have a question, contact support.",
          }}
        />
      )}

      <SupportDialog open={c.isAsking} onClose={() => c.setIsAsking(false)} />
    </div>
  );
};

export default SupportList;
