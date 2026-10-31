import { ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";
import type { AccountRole } from "@/shared/types";

export interface IAddUserValue {
  name: string;
  email: string;
  role: AccountRole;
}

export interface IAllUserDetails {
  id: string;
  name: string;
  email: string;
  role: AccountRole | "student";
  // "suspended" is this school's; pending and active are the account's
  status: "pending" | "active" | "suspended" | "inactive";
}

export interface FormData {
  fullname: string;
  email: string;
  role: AccountRole;
}

export interface RoleOption {
  value: AccountRole;
  label: string;
  description: string;
  icon: ReactNode;
}

export interface ICreateUpdateUserModalProps {
  t: (key: string) => string;
  isOpen: boolean;
  form: UseFormReturn<FormData>;
  roleOptions: RoleOption[];
  isEditUser: boolean;
  isLoadingAddUserDetail: boolean;
  isLoadingUpdateUserDetail?: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export interface IUpdateUserValue {
  id: string;
  name: string;
  email: string;
}

export interface IRoleOptionDropDown {
  value: "all" | AccountRole;
  label: string;
  description: string;
  icon: React.ReactNode;
}
