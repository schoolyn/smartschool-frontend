import { useMutation } from "@tanstack/react-query";
import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { IOrganization } from "../model/types";
import { API_MUTATION_KEY, APIS_ROUTES } from "@/shared/lib";

export interface IUpdateOrganizationValue {
  name: string;
  address: string;
  pincode: string;
  description?: string;
}

const updateOrganization = async ({
  organizationId,
  value,
}: {
  organizationId: string;
  value: IUpdateOrganizationValue;
}): Promise<IOrganization> => {
  const result = await apiClient.put(
    `${APIS_ROUTES.ORGANIZATION_SERVICE}/update-organization/${organizationId}`,
    value
  );

  return result.data.Data.item as IOrganization;
};

export const useUpdateOrganization = () =>
  useMutation<IOrganization, IAPIError, { organizationId: string; value: IUpdateOrganizationValue }>({
    mutationKey: [API_MUTATION_KEY.UPDATE_ORGANIZATION],
    mutationFn: updateOrganization,
  });

const uploadOrganizationLogo = async ({
  organizationId,
  file,
}: {
  organizationId: string;
  file: File;
}): Promise<IOrganization> => {
  const formData = new FormData();
  formData.append("logo", file);

  const result = await apiClient.post<null, IAxiosResponse<{ item: IOrganization }>>(
    `${APIS_ROUTES.ORGANIZATION_SERVICE}/${organizationId}/logo`,
    formData
  );

  return result.data.Data.item;
};

export const useUploadOrganizationLogo = () =>
  useMutation<IOrganization, IAPIError, { organizationId: string; file: File }>({
    mutationKey: [API_MUTATION_KEY.UPLOAD_ORGANIZATION_LOGO],
    mutationFn: uploadOrganizationLogo,
  });
