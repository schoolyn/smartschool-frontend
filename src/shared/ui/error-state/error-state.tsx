import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import { IAPIError } from "@/shared/types";

interface ErrorStateProps {
  // the failed request's error; its server message is shown when there is one
  error?: IAPIError | null;
  title?: string;
  onRetry?: () => void;
}

// shown when a page's data failed to load, so it never looks like an empty "nothing here yet" list
const ErrorState = ({ error, title = "This could not be loaded", onRetry }: ErrorStateProps) => (
  <div role="alert" className="flex flex-col items-center gap-3 rounded-lg bg-white px-6 py-10 text-center shadow">
    <ExclamationTriangleIcon className="h-8 w-8 text-amber-500" aria-hidden="true" />
    <div>
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-500">
        {error?.response?.Error?.message || "Please check your connection and try again."}
      </p>
    </div>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Try again
      </button>
    )}
  </div>
);

export default ErrorState;
