import { BuildingOffice2Icon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";

import FormDialog from "@/shared/ui/form-dialog";
import { TextField, TextareaField } from "@/shared/ui/form-fields";
import ButtonSpinner from "@/shared/ui/icons/button-spinner";
import useEditOrganizationModalController from "./edit-organization-modal-controller";
import { IOrganization } from "@/entities/organization";

interface EditOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  organization: IOrganization | null;
}

const EditOrganizationModal = ({ isOpen, onClose, onSaved, organization }: EditOrganizationModalProps) => {
  const { t, form, logoPreviewUrl, handleLogoFileChange, onSubmit, isLoading, isUploadingLogo } =
    useEditOrganizationModalController(isOpen, onClose, onSaved, organization);

  return (
    <FormDialog
      form={form}
      open={isOpen}
      onClose={onClose}
      title="Edit Organization"
      submitLabel={t("buttons.save")}
      isSubmitting={isLoading}
      onSubmit={onSubmit}
    >
      <div className="flex justify-center">
        <div className="relative h-24 w-24">
          {logoPreviewUrl ? (
            <img
              src={logoPreviewUrl}
              alt="School logo"
              className="h-full w-full rounded-lg border border-gray-200 bg-white object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-lg border border-gray-200 bg-gray-100">
              <BuildingOffice2Icon className="h-10 w-10 text-gray-300" />
            </div>
          )}
          <label
            htmlFor="organization-logo-upload"
            className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-white p-1.5 shadow-md hover:bg-gray-50"
          >
            <span className="sr-only">Upload logo</span>
            {isUploadingLogo ? <ButtonSpinner /> : <ArrowUpTrayIcon className="h-4 w-4 text-gray-600" />}
          </label>
          <input
            id="organization-logo-upload"
            type="file"
            className="hidden"
            accept="image/png,image/jpeg"
            disabled={isUploadingLogo}
            onChange={handleLogoFileChange}
          />
        </div>
      </div>

      <TextField form={form} name="name" label={t("labels.organization_name")} />
      <TextField form={form} name="address" label={t("labels.address")} />
      <TextField form={form} name="pincode" label={t("labels.pincode")} />
      <TextareaField form={form} name="description" label={t("labels.description")} />
    </FormDialog>
  );
};

export default EditOrganizationModal;
