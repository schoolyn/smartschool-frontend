import { FieldValues, Path, UseFormReturn } from "react-hook-form";

import CustomSelectDropdown from "@/components/custom-select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectOption } from "@/types";

interface FieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
}

export const TextField = <T extends FieldValues>({
  form,
  name,
  label,
  type = "text",
  placeholder,
  autoFocus,
}: FieldProps<T> & { type?: string; placeholder?: string; autoFocus?: boolean }) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input {...field} type={type} placeholder={placeholder} autoFocus={autoFocus} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const SelectField = <T extends FieldValues>({
  form,
  name,
  label,
  options,
  placeholder = "Select",
  disabled,
  onValueChange,
}: FieldProps<T> & {
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  // called with the chosen id after the form value has been updated
  onValueChange?: (id: string) => void;
}) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <CustomSelectDropdown
            placeholder={placeholder}
            disabled={disabled}
            options={options}
            value={options.find((option) => String(option.id) === field.value) ?? null}
            onChange={(option) => {
              field.onChange(String(option.id));
              onValueChange?.(String(option.id));
            }}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);
