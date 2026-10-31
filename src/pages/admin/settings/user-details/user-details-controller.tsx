import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash.debounce";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UsersIcon } from "@heroicons/react/20/solid";

import { IAllUserDetails, IRoleOptionDropDown } from "@/entities/user";
import { ROLE_OPTIONS } from "../access";
import { useAddUserDetail, useDeleteUser, useGetAllUserDetails, useUpdateUserDetail } from "@/entities/user";
import { useError, usePaging } from "@/shared/lib/hooks";
import { useAuth } from "@/entities/session";
import { useAreaBase } from "@/entities/session";
import { userFormSchema, defaultUserFormValues, UserFormValues } from "./user-details.schema";

const FILTER_OPTIONS: IRoleOptionDropDown[] = [
  {
    value: "all",
    label: "All Users",
    description: "Everyone in the school",
    icon: <UsersIcon className="h-5 w-5 text-gray-400" />,
  },
  ...ROLE_OPTIONS.map((option) => ({
    value: option.value,
    label: `${option.label}s`,
    description: `${option.label}s only`,
    icon: option.icon,
  })),
];

const useUserDetailsController = () => {
  const { organizationId = "" } = useParams<{ organizationId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const areaBase = useAreaBase();
  const { user: currentUser } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState("");
  const [sortBy, setSortBy] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { page, pageSize, setPage, setPageSize, resetPage } = usePaging();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState("");
  const form = useForm<UserFormValues>({ resolver: zodResolver(userFormSchema), defaultValues: defaultUserFormValues });

  const addUserDetail = useAddUserDetail(organizationId);
  const getAllUserDetails = useGetAllUserDetails(
    organizationId,
    searchTerm,
    sortBy === "all" ? "" : sortBy,
    page,
    pageSize
  );
  const users: IAllUserDetails[] = getAllUserDetails.data?.rows ?? [];
  const deleteUser = useDeleteUser(organizationId);
  const updateUserDetails = useUpdateUserDetail(organizationId);

  useError({ mutation: addUserDetail });
  useError({ mutation: updateUserDetails });
  // a refused removal (yourself, a parent still linked to students) closes the confirmation and says why
  useError({ mutation: deleteUser, cb: () => setIsDeleteModalOpen(false) });

  const onRoleChange = (role: string) => {
    setSortBy(role);
    resetPage();
  };

  const runSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
        resetPage();
      }, 500),
    [resetPage]
  );
  useEffect(() => () => runSearch.cancel(), [runSearch]);

  const onSearchInputChange = (value: string) => {
    setSearchInput(value);
    runSearch(value);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUserId("");
    form.reset(defaultUserFormValues);
  };

  const handleSubmituserDetails = form.handleSubmit((values) => {
    if (editingUserId) {
      updateUserDetails.mutate(
        { id: editingUserId, name: values.fullname, email: values.email },
        {
          onSuccess: () => {
            toast.success("User updated.");
            closeModal();
          },
        }
      );
      return;
    }
    addUserDetail.mutate(
      { name: values.fullname, email: values.email, role: values.role },
      {
        onSuccess: () => {
          toast.success("Invitation sent.");
          closeModal();
        },
      }
    );
  });

  const handleEditUserDetails = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    form.reset({ fullname: user.name, email: user.email, role: user.role === "student" ? "parent" : user.role });
    setEditingUserId(userId);
    setIsModalOpen(true);
  };

  // "Add user" always opens an empty form, never the last person edited
  const openAddUser = () => {
    form.reset(defaultUserFormValues);
    setEditingUserId("");
    setIsModalOpen(true);
  };

  const manageAccess = (userId: string) => navigate(`${areaBase}/settings/add-user/${userId}`);

  const onClickDeleteUser = (userId: string) => {
    setDeleteUserId(userId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = () => {
    if (!deleteUserId) return;
    deleteUser.mutate(deleteUserId, {
      onSuccess: (message) => {
        toast.success(message || "User removed.");
        setIsDeleteModalOpen(false);
      },
    });
  };

  return {
    t,
    sortBy,
    form,
    isModalOpen,
    users,
    roleOptions: ROLE_OPTIONS,
    roleOptionsDropDown: FILTER_OPTIONS,
    searchTerm,
    searchInput,
    onSearchInputChange,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalUsers: getAllUserDetails.data?.pagination.totalItems ?? 0,
    openAddUser,
    isSelf: (userId: string) => userId === currentUser?.id,
    isEditUser: !!editingUserId,
    isDeleteModalOpen,
    deleteUserId,
    isLoadingAddUserDetail: addUserDetail.isPending,
    isLoadingGetAllUserDetails: getAllUserDetails.isLoading,
    isFetchingGetAllUserDetails: getAllUserDetails.isFetching,
    isLoadingUpdateUserDetail: updateUserDetails.isPending,
    isLoadingDeleteUser: deleteUser.isPending,
    onCancel: closeModal,
    onRoleChange,
    handleSubmituserDetails,
    handleEditUserDetails,
    manageAccess,
    handleDeleteUser,
    onClickDeleteUser,
    onCancelDeleteModal: () => setIsDeleteModalOpen(false),
  };
};

export default useUserDetailsController;
