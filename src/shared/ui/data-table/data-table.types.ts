import { ReactNode } from "react";
import type { Action } from "@/shared/ui/action-buttons";
import { ColumnDef, RowData, SortingState } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    // alignment and extra classes for the column's header and cells
    align?: "left" | "center" | "right";
    className?: string;
  }
}

export type DataTableColumn<T> = ColumnDef<T, unknown>;

export interface ItemLabel {
  one: string;
  other: string;
}

// one word for every count, the way the school writes it: "student(s)", "class(es)"
export const genericLabel = ({ one, other }: ItemLabel) =>
  other.startsWith(one) && other !== one ? `${one}(${other.slice(one.length)})` : `${one}(s)`;

export const countLabel = (count: number, label: ItemLabel) =>
  `${count.toLocaleString("en-IN")} ${genericLabel(label)}`;

// the server already paged the rows: show its page and total, ask it for another page
export interface ServerPagination {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId?: (row: T) => string;
  isLoading?: boolean;
  empty: { title: string; description?: ReactNode; action?: ReactNode };
  onRowClick?: (row: T) => void;
  // client: rows are paged in the browser; server: the API pages them
  pagination?: { pageSize: number } | ServerPagination;
  // controlled by the caller, who filters with `value` (through the API, or over rows it already holds)
  search?: { placeholder?: string; value: string; onChange: (value: string) => void };
  // filters shown beside the search
  toolbar?: ReactNode;
  // list buttons (export, bulk upload), drawn after the toolbar
  actions?: Action[];
  // the noun for the footer count, e.g. { one: "student", other: "students" }
  itemLabel?: ItemLabel;
  // server-paged lists: the controller keeps the sort and sends it to the API; client lists sort on their own
  sorting?: { state: SortingState; onChange: (state: SortingState) => void };
  className?: string;
}
