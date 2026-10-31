import { ArrowUpTrayIcon, DocumentIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { Button } from "@/shared/ui/kit/button";
import { cn } from "@/shared/lib/utils";
import useFileDrop, { formatBytes } from "./use-file-drop";

export interface FileDropzoneProps {
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxBytes?: number;
  // what may be dropped, e.g. "CSV, up to 2 MB"
  hint?: string;
  disabled?: boolean;
  // set by FormControl, so the label and error message point at the browse button
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

// a drop area for one file; once chosen it shows the file with a way to remove it
const FileDropzone = ({
  value,
  onChange,
  accept,
  maxBytes,
  hint,
  disabled,
  id,
  "aria-invalid": invalid,
  "aria-describedby": describedBy,
}: FileDropzoneProps) => {
  const drop = useFileDrop({ accept, maxBytes, disabled, onFile: onChange });

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <DocumentIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">{value.name}</p>
          <p className="text-xs text-gray-500">{formatBytes(value.size)}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onChange(null)}
          disabled={disabled}
          aria-label={`Remove ${value.name}`}
        >
          <XMarkIcon className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div
        {...drop.rootProps}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
          drop.isDragging ? "border-primary-400 bg-primary-50" : "border-gray-300 bg-gray-50/50",
          (invalid || drop.error) && !drop.isDragging && "border-red-300",
          disabled && "opacity-60"
        )}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-gray-500">
          <ArrowUpTrayIcon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-medium text-gray-800">Choose a file or drag and drop it here</p>
          {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={drop.open}
          disabled={disabled}
          id={id}
          aria-invalid={invalid}
          aria-describedby={describedBy}
        >
          Browse files
        </Button>
        <input {...drop.inputProps} />
      </div>
      {drop.error && <p className="mt-1.5 text-sm text-red-600">{drop.error}</p>}
    </div>
  );
};

export default FileDropzone;
