import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import useBillingBannerController from "../model/billing-banner-controller";

const BillingBanner = () => {
  const { message, tone } = useBillingBannerController();
  if (!message) return null;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 text-sm ${
        tone === "urgent" ? "bg-red-50 text-red-800" : "bg-yellow-50 text-yellow-800"
      }`}
    >
      <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
};

export default BillingBanner;
