import { ComponentType, SVGProps } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";

import { useCountUp } from "./use-count-up";

const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2 });

interface StatCardProps {
  title: string;
  value: number | null;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  to: string;
  currency?: boolean;
  index: number;
}

// null means the viewer has no access to that number (shown as a dash), not zero
const StatCard = ({ title, value, icon: Icon, to, currency, index }: StatCardProps) => {
  const animated = useCountUp(value);
  const display = value === null ? "-" : currency ? rupees.format(animated) : animated.toLocaleString("en-IN");

  return (
    <Link
      to={to}
      aria-label={`${title}: ${value === null ? "not available" : display}. Open`}
      style={{ animationDelay: `${index * 50}ms` }}
      className="fade-up group relative bg-white rounded-xl shadow-xl p-6 flex items-center space-x-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      <div className="p-3 bg-primary-50 rounded-lg">
        <Icon className="h-6 w-6 text-primary-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 tabular-nums">{display}</p>
      </div>
      <ArrowUpRightIcon className="absolute top-4 right-4 h-4 w-4 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
    </Link>
  );
};

export default StatCard;
