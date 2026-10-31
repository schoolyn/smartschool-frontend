import { useQuery } from "@tanstack/react-query";

import { IAPIError, IAxiosResponse } from "@/shared/types";
import { IUserDetailResponse } from "../model/types";

import Cookies from "js-cookie";
import { APIS_ROUTES, API_QUERY_KEY, USER_ACCESS_KEY } from "@/shared/lib";
import apiClient from "@/shared/api/api-client";

const getUserDetails = async (): Promise<IUserDetailResponse> => {
  const result = await apiClient.get<null, IAxiosResponse<IUserDetailResponse>>(APIS_ROUTES.GET_USER_DETAILS);

  return result.data.Data;
};

export const useGetUserDetails = () =>
  useQuery<IUserDetailResponse, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_USER_DETAILS],
    queryFn: getUserDetails,
    enabled: !!Cookies.get(USER_ACCESS_KEY.TOKEN),
  });
