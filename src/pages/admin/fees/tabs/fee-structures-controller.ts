import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { useError } from "@/shared/lib/hooks";
import { IFeeStructure } from "@/entities/fee";
import { SelectOption } from "@/shared/types";
import { toPaise } from "@/shared/lib";
import { useGetAcademicYears, useGetClasses, useGetYearSections } from "@/entities/academics";
import { defaultFeeStructureValues, feeStructureSchema, FeeStructureFormValues } from "../fees.schema";
import {
  useAssignFeeStructure,
  useCreateFeeStructure,
  useGetFeeHeads,
  useGetFeeStructures,
  useUpdateFeeStructure,
} from "@/entities/fee";

const sumPaise = (rows: { amount: string }[] = []) =>
  rows.reduce((sum, row) => sum + (toPaise(row.amount || 0) || 0), 0);

// an edited structure may use a removed head or another year's classes; keep those listed so they show
const withEditing = (options: SelectOption[], extra: SelectOption[] = []) => [
  ...options,
  ...extra.filter((option) => !options.some((known) => known.id === option.id)),
];

const useFeeStructuresController = (organizationId: string) => {
  const years = useGetAcademicYears(organizationId);
  const currentYearId = years.data?.items.find((year) => year.isCurrent)?.id;
  const classes = useGetClasses(organizationId, currentYearId, "active");
  const sections = useGetYearSections(organizationId, currentYearId);
  const feeHeads = useGetFeeHeads(organizationId);
  const structures = useGetFeeStructures(organizationId);
  const createStructure = useCreateFeeStructure(organizationId);
  const assignStructure = useAssignFeeStructure(organizationId);
  const updateStructure = useUpdateFeeStructure(organizationId);
  useError({ mutation: createStructure });
  useError({ mutation: assignStructure });
  useError({ mutation: updateStructure });
  // the structure being edited in the form above, if any
  const [editing, setEditing] = useState<IFeeStructure | null>(null);
  const [applyToUnpaid, setApplyToUnpaid] = useState(false);

  const form = useForm<FeeStructureFormValues>({
    resolver: zodResolver(feeStructureSchema),
    defaultValues: defaultFeeStructureValues(),
  });
  const items = useFieldArray({ control: form.control, name: "items" });
  const installments = useFieldArray({ control: form.control, name: "installments" });
  const [classIds, itemRows, installmentRows] = useWatch({
    control: form.control,
    name: ["classIds", "items", "installments"],
  });

  const classOptions = withEditing(
    (classes.data?.items ?? []).map((klass) => ({ id: klass.id, name: klass.name })),
    editing?.classIds
  );
  // only sections of the ticked classes, named with their class since several classes have an "A"
  const sectionOptions = withEditing(
    (sections.data?.items ?? [])
      .filter((section) => classIds.includes(section.classId))
      .map((section) => ({
        id: section.id,
        name: `${classOptions.find((klass) => klass.id === section.classId)?.name ?? ""} - ${section.name}`,
      })),
    editing?.sectionIds
  );
  const feeHeadOptions = withEditing(
    (feeHeads.data?.items ?? []).map((head) => ({ id: head.id, name: head.name })),
    editing?.items.flatMap((item) => (item.feeHeadId ? [{ id: item.feeHeadId.id, name: item.feeHeadId.name }] : []))
  );

  // unticking a class also drops any of its sections that were picked
  const onClassesChange = (nextClassIds: string[]) => {
    const allowed = new Set(
      (sections.data?.items ?? [])
        .filter((section) => nextClassIds.includes(section.classId))
        .map((section) => section.id)
    );
    form.setValue(
      "sectionIds",
      form.getValues("sectionIds").filter((id) => allowed.has(id))
    );
  };

  const startEdit = (structure: IFeeStructure) => {
    form.reset({
      name: structure.name,
      classIds: structure.classIds.map((klass) => klass.id),
      sectionIds: structure.sectionIds.map((section) => section.id),
      items: structure.items.map((item) => ({
        feeHeadId: item.feeHeadId?.id ?? "",
        amount: String(item.amount / 100),
      })),
      installments: structure.installments.map((row) => ({
        label: row.label,
        dueDate: row.dueDate.slice(0, 10),
        amount: String(row.amount / 100),
      })),
      lateFeeAmount: structure.lateFee?.amount ? String(structure.lateFee.amount / 100) : "",
      lateFeeGraceDays: String(structure.lateFee?.graceDays ?? 7),
    });
    setApplyToUnpaid(false);
    setEditing(structure);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stopEdit = () => {
    setEditing(null);
    form.reset(defaultFeeStructureValues());
  };

  const onSubmit = form.handleSubmit((values) => {
    const body = {
      name: values.name,
      classIds: values.classIds,
      sectionIds: values.sectionIds,
      items: values.items.map((item) => ({ feeHeadId: item.feeHeadId, amount: toPaise(item.amount) })),
      installments: values.installments.map((row) => ({
        label: row.label,
        dueDate: row.dueDate,
        amount: toPaise(row.amount),
      })),
      lateFee: {
        amount: values.lateFeeAmount ? toPaise(values.lateFeeAmount) : 0,
        graceDays: Number(values.lateFeeGraceDays || 0),
      },
    };
    if (editing) {
      updateStructure.mutate(
        { feeStructureId: editing.id, value: { ...body, applyToUnpaid } },
        {
          onSuccess: (result) => {
            toast.success(
              !result.newVersion
                ? "Fee structure updated."
                : result.moved_count
                  ? `Saved as a new version. ${result.moved_count} student(s) moved to the new amounts; ${result.kept_count} keep what they were billed.`
                  : `Saved as a new version. ${result.kept_count} student(s) already billed keep their amounts.`
            );
            stopEdit();
          },
        }
      );
      return;
    }
    // a new structure belongs to the current year; edits keep their own
    if (!currentYearId) {
      toast.error("Set a current academic year first (Academics page).");
      return;
    }
    createStructure.mutate(
      { academicYearId: currentYearId, ...body },
      {
        onSuccess: () => {
          toast.success("Fee structure created.");
          form.reset(defaultFeeStructureValues());
        },
      }
    );
  });

  const onAssign = (feeStructureId: string) =>
    assignStructure.mutate(feeStructureId, {
      onSuccess: (data) =>
        toast.success(`Assigned to ${data.assigned_count} student(s), skipped ${data.skipped_count} already assigned.`),
    });

  return {
    form,
    items,
    installments,
    classIds,
    classOptions,
    sectionOptions,
    feeHeadOptions,
    isLoadingFeeHeads: feeHeads.isLoading,
    onClassesChange,
    itemsTotal: sumPaise(itemRows),
    installmentsTotal: sumPaise(installmentRows),
    installmentsError: form.formState.errors.installments?.root?.message,
    editing,
    applyToUnpaid,
    setApplyToUnpaid,
    startEdit,
    stopEdit,
    onSubmit,
    isSaving: createStructure.isPending || updateStructure.isPending,
    structures: structures.data?.items ?? [],
    isLoadingStructures: structures.isLoading,
    structuresError: structures.isError ? structures.error : null,
    retryStructures: () => structures.refetch(),
    onAssign,
    // which structure is being assigned right now, for its button's spinner
    assigningId: assignStructure.isPending ? assignStructure.variables : null,
  };
};

export default useFeeStructuresController;
