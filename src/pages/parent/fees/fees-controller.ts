import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { downloadFeeReceipt, useEmailFeeReceipt, useGetMyFees } from "@/entities/fee";
import { IAPIError } from "@/shared/types";
import { usePayFeesOnline } from "@/entities/online-payment";

const useParentFeesController = () => {
  const { t } = useTranslation();
  const { organizationId } = useParams();

  const getMyFees = useGetMyFees(organizationId || "");
  const fees = getMyFees.data?.items || [];
  const payFeesOnline = usePayFeesOnline(organizationId || "");
  const emailFeeReceipt = useEmailFeeReceipt(organizationId || "");
  // which fee (and instalment) is being paid right now, for its button's spinner
  const paying = payFeesOnline.isPending ? payFeesOnline.variables : null;

  const payOnline = (studentFeeId: string, installmentLabels?: string[]) =>
    payFeesOnline.mutate(
      { studentFeeId, installmentLabels },
      {
        onSuccess: (outcome) => {
          if (outcome === "paid") toast.success("Payment received. Your receipt is ready below.");
          else if (outcome === "needs_review") toast("Payment received. The school will apply it shortly.");
          else if (outcome === "pending")
            toast("Payment received. We're confirming it, and your receipt will appear here shortly.");
        },
        onError: (error) =>
          toast.error(
            (error as IAPIError)?.response?.Error?.message ||
              (error as Error)?.message ||
              "The payment didn't go through."
          ),
      }
    );

  const isPaying = (studentFeeId: string, label?: string) =>
    paying?.studentFeeId === studentFeeId &&
    (label ? paying.installmentLabels?.[0] === label : !paying.installmentLabels);

  const downloadReceipt = async (paymentId: string) => {
    try {
      await downloadFeeReceipt(organizationId || "", paymentId);
    } catch (error) {
      toast.error(
        (error as IAPIError)?.response?.Error?.message || "Could not download the receipt. Please try again."
      );
    }
  };

  const emailReceipt = (paymentId: string) =>
    emailFeeReceipt.mutate(paymentId, {
      onSuccess: () => toast.success("Receipt emailed to your registered email address."),
      // for example "No registered email address found" says what to fix
      onError: (error) =>
        toast.error(error?.response?.Error?.message || "Could not email the receipt. Please try again."),
    });

  return {
    t,
    fees,
    canPayOnline: Boolean(getMyFees.data?.onlinePaymentsEnabled),
    payOnline,
    paying,
    isPaying,
    downloadReceipt,
    emailReceipt,
    isEmailing: emailFeeReceipt.isPending,
    isLoading: getMyFees.isLoading,
    // a failed load shows an error with a retry, not an empty page
    loadError: getMyFees.isError ? getMyFees.error : null,
    retryLoad: () => getMyFees.refetch(),
  };
};

export default useParentFeesController;
