import { FallbackProps } from "react-error-boundary";

// last-resort UI for an uncaught render error - without this the user saw a blank white screen
const ErrorFallback = ({ resetErrorBoundary }: FallbackProps) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="max-w-sm w-full bg-white rounded-lg shadow p-6 text-center">
      <h1 className="text-lg font-semibold text-gray-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-gray-500">
        An unexpected error occurred. Try reloading the page - if it keeps happening, please contact support.
      </p>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Reload
      </button>
    </div>
  </div>
);

export default ErrorFallback;
