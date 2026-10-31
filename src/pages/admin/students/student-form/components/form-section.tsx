import { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

// one titled card of the admission form
const FormSection = ({ title, description, children }: FormSectionProps) => (
  <section className="rounded-lg bg-white shadow">
    <div className="border-b border-gray-100 px-6 py-4">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
    </div>
    <div className="p-6">{children}</div>
  </section>
);

export default FormSection;
