import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { useUpdateOrganization, useUploadOrganizationLogo } from "@/entities/organization";
import { useError } from "@/shared/lib/hooks";
import { IOrganization } from "@/entities/organization";
import { organizationFormSchema, OrganizationFormValues } from "./edit-organization-modal.schema";

const useEditOrganizationModalController = (
  isOpen: boolean,
  onClose: () => void,
  onSaved: () => void,
  organization: IOrganization | null
) => {
  const { t } = useTranslation();
  const updateOrganization = useUpdateOrganization();
  const uploadLogo = useUploadOrganizationLogo();

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: { name: "", address: "", pincode: "", description: "" },
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | undefined>(undefined);

  useError({ mutation: updateOrganization });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: organization?.name || "",
        address: organization?.address || "",
        pincode: organization?.pincode || "",
        description: organization?.description || "",
      });
      setLogoFile(null);
      setLogoPreviewUrl(organization?.logo?.url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, organization]);

  useEffect(() => {
    if (!logoFile || !logoPreviewUrl) return;
    return () => URL.revokeObjectURL(logoPreviewUrl);
  }, [logoFile, logoPreviewUrl]);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    if (!organization) return;
    updateOrganization.mutate(
      { organizationId: organization.id, value: values },
      {
        onSuccess: async () => {
          toast.success("Organization updated successfully.");
          if (logoFile) {
            // the organization is already saved, so a logo failure shouldn't block closing, but the user must know
            await uploadLogo.mutateAsync({ organizationId: organization.id, file: logoFile }).catch(() => {
              toast.error(
                t(
                  "messages.organization_logo_upload_failed",
                  "Logo upload failed. You can try again from the school settings."
                )
              );
            });
          }
          onSaved();
          onClose();
        },
      }
    );
  });

  return {
    t,
    form,
    logoPreviewUrl,
    handleLogoFileChange,
    onSubmit,
    isLoading: updateOrganization.isPending || uploadLogo.isPending,
    isUploadingLogo: uploadLogo.isPending,
  };
};

export default useEditOrganizationModalController;
