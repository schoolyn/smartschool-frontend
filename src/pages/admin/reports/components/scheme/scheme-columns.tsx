import { DataTableColumn } from "@/shared/ui/data-table";
import RowMenu from "@/shared/ui/row-menu";
import { IGradingScheme } from "@/entities/exam";

interface SchemeActions {
  edit: (scheme: IGradingScheme) => void;
  remove: (scheme: IGradingScheme) => void;
}

export const schemeColumns = ({ edit, remove }: SchemeActions): DataTableColumn<IGradingScheme>[] => [
  {
    id: "name",
    header: "Scheme",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-gray-900">{row.original.name}</p>
        <p className="text-xs text-gray-500">
          {row.original.examCount ? `Used by ${row.original.examCount} exam(s)` : "Not used by any exam yet"}
        </p>
      </div>
    ),
  },
  {
    id: "pass",
    header: "Pass mark",
    meta: { align: "center" },
    cell: ({ row }) => <span className="text-sm text-gray-700">{row.original.passPercent}%</span>,
  },
  {
    id: "grades",
    header: "Grades",
    meta: { align: "center" },
    cell: ({ row }) => (
      <div className="flex flex-wrap justify-center gap-1.5">
        {[...row.original.bands]
          .sort((a, b) => b.minPercent - a.minPercent)
          .map((band) => (
            <span key={band.grade} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
              <span className="font-semibold">{band.grade}</span> {band.minPercent}%+
            </span>
          ))}
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    meta: { align: "right" },
    cell: ({ row }) => (
      <RowMenu
        label={`Actions for ${row.original.name}`}
        items={[
          { label: "Edit", onSelect: () => edit(row.original) },
          { label: "Delete", onSelect: () => remove(row.original), danger: true },
        ]}
      />
    ),
  },
];
