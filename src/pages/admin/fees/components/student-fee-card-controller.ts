import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { useCan } from "@/entities/session";
import { useError } from "@/shared/lib/hooks";
import { IStudentFeeSummary } from "@/entities/fee";
import { SelectOption } from "@/shared/types";
import { toPaise } from "@/shared/lib";
import {
  concessionSchema,
  ConcessionFormValues,
  defaultConcessionValues,
  defaultPaymentValues,
  paymentSchema,
  PaymentFormValues,
} from "../fees.schema";
import { useDownloadFeeReceipt, useGrantConcession, useRecordPayment } from "@/entities/fee";

// a select option cannot have an empty value
const ANY_INSTALLMENT = "any";

const useStudentFeeCardController = (organizationId: string, summary: IStudentFeeSummary) => {
  const recordPayment = useRecordPayment(organizationId);
  const grantConcession = useGrantConcession(organizationId);
  const downloadReceipt = useDownloadFeeReceipt(organizationId);
  const can = useCan();
  useError({ mutation: recordPayment });
  useError({ mutation: downloadReceipt });
  useError({ mutation: grantConcession });

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: defaultPaymentValues,
  });
  const concessionDefaults = { ...defaultConcessionValues, installmentLabel: ANY_INSTALLMENT };
  const concessionForm = useForm<ConcessionFormValues>({
    resolver: zodResolver(concessionSchema),
    defaultValues: concessionDefaults,
  });

  const onRecordPayment = paymentForm.handleSubmit((values) =>
    recordPayment.mutate(
      {
        studentFeeId: summary.studentFeeId,
        amount: toPaise(values.amount),
        method: values.method,
        instrumentRef: values.instrumentRef || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Payment recorded.");
          paymentForm.reset(defaultPaymentValues);
        },
      }
    )
  );

  const onGrantConcession = concessionForm.handleSubmit((values) =>
    grantConcession.mutate(
      {
        studentFeeId: summary.studentFeeId,
        amount: toPaise(values.amount),
        reason: values.reason,
        installmentLabel: values.installmentLabel === ANY_INSTALLMENT ? undefined : values.installmentLabel,
      },
      {
        onSuccess: () => {
          toast.success("Concession granted.");
          concessionForm.reset(concessionDefaults);
        },
      }
    )
  );

  const installmentOptions: SelectOption[] = [
    { id: ANY_INSTALLMENT, name: "Any installment (oldest first)" },
    ...summary.installments.map((row) => ({ id: row.label, name: row.label })),
  ];
  const reversedIds = new Set(summary.payments.map((payment) => payment.reversalOfPaymentId).filter(Boolean));

  return {
    paymentForm,
    concessionForm,
    onRecordPayment,
    onGrantConcession,
    isRecording: recordPayment.isPending,
    isGranting: grantConcession.isPending,
    downloadReceipt: (paymentId: string) => downloadReceipt.mutate(paymentId),
    downloadingId: downloadReceipt.isPending ? downloadReceipt.variables : undefined,
    installmentOptions,
    canCollect: can("fees.collect"),
    canConcede: can("fees.concession"),
    // a payment can be reversed once, by someone allowed to
    canReverse: (paymentId: string) => can("fees.reverse") && !reversedIds.has(paymentId),
  };
};

export default useStudentFeeCardController;
