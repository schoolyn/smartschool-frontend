import { PlusIcon } from "@heroicons/react/20/solid";

import CustomSelectDropdown from "@/shared/ui/custom-select";
import DataTable from "@/shared/ui/data-table";
import { useHeaderActions } from "@/shared/ui/section-header";
import DeleteConfirmationDialog from "@/shared/ui/delete-confirmation-dialog";
import { Button } from "@/shared/ui/kit/button";
import { CreateUpdateUserModal } from "./user-modal";
import { userColumns } from "./user-details-columns";
import useUserDetailsController from "./user-details-controller";

const UserDetails = () => {
  const {
    t,
    sortBy,
    form,
    isModalOpen,
    users,
    isEditUser,
    roleOptions,
    roleOptionsDropDown,
    searchTerm,
    searchInput,
    isDeleteModalOpen,
    onSearchInputChange,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalUsers,
    openAddUser,
    isSelf,
    deleteUserId,
    isFetchingGetAllUserDetails,
    isLoadingUpdateUserDetail,
    isLoadingAddUserDetail,
    isLoadingGetAllUserDetails,
    isLoadingDeleteUser,
    onCancel,
    onRoleChange,

    handleSubmituserDetails,
    handleDeleteUser,
    handleEditUserDetails,
    manageAccess,
    onClickDeleteUser,
    onCancelDeleteModal,
  } = useUserDetailsController();
  const roleFilterOptions = roleOptionsDropDown.map((option) => ({
    id: option.value,
    name: option.label,
    description: option.description,
    icon: option.icon,
  }));
  useHeaderActions({ action: { label: t("labels.add_user"), icon: PlusIcon, onClick: openAddUser } });

  const columns = userColumns({ t, isSelf, manageAccess, edit: handleEditUserDetails, remove: onClickDeleteUser });

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <DataTable
        columns={columns}
        data={users}
        getRowId={(user) => user.id}
        isLoading={isLoadingGetAllUserDetails || isFetchingGetAllUserDetails}
        search={{ placeholder: "Search users...", value: searchInput, onChange: onSearchInputChange }}
        pagination={{ page, pageSize, total: totalUsers, onPageChange: setPage, onPageSizeChange: setPageSize }}
        itemLabel={{ one: "user", other: "users" }}
        toolbar={
          <div className="w-56">
            <CustomSelectDropdown
              options={roleFilterOptions}
              value={roleFilterOptions.find((option) => option.id === sortBy) ?? null}
              onChange={(o) => onRoleChange(String(o.id))}
            />
          </div>
        }
        empty={
          searchTerm
            ? {
                title: "No matching users",
                description: `Nobody matches "${searchTerm}".`,
                action: (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      onSearchInputChange("");
                      onRoleChange("all");
                    }}
                  >
                    Clear search
                  </Button>
                ),
              }
            : { title: "No users yet", description: "Use Add User to invite the first teacher, accountant or admin." }
        }
      />

      <CreateUpdateUserModal
        t={t}
        isOpen={isModalOpen}
        form={form}
        roleOptions={roleOptions}
        isEditUser={isEditUser}
        isLoadingAddUserDetail={isLoadingAddUserDetail}
        isLoadingUpdateUserDetail={isLoadingUpdateUserDetail}
        onClose={onCancel}
        onSubmit={handleSubmituserDetails}
      />

      <DeleteConfirmationDialog
        open={isDeleteModalOpen}
        title="Remove from this school?"
        description={
          <>
            <span className="font-medium italic text-gray-700">
              {users?.find((u) => u.id === deleteUserId)?.name || "This user"}
            </span>{" "}
            will lose access to this school. If they belong to no other school, their account is deleted too. This
            cannot be undone.
          </>
        }
        confirmLabel="Remove"
        isLoading={isLoadingDeleteUser}
        onClose={onCancelDeleteModal}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
};

export default UserDetails;
