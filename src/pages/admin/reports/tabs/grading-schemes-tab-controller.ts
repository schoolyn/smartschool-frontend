import { useState } from "react";
import { PlusIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";

import { useHeaderActions } from "@/shared/ui/section-header";
import { useError } from "@/shared/lib/hooks";
import { IGradingScheme } from "@/entities/exam";
import { useDeleteGradingScheme, useGetGradingSchemes } from "@/entities/exam";

const useGradingSchemesTabController = (organizationId: string) => {
  const schemes = useGetGradingSchemes(organizationId);
  const deleteScheme = useDeleteGradingScheme(organizationId);
  useError({ mutation: deleteScheme });

  // undefined = closed, null = creating, a scheme = editing it
  const [editing, setEditing] = useState<IGradingScheme | null | undefined>(undefined);
  const [toDelete, setToDelete] = useState<IGradingScheme | null>(null);

  useHeaderActions({ action: { label: "Create scheme", icon: PlusIcon, onClick: () => setEditing(null) } });

  const confirmDelete = () =>
    toDelete &&
    deleteScheme.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success("Grading scheme removed.");
        setToDelete(null);
      },
      onError: () => setToDelete(null),
    });

  return {
    schemes: schemes.data?.items ?? [],
    isLoading: schemes.isLoading,
    error: schemes.isError ? schemes.error : null,
    retry: () => schemes.refetch(),
    editing,
    openCreate: () => setEditing(null),
    openEdit: (scheme: IGradingScheme) => setEditing(scheme),
    closeForm: () => setEditing(undefined),
    toDelete,
    askDelete: setToDelete,
    cancelDelete: () => setToDelete(null),
    confirmDelete,
    isDeleting: deleteScheme.isPending,
  };
};

export default useGradingSchemesTabController;
