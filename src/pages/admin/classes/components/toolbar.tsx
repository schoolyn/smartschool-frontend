import { ReactNode } from "react";

// the strip above each table: what is being listed on the left, filters and the main action on the right
const Toolbar = ({ title, children }: { title: ReactNode; children?: ReactNode }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-4">
    <div className="text-lg font-medium text-gray-900">{title}</div>
    <div className="flex flex-wrap items-center gap-3">{children}</div>
  </div>
);

export const PrimaryButton = ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
  >
    {children}
  </button>
);

export default Toolbar;
