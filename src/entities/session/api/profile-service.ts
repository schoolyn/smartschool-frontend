import { useMutation } from "@tanstack/react-query";
import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { API_MUTATION_KEY, APIS_ROUTES } from "@/shared/lib";
import { IUserPreferences, IUserAvatar } from "../model/types";

interface IChangeMyPasswordPayload {
  currentPassword: string;
  newPassword: string;
}

const changeMyPassword = async (payload: IChangeMyPasswordPayload): Promise<void> => {
  await apiClient.put<null, IAxiosResponse<{ message: string }>>(APIS_ROUTES.CHANGE_MY_PASSWORD, payload);
};

export const useChangeMyPassword = () =>
  useMutation<void, IAPIError, IChangeMyPasswordPayload>({
    mutationKey: [API_MUTATION_KEY.CHANGE_MY_PASSWORD],
    mutationFn: changeMyPassword,
  });

interface IUpdateMyProfilePayload {
  name: string;
  phoneNumber?: string;
}

interface IUpdateMyProfileResponse {
  name: string;
  phoneNumber: string;
}

const updateMyProfile = async (payload: IUpdateMyProfilePayload): Promise<IUpdateMyProfileResponse> => {
  const result = await apiClient.patch<null, IAxiosResponse<{ item: IUpdateMyProfileResponse }>>(
    APIS_ROUTES.UPDATE_MY_PROFILE,
    payload
  );

  return result.data.Data.item;
};

export const useUpdateMyProfile = () =>
  useMutation<IUpdateMyProfileResponse, IAPIError, IUpdateMyProfilePayload>({
    mutationKey: [API_MUTATION_KEY.UPDATE_MY_PROFILE],
    mutationFn: updateMyProfile,
  });

type UpdatePreferencesPayload = Partial<IUserPreferences>;

const updateUserPreferences = async (payload: UpdatePreferencesPayload): Promise<IUserPreferences> => {
  const result = await apiClient.patch<null, IAxiosResponse<{ item: IUserPreferences }>>(
    APIS_ROUTES.UPDATE_USER_PREFERENCES,
    payload
  );

  return result.data.Data.item;
};

export const useUpdateUserPreferences = () =>
  useMutation<IUserPreferences, IAPIError, UpdatePreferencesPayload>({
    mutationKey: [API_MUTATION_KEY.UPDATE_USER_PREFERENCES],
    mutationFn: updateUserPreferences,
  });

const uploadAvatar = async (file: File): Promise<IUserAvatar> => {
  const formData = new FormData();
  formData.append("avatar", file);

  const result = await apiClient.post<null, IAxiosResponse<{ item: IUserAvatar }>>(APIS_ROUTES.UPLOAD_AVATAR, formData);

  return result.data.Data.item;
};

export const useUploadAvatar = () =>
  useMutation<IUserAvatar, IAPIError, File>({
    mutationKey: [API_MUTATION_KEY.UPLOAD_AVATAR],
    mutationFn: uploadAvatar,
  });
