import SectionHeader from "@/shared/ui/section-header";
import {
  UserIcon,
  PencilIcon,
  CheckIcon,
  ArrowUpTrayIcon,
  KeyIcon,
  GlobeAltIcon,
  MoonIcon,
  BellIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

import useProfileController from "./profile-controller";
import ButtonSpinner from "@/shared/ui/icons/button-spinner";
import PageLoader from "@/shared/ui/page-loader";
import CustomSelectDropdown from "@/shared/ui/custom-select";
import { Switch } from "@/shared/ui/kit/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/kit/form";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";
import { SelectOption } from "@/shared/types";

const AdminProfile = () => {
  const {
    t,
    user,
    editMode,
    imageUrl,
    currentLanguage,
    theme,
    setEditMode,
    handleAvatarChange,
    changeLanguage,
    changeTheme,
    emailNotifications,
    smsNotifications,
    changeEmailNotifications,
    changeSmsNotifications,
    isUploadingAvatar,
    profileForm,
    onSubmitProfile,
    isSavingProfile,
    passwordForm,
    onSubmitPasswordChange,
    isChangingPassword,
    standalone,
    currentRole,
  } = useProfileController();

  const languageOptions: SelectOption[] = [
    { id: "en", name: t("common.languages.english") },
    { id: "hi", name: t("common.languages.hindi") },
  ];
  const themeOptions: SelectOption[] = [
    { id: "light", name: t("common.themes.light") },
    { id: "dark", name: t("common.themes.dark") },
  ];

  return (
    <>
      {!user ? (
        <PageLoader />
      ) : (
        <div className="max-w-7xl mx-auto">
          {standalone && <SectionHeader title="Profile" description="Your details, password and preferences" />}
          <div className="">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">{t("labels.profile_information")}</h3>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-sm"
                      disabled={isSavingProfile}
                      onClick={() => (editMode ? onSubmitProfile() : setEditMode(true))}
                    >
                      {editMode ? (
                        <>
                          {isSavingProfile ? <ButtonSpinner /> : <CheckIcon className="h-4 w-4" />}
                          {t("labels.save")}
                        </>
                      ) : (
                        <>
                          <PencilIcon className="h-4 w-4" />
                          {t("buttons.edit")}
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    {editMode ? (
                      <Form {...profileForm}>
                        <form onSubmit={onSubmitProfile} className="space-y-4" noValidate>
                          <FormField
                            control={profileForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("labels.fullname")}</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div>
                            <Label htmlFor="email">{t("labels.email_address")}</Label>
                            <Input
                              type="email"
                              id="email"
                              value={user.email}
                              disabled
                              className="bg-gray-50 text-gray-500"
                            />
                          </div>
                          <FormField
                            control={profileForm.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("labels.phone_number")}</FormLabel>
                                <FormControl>
                                  <Input type="tel" {...field} placeholder={t("messages.enter_phone_number")} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div>
                            <Label htmlFor="role">{t("labels.role")}</Label>
                            <Input
                              type="text"
                              id="role"
                              value={`${currentRole?.charAt(0).toUpperCase()}${currentRole?.slice(1)}`}
                              disabled
                              className="bg-gray-50 text-gray-500"
                            />
                          </div>
                        </form>
                      </Form>
                    ) : (
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">{t("labels.fullname")}</dt>
                          <dd className="mt-1 text-sm text-gray-900">{user?.name}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">{t("labels.email_address")}</dt>
                          <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">{t("labels.phone_number")}</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {user?.phoneNumber || t("labels.not_provided")}
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">{t("labels.role")}</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {`${currentRole?.charAt(0).toUpperCase()}${currentRole?.slice(1)}`}
                          </dd>
                        </div>
                      </dl>
                    )}
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <KeyIcon className="h-5 w-5 mr-2 text-gray-500" />
                      {t("labels.change_password")}
                    </h3>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <Form {...passwordForm}>
                      <form onSubmit={onSubmitPasswordChange} className="space-y-4" noValidate>
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("labels.current_password")}</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} placeholder={t("messages.enter_current_password")} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("labels.new_password")}</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} placeholder={t("messages.enter_new_password")} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="confirmNewPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("labels.confirm_new_password")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  {...field}
                                  placeholder={t("messages.enter_confirm_new_password")}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" loading={isChangingPassword}>
                          {t("labels.update_password")}
                        </Button>
                      </form>
                    </Form>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg font-medium text-gray-900">{t("labels.your_photo")}</h3>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 relative mb-4">
                        {imageUrl ? (
                          <img src={imageUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                            <UserIcon className="h-16 w-16 text-gray-400" />
                          </div>
                        )}
                        <label
                          htmlFor="avatar-upload"
                          className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-50"
                        >
                          {isUploadingAvatar ? (
                            <ButtonSpinner />
                          ) : (
                            <ArrowUpTrayIcon className="h-5 w-5 text-gray-600" />
                          )}
                        </label>
                        <input
                          id="avatar-upload"
                          type="file"
                          className="hidden"
                          accept="image/png,image/jpeg"
                          disabled={isUploadingAvatar}
                          onChange={handleAvatarChange}
                        />
                      </div>
                      <p className="text-sm text-gray-500">{t("labels.upload_photo_instruction")}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg font-medium text-gray-900">{t("labels.preferences")}</h3>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <form className="space-y-4">
                      <div>
                        <Label className="flex items-center">
                          <GlobeAltIcon className="h-5 w-5 mr-2 text-gray-500" />
                          {t("labels.language")}
                        </Label>
                        <CustomSelectDropdown
                          options={languageOptions}
                          value={languageOptions.find((o) => o.id === currentLanguage) || languageOptions[0]}
                          onChange={(o) => changeLanguage(String(o.id))}
                        />
                      </div>
                      <div>
                        <Label className="flex items-center">
                          <MoonIcon className="h-5 w-5 mr-2 text-gray-500" />
                          {t("labels.theme")}
                        </Label>
                        <CustomSelectDropdown
                          options={themeOptions}
                          value={themeOptions.find((o) => o.id === theme) || themeOptions[0]}
                          onChange={(o) => changeTheme(o.id as "light" | "dark")}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="emailNotifications" className="mb-0 flex items-center">
                          <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-500" />
                          {t("labels.email_notifications")}
                        </Label>
                        <Switch
                          id="emailNotifications"
                          checked={emailNotifications}
                          onCheckedChange={changeEmailNotifications}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="smsNotifications" className="mb-0 flex items-center">
                          <BellIcon className="h-5 w-5 mr-2 text-gray-500" />
                          {t("labels.sms_notifications")}
                        </Label>
                        <Switch
                          id="smsNotifications"
                          checked={smsNotifications}
                          onCheckedChange={changeSmsNotifications}
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminProfile;
