import { saveFile } from "./save-file";

// a CSV of rows the screen already holds in full; paged lists export through the backend instead
export const exportToCsv = (filename: string, rows: Record<string, string | number | null | undefined>[]) => {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const escapeCell = (value: unknown) => {
    const str = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const lines = [headers.join(","), ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(","))];
  // the byte-order mark makes Excel read the file as UTF-8, so the rupee sign and Indian names show correctly
  saveFile(
    "\uFEFF" + lines.join("\n"),
    filename.endsWith(".csv") ? filename : `${filename}.csv`,
    "text/csv;charset=utf-8;"
  );
};
