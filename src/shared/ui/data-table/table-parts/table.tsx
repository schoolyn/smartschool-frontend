import { ReactNode } from "react";

import EmptyState from "@/shared/ui/empty-state";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { Table, TableHeader as UiTableHeader, TableBody, TableRow, TableHead, TableCell } from "@/shared/ui/kit/table";

// TableHeader wraps bare <TableHead> children in the app's one header row; callers don't write <tr>
const TableHeader = UiTableHeader;

// an empty table body, drawn with the app's one empty state
const TableEmpty = ({
  colSpan,
  title,
  description,
  action,
}: {
  colSpan: number;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) => (
  <TableRow>
    <TableCell colSpan={colSpan} className="p-0">
      <EmptyState title={title} description={description} action={action} />
    </TableCell>
  </TableRow>
);

// loading rows that keep the table's header and card in place
const TableSkeletonRows = ({ columns, rows = 5 }: { columns: number; rows?: number }) => (
  <>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <TableRow key={rowIndex} className="hover:bg-transparent">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <TableCell key={colIndex}>
            <Skeleton className="h-4 w-full max-w-[12rem]" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

export { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, TableEmpty, TableSkeletonRows };
