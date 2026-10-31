import { useAuth, useTenant } from "@/entities/session";
import { useGetMyBillingSummary } from "../api/billing-banner-service";

const daysLeft = (dateString: string | null) => {
  if (!dateString) return null;
  return Math.ceil((new Date(dateString).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
};

// admin only: parents and teachers can't pay, and a locked-out school never reaches here
const useBillingBannerController = () => {
  const { organizationId, role } = useTenant();
  const { user } = useAuth();
  const summary = useGetMyBillingSummary(user?.isPlatformAdmin || role !== "admin" ? "" : organizationId);

  if (!summary.data) return { message: null, tone: "warning" as const };
  const { billingStatus, trialEndsAt, graceEndsAt, studentLimit, activeStudentCount } = summary.data;

  let message: string | null = null;
  let tone: "warning" | "urgent" = "warning";

  if (billingStatus === "trialing") {
    const left = daysLeft(trialEndsAt);
    if (left !== null && left <= 7) {
      message =
        left > 0
          ? `Your free trial ends in ${left} day${left === 1 ? "" : "s"}. Contact us to arrange payment and keep access.`
          : "Your free trial has ended. Contact us to arrange payment and keep access.";
    }
  } else if (billingStatus === "grace") {
    const left = daysLeft(graceEndsAt);
    message =
      left !== null && left > 0
        ? `Your trial has ended. Please contact us to arrange payment within ${left} day${left === 1 ? "" : "s"} to avoid losing access.`
        : "Your trial has ended. Please contact us to arrange payment to avoid losing access.";
    tone = "urgent";
  } else if (billingStatus === "active" && studentLimit != null && activeStudentCount >= studentLimit * 0.9) {
    message = `You're close to your plan's student limit (${activeStudentCount} of ${studentLimit}). Contact us to upgrade.`;
  }

  return { message, tone };
};

export default useBillingBannerController;
