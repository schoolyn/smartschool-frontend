import { UseFormReturn } from "react-hook-form";

import { TextField } from "@/shared/ui/form-fields";
import { StudentFormValues } from "../student-form.schema";

interface PersonFieldsProps {
  form: UseFormReturn<StudentFormValues>;
  who: "father" | "mother";
  // this person signs in to the parent app
  isLogin: boolean;
}

const PersonFields = ({ form, who, isLogin }: PersonFieldsProps) => {
  const title = who === "father" ? "Father" : "Mother";
  return (
    <div className="space-y-4 rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        {isLogin && (
          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
            Signs in to the app
          </span>
        )}
      </div>
      <TextField form={form} name={`${who}.name`} label={`${title}'s name`} placeholder="Full name" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField form={form} name={`${who}.phone`} label="Phone" type="tel" placeholder="10-digit mobile number" />
        <TextField form={form} name={`${who}.email`} label="Email" type="email" placeholder="name@example.com" />
      </div>
      <TextField form={form} name={`${who}.occupation`} label="Occupation" placeholder="e.g. Engineer" />
    </div>
  );
};

export default PersonFields;
