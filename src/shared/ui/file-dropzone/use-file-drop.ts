import { DragEvent, useRef, useState } from "react";

export interface FileDropOptions {
  // same format as an input's accept: ".csv,text/csv", "image/png,image/jpeg", "image/*"
  accept?: string;
  maxBytes?: number;
  disabled?: boolean;
  onFile: (file: File) => void;
}

const matches = (file: File, accept?: string) =>
  !accept ||
  accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .some((rule) =>
      rule.startsWith(".")
        ? file.name.toLowerCase().endsWith(rule)
        : rule.endsWith("/*")
          ? file.type.startsWith(rule.slice(0, -1))
          : file.type === rule
    );

export const formatBytes = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

// drag and drop plus a hidden file input, with the type and size checked before the file is taken
const useFileDrop = ({ accept, maxBytes, disabled, onFile }: FileDropOptions) => {
  const input = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const take = (file?: File) => {
    if (!file) return;
    if (!matches(file, accept)) return setError("This file type isn't supported.");
    if (maxBytes && file.size > maxBytes) return setError(`The file must be ${formatBytes(maxBytes)} or smaller.`);
    setError("");
    onFile(file);
  };

  const onDrag = (event: DragEvent, dragging: boolean) => {
    event.preventDefault();
    if (!disabled) setIsDragging(dragging);
  };

  return {
    isDragging,
    error,
    clearError: () => setError(""),
    open: () => !disabled && input.current?.click(),
    rootProps: {
      onDragEnter: (event: DragEvent) => onDrag(event, true),
      onDragOver: (event: DragEvent) => onDrag(event, true),
      onDragLeave: (event: DragEvent) => onDrag(event, false),
      onDrop: (event: DragEvent) => {
        onDrag(event, false);
        if (!disabled) take(event.dataTransfer.files?.[0]);
      },
    },
    inputProps: {
      ref: input,
      type: "file",
      accept,
      hidden: true,
      disabled,
      // cleared so choosing the same file again still counts as a change
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        take(event.target.files?.[0]);
        event.target.value = "";
      },
    },
  };
};

export default useFileDrop;
