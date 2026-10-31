import { useLocation } from "react-router-dom";
import { useCurrentRole } from "@/entities/session";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

import { useAuth } from "@/entities/session";
import { useTheme } from "@/features/theme";
import { useUpdateUserPreferences, useUploadAvatar, useUpdateMyProfile, useChangeMyPassword } from "@/entities/session";
import { useError } from "@/shared/lib/hooks";
import { IAPIError } from "@/shared/types";
import { editProfileSchema, changePasswordSchema, defaultChangePasswordValues } from "./profile.schema";

const useProfileController = () => {
  const { t, i18n } = useTranslation();
  const { user, updatePreferences, updateAvatar, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const updateServerPreferences = useUpdateUserPreferences();
  const uploadAvatar = useUploadAvatar();
  const updateMyProfile = useUpdateMyProfile();
  const changeMyPassword = useChangeMyPassword();

  const [editMode, setEditMode] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { name: user?.name || "", phoneNumber: user?.phoneNumber || "" },
  });

  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: defaultChangePasswordValues,
  });

  // the user only exists once /get-user-details resolves, so seed the form the moment it's ready
  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.name || "", phoneNumber: user.phoneNumber || "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.name, user?.phoneNumber]);

  useError({ mutation: updateMyProfile });
  useError({ mutation: changeMyPassword });

  const onSubmitProfile = profileForm.handleSubmit((values) => {
    updateMyProfile.mutate(values, {
      onSuccess: (updated: { name: string; phoneNumber: string }) => {
        updateProfile(updated);
        toast.success("Profile updated.");
        setEditMode(false);
      },
    });
  });

  const onSubmitPasswordChange = passwordForm.handleSubmit((values) => {
    changeMyPassword.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          toast.success("Password changed successfully.");
          passwordForm.reset(defaultChangePasswordValues);
        },
        onError: (error: IAPIError) => {
          if (error?.response?.Error?.code === "EX-00101") {
            passwordForm.setError("currentPassword", { message: "Current password is incorrect." });
          }
        },
      }
    );
  });

  // react-i18next re-renders on language change, so i18n.language needs no mirrored state
  const currentLanguage = i18n.language || "en";

  // derived from the shared user object, so a refresh or another tab always shows what's saved
  const imageUrl = user?.avatar?.url;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatar.mutate(file, {
        onSuccess: (avatar) => updateAvatar(avatar),
      });
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
    Cookies.set("i18nextLng", lng, { expires: 365 });
    document.documentElement.lang = lng;

    if (lng === "en" || lng === "hi") {
      updatePreferences({ locale: lng });
      if (user) updateServerPreferences.mutate({ locale: lng });
    }
  };

  const changeTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
  };

  // derived from the shared user object; defaults true (the backend default) until the user is known
  const emailNotifications = user?.preferences?.emailNotifications ?? true;
  const smsNotifications = user?.preferences?.smsNotifications ?? true;

  const changeEmailNotifications = (checked: boolean) => {
    updatePreferences({ emailNotifications: checked });
    updateServerPreferences.mutate({ emailNotifications: checked });
  };

  const changeSmsNotifications = (checked: boolean) => {
    updatePreferences({ smsNotifications: checked });
    updateServerPreferences.mutate({ smsNotifications: checked });
  };

  const location = useLocation();
  // inside Settings the page header is already there; teachers and parents open Profile on its own
  const standalone = !location.pathname.includes("/settings/");

  return {
    t,
    standalone,
    currentRole: useCurrentRole(),
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
    isUploadingAvatar: uploadAvatar.isPending,
    profileForm,
    onSubmitProfile,
    isSavingProfile: updateMyProfile.isPending,
    passwordForm,
    onSubmitPasswordChange,
    isChangingPassword: changeMyPassword.isPending,
  };
};

export default useProfileController;
