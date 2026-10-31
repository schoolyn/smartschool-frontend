import { z } from "zod";

export const onlinePaymentsSchema = z.object({
  keyId: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^rzp_(test|live)_[A-Za-z0-9]+$/.test(value),
      "A Razorpay key id starts with rzp_test_ or rzp_live_."
    ),
  keySecret: z.string().trim(),
  webhookSecret: z.string().trim(),
});
export type OnlinePaymentsFormValues = z.infer<typeof onlinePaymentsSchema>;
export const defaultOnlinePaymentsValues: OnlinePaymentsFormValues = { keyId: "", keySecret: "", webhookSecret: "" };
