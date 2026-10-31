// how each payment method reads on screen and in exports
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  cheque: "Cheque",
  bank_transfer: "Bank transfer",
  upi: "UPI",
  card: "Card",
  online: "Online",
  other: "Other",
};

export const paymentMethodLabel = (method: string) => PAYMENT_METHOD_LABELS[method] ?? method;
