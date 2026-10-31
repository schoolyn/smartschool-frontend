import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { useModuleLock } from "@/shared/lib/module-lock";
import { useAreaBase, useCan, useTenant } from "@/entities/session";
import { useError } from "@/shared/lib/hooks";
import { CertificateType, ICertificate } from "@/entities/certificate";
import { IAPIError } from "@/shared/types";
import {
  downloadCertificatePdf,
  useCertificateDraft,
  useCertificates,
  useDuplicateCertificate,
  useIssueCertificate,
} from "@/entities/certificate";
import {
  bonafideDefaults,
  bonafideSchema,
  BonafideFormValues,
  transferDefaults,
  transferSchema,
  TransferFormValues,
} from "./issue-certificate.schema";

const rupees = (paise: number) => `Rs. ${(paise / 100).toLocaleString("en-IN")}`;

const useIssueCertificateController = () => {
  const { studentId = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const type: CertificateType = searchParams.get("type") === "transfer" ? "transfer" : "bonafide";
  const { organizationId = "", organization } = useTenant();
  const areaBase = useAreaBase();
  const { readOnly } = useModuleLock();
  const canIssue = useCan()("certificates.issue") && !readOnly;

  const draft = useCertificateDraft(organizationId, studentId, type);
  const history = useCertificates(organizationId, 1, 50, { studentId });
  const issue = useIssueCertificate(organizationId);
  const duplicate = useDuplicateCertificate(organizationId);
  useError({ mutation: issue });
  useError({ mutation: duplicate });
  const [confirmTc, setConfirmTc] = useState(false);

  const bonafideForm = useForm<BonafideFormValues>({
    resolver: zodResolver(bonafideSchema),
    defaultValues: bonafideDefaults(),
  });
  const transferForm = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: transferDefaults(),
  });

  // the remembered answers arrive with the draft
  useEffect(() => {
    if (!draft.data) return;
    if (!bonafideForm.formState.isDirty) bonafideForm.reset(bonafideDefaults(draft.data));
    if (!transferForm.formState.isDirty) transferForm.reset(transferDefaults(draft.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.data]);

  const download = async (certificate: ICertificate) => {
    try {
      await downloadCertificatePdf(organizationId, certificate);
    } catch (error) {
      toast.error((error as IAPIError)?.response?.Error?.message || "Could not download the certificate.");
    }
  };

  const issued = (certificate: ICertificate) => {
    toast.success(`${certificate.number} issued. Downloading the PDF.`);
    download(certificate);
  };

  const onIssueBonafide = bonafideForm.handleSubmit((values) =>
    issue.mutate(
      {
        type: "bonafide",
        body: {
          studentId,
          gender: values.gender,
          parentName: values.parentName,
          purpose: values.purposeChoice === "other" ? values.purposeOther : values.purposeChoice,
        },
      },
      {
        onSuccess: (certificate) => {
          bonafideForm.reset({ ...values, purposeChoice: "", purposeOther: "" });
          issued(certificate);
        },
      }
    )
  );

  // a TC ends the enrollment, so it is confirmed first
  const onReviewTransfer = transferForm.handleSubmit(() => setConfirmTc(true));
  const onIssueTransfer = () =>
    issue.mutate(
      { type: "transfer", body: { studentId, ...transferForm.getValues() } },
      {
        onSuccess: (certificate) => {
          setConfirmTc(false);
          transferForm.reset(transferForm.getValues());
          issued(certificate);
        },
        onError: () => setConfirmTc(false),
      }
    );

  const records = draft.data?.records;
  const duePaise = records?.duePaise ?? 0;

  return {
    organizationId,
    type,
    setType: (next: CertificateType) =>
      setSearchParams(next === "transfer" ? { type: "transfer" } : {}, { replace: true }),
    draft: draft.data,
    isLoading: draft.isLoading,
    loadError: draft.isError ? draft.error : null,
    retry: () => draft.refetch(),
    studentsPath: `${areaBase}/students`,
    registerPath: `${areaBase}/certificates`,
    letterhead: organization?.letterhead,
    canIssue,
    readOnly,
    enrolled: draft.data?.student.status === "active" && !!draft.data?.student.academicYearId,
    bonafideForm,
    transferForm,
    onIssueBonafide,
    onReviewTransfer,
    onIssueTransfer,
    confirmTc,
    closeConfirmTc: () => setConfirmTc(false),
    isIssuing: issue.isPending,
    dueText: duePaise > 0 ? `${rupees(duePaise)} unpaid` : "",
    history: history.data?.rows ?? [],
    isLoadingHistory: history.isLoading,
    download,
    duplicate: canIssue ? (certificate: ICertificate) => duplicate.mutate(certificate) : undefined,
    duplicatingId: duplicate.isPending ? duplicate.variables?.id : undefined,
  };
};

export default useIssueCertificateController;
