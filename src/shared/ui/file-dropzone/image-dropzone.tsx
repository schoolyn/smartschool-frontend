import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

import { Button } from "@/shared/ui/kit/button";
import { cn } from "@/shared/lib/utils";
import useFileDrop from "./use-file-drop";

interface ImageDropzoneProps {
  // the image to show: a picked file's preview or the saved one
  src: string | null;
  onPick: (file: File) => void;
  onRemove?: () => void;
  accept?: string;
  maxBytes?: number;
  hint?: string;
  alt: string;
  disabled?: boolean;
  // size and shape of the drop area, e.g. "h-40 w-32"
  className?: string;
  // how the image fills the area: cover for photos, contain for logos
  fit?: "cover" | "contain";
}

// a drop area that previews the image; clicking it picks another
const ImageDropzone = ({
  src,
  onPick,
  onRemove,
  accept = "image/png,image/jpeg",
  maxBytes,
  hint,
  alt,
  disabled,
  className,
  fit = "cover",
}: ImageDropzoneProps) => {
  const drop = useFileDrop({ accept, maxBytes, disabled, onFile: onPick });

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        {...drop.rootProps}
        onClick={drop.open}
        disabled={disabled}
        aria-label={src ? `Change ${alt.toLowerCase()}` : `Add ${alt.toLowerCase()}`}
        className={cn(
          "group relative flex items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors",
          drop.isDragging ? "border-primary-400 bg-primary-50" : "border-gray-300 bg-gray-50 hover:border-primary-400",
          className
        )}
      >
        {src ? (
          <>
            <img
              src={src}
              alt={alt}
              className={cn("h-full w-full", fit === "cover" ? "object-cover" : "object-contain p-2")}
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
              Change
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-1.5 px-2 text-center">
            <ArrowUpTrayIcon className="h-6 w-6 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">Drag and drop</span>
            <span className="text-xs text-gray-500">
              or <span className="text-primary-600">choose image</span>
            </span>
          </span>
        )}
      </button>
      <input {...drop.inputProps} />
      {hint && <p className="text-center text-xs text-gray-500">{hint}</p>}
      {drop.error && <p className="text-center text-xs text-red-600">{drop.error}</p>}
      {src && onRemove && (
        <Button variant="link" className="h-auto p-0 text-xs text-red-600" onClick={onRemove} disabled={disabled}>
          Remove
        </Button>
      )}
    </div>
  );
};

export default ImageDropzone;
