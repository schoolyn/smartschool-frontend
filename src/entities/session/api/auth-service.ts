import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { IForgetPasswordRequest, ILoginResponse } from "../model/types";
import { API_MUTATION_KEY, APIS_ROUTES, API_QUERY_KEY } from "@/shared/lib";
import { IOrganization } from "@/entities/organization";

const forgotPassword = async (forgotPasswordData: IForgetPasswordRequest) => {
  await apiClient.post(APIS_ROUTES.FORGOT_PASSWORD, forgotPasswordData);
};

export const useForgotPassword = () =>
  useMutation<void, IAPIError, IForgetPasswordRequest>({
    mutationKey: [API_MUTATION_KEY.FORGOT_PASSWORD],
    mutationFn: forgotPassword,
  });

const getAllOrganizations = async () => {
  const result = await apiClient.get<null, IAxiosResponse<{ items: IOrganization[] }>>(
    `${APIS_ROUTES.ORGANIZATION_SERVICE}/get-all-organizations`
  );

  return result.data.Data;
};

export const useGetAllOrganizations = (enabled = true) =>
  useQuery<{ items: IOrganization[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_ALL_ORGANIZATIONS],
    queryFn: () => getAllOrganizations(),
    enabled,
  });

interface ILoginValue {
  email: string;
  password: string;
}

const singIn = async (value: ILoginValue) => {
  const response = await apiClient.post<ILoginValue, IAxiosResponse<ILoginResponse>>(APIS_ROUTES.SIGNIN, value);

  return response.data.Data;
};

export const useSignIn = () =>
  useMutation<ILoginResponse, IAPIError, ILoginValue>({
    mutationKey: [API_MUTATION_KEY.SIGNIN],
    mutationFn: singIn,
  });

interface IResetUserPasswordRequest {
  token: string;
  password: string;
}

const resetUserPassword = async (value: IResetUserPasswordRequest) => {
  await apiClient.put(APIS_ROUTES.RESET_PASSWORD, value);
};

export const useResetUserPassword = () =>
  useMutation<void, IAPIError, IResetUserPasswordRequest>({
    mutationKey: [API_MUTATION_KEY.RESET_PASSWORD],
    mutationFn: resetUserPassword,
  });

interface ISetUserPasswordRequest {
  token: string;
  password: string;
}

const setUserPassword = async (value: ISetUserPasswordRequest) => {
  await apiClient.put(APIS_ROUTES.SET_USER_PASSWORD, value);
};

export const useSetUserPassword = () =>
  useMutation<void, IAPIError, ISetUserPasswordRequest>({
    mutationKey: [API_MUTATION_KEY.SET_USER_PASSWORD],
    mutationFn: setUserPassword,
  });
