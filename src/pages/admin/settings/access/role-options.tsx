import {
  AcademicCapIcon,
  BanknotesIcon,
  BriefcaseIcon,
  EyeIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "@heroicons/react/20/solid";

import { RoleOption } from "@/entities/user";

const icon = (Icon: typeof UsersIcon) => <Icon className="h-5 w-5 text-primary-500" />;

export const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "admin",
    label: "Administrator",
    description: "Full access to everything in the school",
    icon: icon(ShieldCheckIcon),
  },
  {
    value: "teacher",
    label: "Teacher",
    description: "Their classes: attendance, homework, marks and leave",
    icon: icon(AcademicCapIcon),
  },
  {
    value: "accountant",
    label: "Accountant",
    description: "Fee desk: collect payments, receipts and fee reports",
    icon: icon(BanknotesIcon),
  },
  {
    value: "staff",
    label: "Staff",
    description: "Office staff; access is given per person",
    icon: icon(BriefcaseIcon),
  },
  { value: "parent", label: "Parent", description: "Their own children's information", icon: icon(EyeIcon) },
];
