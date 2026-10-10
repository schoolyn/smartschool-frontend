import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  useGetAccounts,
  useCreateAccount,
  useAddOrganizationToAccount,
  useUpdateAccountStatus,
} from "./service/platform-service";
import { ICreateAccountValue, IAddOrganizationToAccountValue } from "@/types";

export const usePlatformController = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [addSchoolAccountId, setAddSchoolAccountId] = useState<string | null>(null);

  const accounts = useGetAccounts();
  const createAccount = useCreateAccount();
  const addOrganization = useAddOrganizationToAccount(addSchoolAccountId || "");
  const updateStatus = useUpdateAccountStatus();

  useEffect(() => {
    if (createAccount.isSuccess) {
      toast.success(
        createAccount.data?.ownerInvited
          ? "Customer created — an invite email was sent to the owner."
          : "Customer created — the existing owner now has access.",
      );
      setIsCreateModalOpen(false);
    }
    if (createAccount.isError) {
      toast.error(createAccount.error?.response?.Error?.message || "Failed to create customer");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createAccount.isSuccess, createAccount.isError]);

  useEffect(() => {
    if (addOrganization.isSuccess) {
      toast.success("School added successfully.");
      setAddSchoolAccountId(null);
    }
    if (addOrganization.isError) {
      toast.error(addOrganization.error?.response?.Error?.message || "Failed to add school");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addOrganization.isSuccess, addOrganization.isError]);

  useEffect(() => {
    if (updateStatus.isError) {
      toast.error(updateStatus.error?.response?.Error?.message || "Failed to update status");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateStatus.isError]);

  const handleCreateAccount = (value: ICreateAccountValue) => createAccount.mutate(value);
  const handleAddOrganization = (value: IAddOrganizationToAccountValue) => addOrganization.mutate(value);
  const handleToggleStatus = (accountId: string, currentStatus: string) => {
    updateStatus.mutate({ accountId, status: currentStatus === "suspended" ? "active" : "suspended" });
  };

  return {
    accounts: accounts.data?.items || [],
    isLoading: accounts.isLoading,
    isCreateModalOpen,
    setIsCreateModalOpen,
    handleCreateAccount,
    isCreatingAccount: createAccount.isPending,
    addSchoolAccountId,
    setAddSchoolAccountId,
    handleAddOrganization,
    isAddingOrganization: addOrganization.isPending,
    handleToggleStatus,
    isUpdatingStatus: updateStatus.isPending,
  };
};
