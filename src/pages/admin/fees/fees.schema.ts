import { z } from "zod";

import { toPaise } from "@/shared/lib";

// rupees as typed, positive with at most two decimals
const rupees = z
  .string()
  .trim()
  .min(1, "Enter an amount.")
  .refine(
    (value) => /^\d+(\.\d{1,2})?$/.test(value) && Number(value) > 0,
    "Enter an amount above 0 (up to 2 decimals)."
  );

// optional money: blank means none
const optionalRupees = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || (/^\d+(\.\d{1,2})?$/.test(value) && Number(value) >= 0),
    "Enter an amount (up to 2 decimals), or leave it blank."
  );

export const feeHeadSchema = z.object({
  name: z.string().trim().min(1, "Enter a name."),
  code: z.string().trim().min(1, "Enter a code."),
  category: z.string().min(1),
  isRefundable: z.boolean(),
});
export type FeeHeadFormValues = z.infer<typeof feeHeadSchema>;
export const defaultFeeHeadValues: FeeHeadFormValues = { name: "", code: "", category: "tuition", isRefundable: false };

export const feeStructureSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a structure name."),
    classIds: z.array(z.string()).min(1, "Pick at least one class."),
    sectionIds: z.array(z.string()),
    items: z
      .array(z.object({ feeHeadId: z.string().min(1, "Pick a fee head."), amount: rupees }))
      .min(1, "Add at least one fee head item."),
    installments: z
      .array(
        z.object({
          label: z.string().trim().min(1, "Enter a label."),
          dueDate: z.string().min(1, "Pick a due date."),
          amount: rupees,
        })
      )
      .min(1, "Add at least one installment."),
    lateFeeAmount: optionalRupees,
    lateFeeGraceDays: z
      .string()
      .trim()
      .refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) <= 365), "Enter whole days, up to 365."),
  })
  .superRefine((value, ctx) => {
    const itemsTotal = value.items.reduce((sum, item) => sum + toPaise(item.amount || 0), 0);
    const installmentsTotal = value.installments.reduce((sum, item) => sum + toPaise(item.amount || 0), 0);
    if (itemsTotal !== installmentsTotal) {
      ctx.addIssue({
        code: "custom",
        path: ["installments", "root"],
        message: "Installments must add up to the items total.",
      });
    }
    // payments are recorded against an instalment's label, so two can't share one
    const labels = value.installments.map((row) => row.label.trim().toLowerCase());
    if (new Set(labels).size !== labels.length) {
      ctx.addIssue({
        code: "custom",
        path: ["installments", "root"],
        message: "Each installment needs its own label.",
      });
    }
  });

export const feeHeadEditSchema = z.object({
  name: z.string().trim().min(1, "Enter a name."),
  category: z.string().min(1),
  isRefundable: z.boolean(),
});
export type FeeHeadEditValues = z.infer<typeof feeHeadEditSchema>;
export type FeeStructureFormValues = z.infer<typeof feeStructureSchema>;
export const defaultFeeStructureValues = (): FeeStructureFormValues => ({
  name: "",
  classIds: [],
  sectionIds: [],
  items: [{ feeHeadId: "", amount: "" }],
  installments: [{ label: "Installment 1", dueDate: "", amount: "" }],
  lateFeeAmount: "",
  lateFeeGraceDays: "7",
});

export const paymentSchema = z.object({
  amount: rupees,
  method: z.string().min(1),
  instrumentRef: z.string().trim(),
});
export type PaymentFormValues = z.infer<typeof paymentSchema>;
export const defaultPaymentValues: PaymentFormValues = { amount: "", method: "cash", instrumentRef: "" };

export const concessionSchema = z.object({
  amount: rupees,
  reason: z.string().trim().min(1, "Enter a reason."),
  installmentLabel: z.string(),
});
export type ConcessionFormValues = z.infer<typeof concessionSchema>;
export const defaultConcessionValues: ConcessionFormValues = { amount: "", reason: "", installmentLabel: "" };
