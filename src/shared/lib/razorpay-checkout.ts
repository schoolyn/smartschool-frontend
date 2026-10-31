// Razorpay's hosted checkout, loaded only when a parent first pays

interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
  theme?: { color: string };
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", callback: (response: { error: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

const SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
let loading: Promise<void> | null = null;

const loadScript = () => {
  if (window.Razorpay) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      reject(new Error("The payment window couldn't load. Check your connection and try again."));
    };
    document.body.appendChild(script);
  });
  return loading;
};

// resolves with the signed result, or null if closed; a failed attempt may be retried, closing then rejects
export const openRazorpayCheckout = async (options: Omit<RazorpayCheckoutOptions, "handler" | "modal">) => {
  await loadScript();
  return new Promise<RazorpaySuccess | null>((resolve, reject) => {
    let lastError: Error | null = null;
    const checkout = new window.Razorpay!({
      ...options,
      handler: resolve,
      modal: { ondismiss: () => (lastError ? reject(lastError) : resolve(null)) },
    });
    checkout.on("payment.failed", (response) => {
      lastError = new Error(response.error?.description || "The payment didn't go through.");
    });
    checkout.open();
  });
};
