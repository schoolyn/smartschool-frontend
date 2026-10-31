import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";

import { Button } from "@/shared/ui/kit/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/kit/select";
import { genericLabel, ItemLabel, ServerPagination } from "./data-table.types";

const PAGE_SIZES = [10, 20, 50, 100];

interface DataTableFooterProps extends ServerPagination {
  itemLabel?: ItemLabel;
}

const PageButton = ({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <Button
    variant="secondary"
    size="icon"
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
    className="h-9 w-9 p-0"
  >
    {children}
  </Button>
);

// the count on the left; rows per page and first / previous / page box / next / last on the right
const DataTableFooter = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  itemLabel,
}: DataTableFooterProps) => {
  const { t } = useTranslation();
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const sizes = PAGE_SIZES.includes(pageSize) ? PAGE_SIZES : [...PAGE_SIZES, pageSize].sort((a, b) => a - b);

  const go = (target: number) => {
    const next = Math.min(lastPage, Math.max(1, target));
    if (next !== page) onPageChange(next);
  };
  const commit = (input: HTMLInputElement) => {
    const typed = Number(input.value);
    if (input.value.trim() && Number.isInteger(typed)) go(typed);
    input.value = String(page);
  };

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
      <p>
        <span className="font-medium text-gray-900">{total.toLocaleString("en-IN")}</span>{" "}
        {genericLabel(itemLabel ?? { one: t("labels.result"), other: t("labels.results") })} {t("labels.found")}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        {onPageSizeChange && (
          <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger aria-label={t("labels.rowsPerPageLabel")} className="h-9 w-auto min-w-[9rem] py-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {t("labels.rowsPerPage", { count: size })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="flex items-center gap-1.5">
          <PageButton label={t("labels.firstPage")} disabled={page <= 1} onClick={() => go(1)}>
            <ChevronDoubleLeftIcon className="h-4 w-4" />
          </PageButton>
          <PageButton label={t("labels.previous")} disabled={page <= 1} onClick={() => go(page - 1)}>
            <ChevronLeftIcon className="h-4 w-4" />
          </PageButton>
          <label className="flex items-center gap-2 px-1">
            {t("labels.page")}
            <input
              key={page}
              defaultValue={page}
              inputMode="numeric"
              aria-label={t("labels.page")}
              onBlur={(e) => commit(e.currentTarget)}
              onKeyDown={(e) => e.key === "Enter" && commit(e.currentTarget)}
              className="h-9 w-14 rounded-md border border-gray-300 text-center text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            {t("labels.ofPages", { count: lastPage })}
          </label>
          <PageButton label={t("labels.next")} disabled={page >= lastPage} onClick={() => go(page + 1)}>
            <ChevronRightIcon className="h-4 w-4" />
          </PageButton>
          <PageButton label={t("labels.lastPage")} disabled={page >= lastPage} onClick={() => go(lastPage)}>
            <ChevronDoubleRightIcon className="h-4 w-4" />
          </PageButton>
        </div>
      </div>
    </div>
  );
};

export default DataTableFooter;
