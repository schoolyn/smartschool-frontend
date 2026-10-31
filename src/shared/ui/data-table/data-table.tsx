import { flexRender } from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpDownIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";

import ActionButtons from "@/shared/ui/action-buttons";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeletonRows,
} from "@/shared/ui/data-table/table-parts";
import { Input } from "@/shared/ui/kit/input";
import { cn } from "@/shared/lib/utils";
import useFitHeight from "./use-fit-height";
import DataTableFooter from "./data-table-footer";
import { DataTableProps } from "./data-table.types";
import useDataTable from "./use-data-table";

const ALIGN = { left: "text-left", center: "text-center", right: "text-right" };
const JUSTIFY = { left: "justify-start", center: "justify-center", right: "justify-end" };

// one card for every list: search and actions on top, the rows, and the count and pager below
const DataTable = <T,>(props: DataTableProps<T>) => {
  const { empty, isLoading, onRowClick, search, toolbar, actions = [], itemLabel, className } = props;
  const hasActions = actions.some((a) => !a.hidden);
  const { table, pager } = useDataTable(props);
  const fit = useFitHeight<HTMLDivElement>();
  const columnCount = table.getVisibleLeafColumns().length;
  const rows = table.getRowModel().rows;

  return (
    // toolbar, column headers and footer stay put; only the rows scroll
    <div
      ref={fit.ref}
      style={{ maxHeight: fit.maxHeight }}
      className={cn("flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white", className)}
    >
      {(search || toolbar || hasActions) && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-3">
          {search ? (
            <div className="relative w-full sm:w-80">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                placeholder={search.placeholder ?? "Search"}
                className="pl-9"
              />
            </div>
          ) : (
            <span />
          )}
          {(toolbar || hasActions) && (
            <div className="flex flex-wrap items-center gap-2">
              {toolbar}
              <ActionButtons actions={actions} />
            </div>
          )}
        </div>
      )}

      <Table scrollClassName="min-h-0 flex-1 overflow-y-auto">
        <TableHeader className="sticky top-0 z-10 shadow-[inset_0_-1px_0_rgb(229_231_235)]">
          {table.getHeaderGroups()[0].headers.map((header) => {
            const meta = header.column.columnDef.meta;
            const align = meta?.align ?? "left";
            const sortable = header.column.getCanSort();
            const sorted = header.column.getIsSorted();
            const SortIcon = sorted === "asc" ? ChevronUpIcon : sorted === "desc" ? ChevronDownIcon : ChevronUpDownIcon;
            return (
              <TableHead key={header.id} className={cn(ALIGN[align], meta?.className)}>
                {header.isPlaceholder ? null : sortable ? (
                  <button
                    type="button"
                    onClick={header.column.getToggleSortingHandler()}
                    className={cn(
                      "inline-flex w-full items-center gap-1 hover:text-gray-900",
                      JUSTIFY[align],
                      sorted && "text-gray-900"
                    )}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    <SortIcon className={cn("h-4 w-4", sorted ? "text-gray-700" : "text-gray-400")} />
                  </button>
                ) : (
                  flexRender(header.column.columnDef.header, header.getContext())
                )}
              </TableHead>
            );
          })}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeletonRows columns={columnCount} />
          ) : rows.length === 0 ? (
            <TableEmpty
              colSpan={columnCount}
              title={empty.title}
              description={empty.description}
              action={empty.action}
            />
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={cn(onRowClick && "cursor-pointer")}
              >
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta;
                  return (
                    <TableCell key={cell.id} className={cn(ALIGN[meta?.align ?? "left"], meta?.className)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pager && pager.total > 0 && <DataTableFooter {...pager} itemLabel={itemLabel} />}
    </div>
  );
};

export default DataTable;
