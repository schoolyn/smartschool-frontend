import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { useError } from "@/shared/lib/hooks";
import { IFeeHead } from "@/entities/fee";
import {
  defaultFeeHeadValues,
  feeHeadEditSchema,
  FeeHeadEditValues,
  feeHeadSchema,
  FeeHeadFormValues,
} from "../fees.schema";
import { useCreateFeeHead, useDeactivateFeeHead, useGetFeeHeads, useUpdateFeeHead } from "@/entities/fee";

const useFeeHeadsController = (organizationId: string) => {
  const feeHeads = useGetFeeHeads(organizationId);
  const createFeeHead = useCreateFeeHead(organizationId);
  const updateFeeHead = useUpdateFeeHead(organizationId);
  const deactivateFeeHead = useDeactivateFeeHead(organizationId);
  useError({ mutation: createFeeHead });
  useError({ mutation: updateFeeHead });
  useError({ mutation: deactivateFeeHead });

  const form = useForm<FeeHeadFormValues>({
    resolver: zodResolver(feeHeadSchema),
    defaultValues: defaultFeeHeadValues,
  });
  const editForm = useForm<FeeHeadEditValues>({
    resolver: zodResolver(feeHeadEditSchema),
    defaultValues: { name: "", category: "tuition", isRefundable: false },
  });
  const [editing, setEditing] = useState<IFeeHead | null>(null);
  const [retiring, setRetiring] = useState<IFeeHead | null>(null);

  const openEdit = (head: IFeeHead) => {
    editForm.reset({ name: head.name, category: head.category || "misc", isRefundable: head.isRefundable });
    setEditing(head);
  };

  const onEditSubmit = editForm.handleSubmit((value) => {
    if (!editing) return;
    updateFeeHead.mutate(
      { feeHeadId: editing.id, value },
      {
        onSuccess: () => {
          toast.success("Fee head updated.");
          setEditing(null);
        },
      }
    );
  });

  const onRetire = () => {
    if (!retiring) return;
    deactivateFeeHead.mutate(retiring.id, {
      onSuccess: () => {
        toast.success(`${retiring.name} removed. Structures already using it are unchanged.`);
        setRetiring(null);
      },
    });
  };

  const onSubmit = form.handleSubmit((values) =>
    createFeeHead.mutate(values, {
      onSuccess: () => {
        toast.success("Fee head created.");
        form.reset(defaultFeeHeadValues);
      },
    })
  );

  return {
    form,
    editForm,
    onSubmit,
    onEditSubmit,
    onRetire,
    items: feeHeads.data?.items ?? [],
    isLoading: feeHeads.isLoading,
    isError: feeHeads.isError,
    error: feeHeads.error,
    retry: () => feeHeads.refetch(),
    isCreating: createFeeHead.isPending,
    isUpdating: updateFeeHead.isPending,
    isRetiring: deactivateFeeHead.isPending,
    editing,
    closeEdit: () => setEditing(null),
    openEdit,
    retiring,
    setRetiring,
  };
};

export default useFeeHeadsController;
