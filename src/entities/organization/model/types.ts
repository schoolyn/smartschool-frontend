import type { AccountRole, ModuleKey, PermissionKey } from "@/shared/types";

export type IBillingStatus = "trialing" | "grace" | "active" | "suspended_unpaid";

export interface IBillingTierRef {
  id: string;
  label: string;
  priceInrPaise: number;
}

export interface IBillingSummary {
  organizationId: string;
  billingStatus: IBillingStatus;
  trialEndsAt: string | null;
  graceEndsAt: string | null;
  paidThrough: string | null;
  studentLimit: number | null;
  activeStudentCount: number;
  tier: IBillingTierRef | null;
  amountDuePaise: number | null;
  lastInvoice?: {
    tierId: string;
    tierLabel: string;
    studentCountAtBilling: number;
    amountPaise: number;
    markedPaidAt: string;
    markedPaidBy: string;
  } | null;
}

export interface IOrganization {
  id: string;
  name: string;
  description: string;
  country: string;
  users: string[];
  address: string;
  pincode: string;
  status: string;
  logo?: {
    publicId: string;
    url: string;
  };
  // differs per school
  myRole?: AccountRole | "student" | null;
  myPermissions?: PermissionKey[];
  // modules the school's package includes; unset = every module
  myModules?: ModuleKey[];
  letterhead?: ILetterhead;
}

// printed on certificates under the school name; every line optional
export interface ILetterhead {
  tagline: string;
  phone: string;
  email: string;
  website: string;
  board: string;
  registrationNo: string;
  affiliationNo: string;
  udiseCode: string;
  principalName: string;
  principalTitle: string;
}
