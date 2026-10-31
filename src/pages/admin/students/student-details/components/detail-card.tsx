import { ReactNode } from "react";

export interface DetailItem {
  label: string;
  value?: ReactNode;
}

interface DetailCardProps {
  title: string;
  items: DetailItem[];
}

// a titled card of label / value pairs; empty values show a dash
const DetailCard = ({ title, items }: DetailCardProps) => (
  <section className="rounded-lg bg-white shadow">
    <h3 className="border-b border-gray-100 px-5 py-3 text-sm font-semibold text-gray-900">{title}</h3>
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 p-5 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-xs text-gray-500">{item.label}</dt>
          <dd className="mt-0.5 break-words text-sm text-gray-900">{item.value || "-"}</dd>
        </div>
      ))}
    </dl>
  </section>
);

export default DetailCard;
