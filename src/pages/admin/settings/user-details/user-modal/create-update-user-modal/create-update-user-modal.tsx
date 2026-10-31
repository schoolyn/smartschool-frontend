import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";

import FormDialog from "@/shared/ui/form-dialog";
import { TextField } from "@/shared/ui/form-fields";
import { Label } from "@/shared/ui/kit/label";
import { cn } from "@/shared/lib/utils";
import { ICreateUpdateUserModalProps } from "@/entities/user";

const CreateUpdateUserModal = ({
  t,
  isOpen,
  form,
  roleOptions,
  isEditUser,
  isLoadingAddUserDetail,
  isLoadingUpdateUserDetail,
  onClose,
  onSubmit,
}: ICreateUpdateUserModalProps) => {
  const isLoading = isEditUser ? isLoadingUpdateUserDetail : isLoadingAddUserDetail;
  const role = form.watch("role");

  return (
    <FormDialog
      form={form}
      open={isOpen}
      onClose={onClose}
      title={isEditUser ? t("labels.edit_user") : t("labels.add_user")}
      submitLabel={isEditUser ? t("buttons.update_user") : t("buttons.save_user")}
      isSubmitting={isLoading}
      onSubmit={onSubmit}
      className="max-w-2xl"
    >
      <TextField
        form={form}
        name="fullname"
        label={t("labels.fullname")}
        placeholder={t("messages.enter_your_full_name")}
      />
      <TextField
        form={form}
        name="email"
        type="email"
        label={t("labels.email_address")}
        placeholder={t("messages.enter_your_email")}
      />

      {isEditUser ? (
        <p className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          Role and access are changed on this person's access page (Manage access in the list).
        </p>
      ) : (
        <>
          <div>
            <Label>{t("labels.user_role")}</Label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {roleOptions.map((roleOption) => (
                <button
                  type="button"
                  key={roleOption.value}
                  aria-pressed={role === roleOption.value}
                  onClick={() => form.setValue("role", roleOption.value, { shouldDirty: true })}
                  className={cn(
                    "relative rounded-lg border p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                    role === roleOption.value
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-300 hover:border-primary-300"
                  )}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">{roleOption.icon}</div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{roleOption.label}</p>
                      <p className="mt-1 text-xs text-gray-500">{roleOption.description}</p>
                    </div>
                  </div>
                  {role === roleOption.value && (
                    <CheckCircleIcon className="absolute right-2 top-2 h-5 w-5 text-primary-500" aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          </div>
          {role === "parent" ? (
            <div className="flex rounded-md border border-yellow-200 bg-yellow-50 p-4">
              <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-yellow-400" aria-hidden="true" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">{t("labels.parent_role_notice")}</p>
                <p className="mt-2 text-sm text-yellow-700">{t("messages.parent_role_notice")}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              They get this role's default access. You can fine-tune it afterwards from Manage access.
            </p>
          )}
        </>
      )}
    </FormDialog>
  );
};

export default CreateUpdateUserModal;
