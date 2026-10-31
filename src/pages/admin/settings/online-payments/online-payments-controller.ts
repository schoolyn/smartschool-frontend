import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { useError } from "@/shared/lib/hooks";
import { defaultOnlinePaymentsValues, onlinePaymentsSchema, OnlinePaymentsFormValues } from "./online-payments.schema";
import { useGetOnlinePaymentSettings, useSaveOnlinePaymentSettings } from "@/entities/online-payment";

// the school connects its own Razorpay account, so parents' fees go straight to the school's bank
const useOnlinePaymentsController = () => {
  const { organizationId = "" } = useParams();
  const settings = useGetOnlinePaymentSettings(organizationId);
  const save = useSaveOnlinePaymentSettings(organizationId);
  useError({ mutation: save });

  const form = useForm<OnlinePaymentsFormValues>({
    resolver: zodResolver(onlinePaymentsSchema),
    defaultValues: defaultOnlinePaymentsValues,
  });
  // filled on load and after new keys are saved; turning the switch leaves typed values alone
  const savedKeyId = settings.data?.keyId;
  const connectedAt = settings.data?.connectedAt;
  useEffect(() => {
    if (savedKeyId !== undefined) form.reset({ keyId: savedKeyId, keySecret: "", webhookSecret: "" });
  }, [savedKeyId, connectedAt, form]);

  const webhookUrl = `${import.meta.env.VITE_API_URL}/payment-webhook/v1/razorpay/${organizationId}`;

  const submit = form.handleSubmit((values) => {
    // blank secrets keep the saved ones, so they are only sent when typed
    save.mutate(
      {
        keyId: values.keyId || undefined,
        keySecret: values.keySecret || undefined,
        webhookSecret: values.webhookSecret || undefined,
      },
      { onSuccess: () => toast.success("Razorpay keys saved and checked.") }
    );
  });

  const toggle = (enabled: boolean) =>
    save.mutate(
      { enabled },
      {
        onSuccess: () =>
          toast.success(enabled ? "Parents can now pay fees online." : "Online fee payments turned off."),
      }
    );

  const copyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook address copied.");
    } catch {
      toast.error("Couldn't copy. Select the address and copy it instead.");
    }
  };

  const data = settings.data;
  return {
    settings,
    data,
    connected: Boolean(data?.keyId && data?.hasKeySecret),
    form,
    submit,
    isSaving: save.isPending,
    toggle,
    webhookUrl,
    copyWebhook,
  };
};

export default useOnlinePaymentsController;
