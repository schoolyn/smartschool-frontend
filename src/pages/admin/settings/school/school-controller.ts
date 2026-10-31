import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useTenant } from "@/entities/session";
import { useError } from "@/shared/lib/hooks";
import { useUpdateOrganization, useUploadOrganizationLogo } from "@/entities/organization";
import { API_QUERY_KEY } from "@/shared/lib";
import { schoolDetailsSchema, SchoolDetailsFormValues } from "./school.schema";

const useSchoolSettingsController = () => {
  const { organizationId = "", organization } = useTenant();
  const queryClient = useQueryClient();
  const updateSchool = useUpdateOrganization();
  const uploadLogo = useUploadOrganizationLogo();
  useError({ mutation: updateSchool });
  useError({ mutation: uploadLogo });
  const refreshSchool = () => queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_ALL_ORGANIZATIONS] });

  const details = (): SchoolDetailsFormValues => ({
    name: organization?.name ?? "",
    address: organization?.address ?? "",
    pincode: organization?.pincode ?? "",
    description: organization?.description ?? "",
  });
  const form = useForm<SchoolDetailsFormValues>({
    resolver: zodResolver(schoolDetailsSchema),
    defaultValues: details(),
  });

  useEffect(() => {
    if (!form.formState.isDirty) form.reset(details());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization]);

  const onSubmit = form.handleSubmit((value) =>
    updateSchool.mutate(
      { organizationId, value },
      {
        onSuccess: () => {
          form.reset(value);
          refreshSchool();
          toast.success("School details saved.");
        },
      }
    )
  );

  const onLogoChosen = (file: File) =>
    uploadLogo.mutate(
      { organizationId, file },
      {
        onSuccess: () => {
          refreshSchool();
          toast.success("Logo updated. It prints on new certificates.");
        },
      }
    );

  return {
    organizationId,
    organization,
    form,
    onSubmit,
    isSaving: updateSchool.isPending,
    isDirty: form.formState.isDirty,
    onLogoChosen,
    isUploadingLogo: uploadLogo.isPending,
  };
};

export default useSchoolSettingsController;
