import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { useError } from "@/shared/lib/hooks";
import { IGradingScheme } from "@/entities/exam";
import {
  CBSE_SCALE,
  defaultGradingSchemeValues,
  gradingSchemeSchema,
  GradingSchemeFormValues,
  toSchemeBands,
} from "../../reports.schema";
import { useCreateGradingScheme, useUpdateGradingScheme } from "@/entities/exam";

interface SchemeFormDialogControllerArgs {
  organizationId: string;
  // set to edit that scheme; left out to create one
  scheme?: IGradingScheme;
  open: boolean;
  onClose: () => void;
}

const valuesOf = (scheme: IGradingScheme): GradingSchemeFormValues => ({
  name: scheme.name,
  passPercent: String(scheme.passPercent),
  bands: [...scheme.bands]
    .sort((a, b) => b.minPercent - a.minPercent)
    .map((band) => ({ grade: band.grade, minPercent: String(band.minPercent), gradePoint: String(band.gradePoint) })),
});

const useSchemeFormDialogController = ({ organizationId, scheme, open, onClose }: SchemeFormDialogControllerArgs) => {
  const createScheme = useCreateGradingScheme(organizationId);
  const updateScheme = useUpdateGradingScheme(organizationId);
  useError({ mutation: createScheme });
  useError({ mutation: updateScheme });

  const form = useForm<GradingSchemeFormValues>({
    resolver: zodResolver(gradingSchemeSchema),
    defaultValues: defaultGradingSchemeValues(),
  });
  const bands = useFieldArray({ control: form.control, name: "bands" });
  const typed = useWatch({ control: form.control, name: "bands" });

  useEffect(() => {
    if (open) form.reset(scheme ? valuesOf(scheme) : defaultGradingSchemeValues());
  }, [open, scheme, form]);

  // the range each typed band covers, e.g. "91 - 100", once its start is filled in
  const rangeOf = (index: number) => {
    const start = typed?.[index]?.minPercent;
    if (start === undefined || start === "" || !Number.isFinite(Number(start))) return "";
    const higher = (typed ?? [])
      .map((band) => Number(band.minPercent))
      .filter((value) => Number.isFinite(value) && value > Number(start));
    const end = higher.length ? Math.min(...higher) - 0.01 : 100;
    return `${Number(start)} - ${Math.round(end * 100) / 100}%`;
  };

  const fillCbse = () => {
    if (!form.getValues("name")) form.setValue("name", "CBSE 9-point");
    form.setValue("passPercent", "33");
    bands.replace(CBSE_SCALE);
    form.clearErrors();
  };

  const onSubmit = form.handleSubmit((values) => {
    const payload = { name: values.name, passPercent: Number(values.passPercent), bands: toSchemeBands(values.bands) };
    const done = (message: string) => () => {
      toast.success(message);
      onClose();
    };
    if (scheme) updateScheme.mutate({ schemeId: scheme.id, ...payload }, { onSuccess: done("Grading scheme saved.") });
    else createScheme.mutate(payload, { onSuccess: done("Grading scheme created.") });
  });

  return {
    form,
    bands,
    rangeOf,
    fillCbse,
    addBand: () => bands.append({ grade: "", minPercent: "", gradePoint: "" }),
    onSubmit,
    isEdit: !!scheme,
    isSaving: createScheme.isPending || updateScheme.isPending,
    bandsError: form.formState.errors.bands?.root?.message ?? form.formState.errors.bands?.message,
  };
};

export default useSchemeFormDialogController;
