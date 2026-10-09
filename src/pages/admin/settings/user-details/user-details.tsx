import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import Spinner from "@/components/spinner";
import NoRecordFound from "@/components/no-record-found";
import CustomSelectDropdown from "@/components/custom-select";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/table";
import { CreateUpdateUserModal } from "./user-modal";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import useUserDetailsController from "./user-details-controller";

const UserDetails = () => {
  const {
    t,
    sortBy,
    form,
    isModalOpen,
    isEditingSelf,
    users,
    isEditUser,
    roleOptions,
    permissionOptions,
    roleOptionsDropDown,
    searchTerm,
    isDeleteModalOpen,
    onSearchInputChange,
    deleteUserId,
    isFetchingGetAllUserDetails,
    isLoadingUpdateUserDetail,
    isLoadingAddUserDetail,
    isLoadingGetAllUserDetails,
    isLoadingDeleteUser,
    onCancel,
    onRoleChange,
    setSortBy,
    setIsModalOpen,
    handleSubmituserDetails,
    handlePermissionChange,
    setSearchTerm,
    handleDeleteUser,
    handleEditUserDetails,
    onClickDeleteUser,
    onCancelDeleteModal,
  } = useUserDetailsController();

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        {/* Search field */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            onChange={(e) => {
              e.preventDefault();
              onSearchInputChange(e.target.value);
            }}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        <div className="flex items-center space-x-4">
          {/* Role filter dropdown */}
          <div className="w-56">
            <CustomSelectDropdown
              options={roleOptionsDropDown.map((option) => ({
                id: option.value,
                name: option.label,
                description: option.description,
                icon: option.icon,
              }))}
              value={(() => {
                const match = roleOptionsDropDown.find((option) => option.value === sortBy);
                return match
                  ? { id: match.value, name: match.label, description: match.description, icon: match.icon }
                  : null;
              })()}
              onChange={(o) => onRoleChange(String(o.id))}
            />
          </div>

          {/* Add user  */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {t("labels.add_user")}
          </button>
        </div>
      </div>

      {/* Table Section */}
      {isLoadingGetAllUserDetails ? (
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <Spinner />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableHead>{t("labels.username")}</TableHead>
            <TableHead className="text-center">{t("labels.email")}</TableHead>
            <TableHead className="text-center">{t("labels.role")}</TableHead>
            <TableHead className="text-center">{t("labels.actions")}</TableHead>
          </TableHeader>
          {isFetchingGetAllUserDetails ? (
            <TableBody>
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center">
                  <div className="flex justify-center items-center">
                    <div className="h-8 w-8 border-t-2 border-b-2 border-primary-500 rounded-full animate-spin"></div>
                  </div>
                </td>
              </tr>
            </TableBody>
          ) : users && users.length > 0 ? (
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-gray-900">{user.name}</TableCell>
                  <TableCell className="text-center">{user.email}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "admin" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      className={`text-primary-600 mr-4 ${
                        user.permissions?.canUpdate ? "" : "cursor-not-allowed opacity-50"
                      }`}
                      title={t("messages.you_dont_have_permission_to_edit_user")}
                      onClick={() => handleEditUserDetails(user.id, true)}
                    >
                      {t("labels.edit")}
                    </button>
                    <button
                      className={`text-red-600 ${user.permissions?.canDelete ? "" : "cursor-not-allowed opacity-50"}`}
                      title={t("messages.you_dont_have_permission_to_delete_user")}
                      onClick={() => onClickDeleteUser(user.id)}
                    >
                      {t("labels.delete")}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableBody>
              <tr>
                <td colSpan={4}>
                  <NoRecordFound
                    t={t}
                    searchTerm={searchTerm}
                    clearFilters={() => {
                      setSearchTerm("");
                      setSortBy("all");
                    }}
                  />
                </td>
              </tr>
            </TableBody>
          )}
        </Table>
      )}

      <CreateUpdateUserModal
        t={t}
        isOpen={isModalOpen}
        form={form}
        roleOptions={roleOptions}
        permissionOptions={permissionOptions}
        isEditUser={isEditUser}
        isEditingSelf={isEditingSelf}
        isLoadingAddUserDetail={isLoadingAddUserDetail}
        isLoadingUpdateUserDetail={isLoadingUpdateUserDetail}
        onClose={onCancel}
        onSubmit={handleSubmituserDetails}
        handlePermissionChange={handlePermissionChange}
      />

      <DeleteConfirmationDialog
        open={isDeleteModalOpen}
        title="Delete User"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-medium italic text-gray-700">
              {users?.find((u) => u.id === deleteUserId)?.name || "this user"}
            </span>
            ? This action cannot be undone.
          </>
        }
        isLoading={isLoadingDeleteUser}
        onClose={onCancelDeleteModal}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
};

export default UserDetails;
