import { useMutation } from "@tanstack/react-query";

import apiClient from "@/config";
import { IAPIError } from "@/types";
import { API_MUTATION_KEY, APIS_ROUTES } from "@/utils";

// emails a parent who has not set a password yet a fresh set-password link
const reinviteParent = async (userId: string) => {
  await apiClient.post(`${APIS_ROUTES.REINVITE_USER}/${userId}`);
};

export const useReinviteParent = () =>
  useMutation<void, IAPIError, string>({
    mutationKey: [API_MUTATION_KEY.REINVITE_USER],
    mutationFn: reinviteParent,
  });

export default useReinviteParent;
