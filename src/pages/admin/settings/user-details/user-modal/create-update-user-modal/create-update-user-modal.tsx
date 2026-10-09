import { XMarkIcon } from "@heroicons/react/24/outline";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ICreateUpdateUserModalProps } from "@/types";
import ButtonSpinner from "@/icons/button-spinner";

const CreateUpdateUserModal = ({
  t,
  isOpen,
  form,
  roleOptions,
  permissionOptions,
  isEditUser,
  isEditingSelf,
  isLoadingAddUserDetail,
  isLoadingUpdateUserDetail,
  onClose,
  onSubmit,
  handlePermissionChange,
}: ICreateUpdateUserModalProps) => {
  if (!isOpen) return null;

  const isLoading = isEditUser ? isLoadingUpdateUserDetail : isLoadingAddUserDetail;
  const role = form.watch("role");
  const permissions = form.watch("permissions");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="relative w-full max-h-[90vh] overflow-y-auto transform rounded-lg bg-white text-left shadow-xl transition-all sm:max-w-lg">
          <div className="absolute top-4 right-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">{t ? t("labels.close") : "Close"}</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">
                  {isEditUser ? t("labels.edit_user") : t("labels.add_user")}
                </h3>
                <Form {...form}>
                  <form onSubmit={onSubmit} className="space-y-6" noValidate>
                    <FormField
                      control={form.control}
                      name="fullname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("labels.fullname")}</FormLabel>
                          <FormControl>
                            <Input {...field} type="text" placeholder={t("messages.enter_your_full_name")} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("labels.email_address")}</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder={t("messages.enter_your_email")} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isEditingSelf && (
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-800">
                        You can't change your own role or permissions. Ask another admin if this needs to change.
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t("labels.user_role")}</label>
                      <div className="grid grid-cols-2 gap-4">
                        {roleOptions.map((roleOption) => (
                          <div
                            key={roleOption.value}
                            aria-disabled={isEditingSelf}
                            className={`relative rounded-lg border p-4 ${
                              isEditingSelf ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                            } ${
                              role === roleOption.value
                                ? "border-primary-500 bg-primary-50"
                                : "border-gray-300 hover:border-primary-300"
                            }`}
                            onClick={() => !isEditingSelf && form.setValue("role", roleOption.value)}
                          >
                            <div className="flex items-center">
                              <div className="flex-shrink-0">{roleOption.icon}</div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-gray-900">{roleOption.label}</h3>
                                <p className="text-xs text-gray-500 mt-1">{roleOption.description}</p>
                              </div>
                            </div>
                            {role === roleOption.value && (
                              <div className="absolute top-2 right-2">
                                <svg className="h-5 w-5 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {role !== "parent" ? (
                      <div className="bg-gray-50 p-4 rounded-md">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          {t("labels.permissions")}
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          {permissionOptions.map((permission) => (
                            <div
                              key={permission.id}
                              className={`flex items-start space-x-3 p-3 rounded-md border ${
                                permissions[permission.id]
                                  ? "border-primary-500 bg-primary-50"
                                  : "border-gray-200 hover:border-primary-300"
                              }`}
                            >
                              <div className="flex items-center h-5">
                                <input
                                  type="checkbox"
                                  id={permission.id}
                                  disabled={isEditingSelf}
                                  checked={permissions[permission.id]}
                                  onChange={() => handlePermissionChange(permission.id)}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">{permission.icon}</div>
                                  <label htmlFor={permission.id} className="ml-2 text-sm font-medium text-gray-900">
                                    {permission.label}
                                  </label>
                                </div>
                                <span className="text-xs text-gray-500 mt-1">{permission.description}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">{t("labels.parent_role_notice")}</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>{t("messages.parent_role_notice")}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? <ButtonSpinner /> : isEditUser ? t("buttons.update_user") : t("buttons.save_user")}
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      >
                        {t("buttons.cancel")}
                      </button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUpdateUserModal;
