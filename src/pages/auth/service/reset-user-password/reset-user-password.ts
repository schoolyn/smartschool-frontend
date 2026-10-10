import { useMutation } from "@tanstack/react-query";

import apiClient from "@/config";
import { IAPIError } from "@/types";
import { API_MUTATION_KEY, APIS_ROUTES } from "@/utils";

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

export default useResetUserPassword;
