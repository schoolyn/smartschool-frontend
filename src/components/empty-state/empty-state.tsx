import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

// what a table shows when there is nothing in it yet: what it is for, and the first step to fill it
const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center px-4 py-12 text-center">
    <h3 className="text-base font-medium text-gray-900">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
