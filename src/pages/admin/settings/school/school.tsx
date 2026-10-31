import { ImageDropzone } from "@/shared/ui/file-dropzone";

import { TextareaField, TextField } from "@/shared/ui/form-fields";
import { Button } from "@/shared/ui/kit/button";
import { Card, CardTitle } from "@/shared/ui/kit/card";
import { Form } from "@/shared/ui/kit/form";
import { LetterheadForm } from "@/features/letterhead";
import useSchoolSettingsController from "./school-controller";

// the school's name, logo and registration details, as printed on certificates
const SchoolSettings = () => {
  const c = useSchoolSettingsController();
  const { form } = c;

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle className="font-medium">School details</CardTitle>
        <div className="mt-4 flex flex-col gap-6 sm:flex-row">
          <div className="shrink-0">
            <ImageDropzone
              src={c.organization?.logo?.url ?? null}
              onPick={c.onLogoChosen}
              alt="School logo"
              fit="contain"
              maxBytes={10 * 1024 * 1024}
              hint={c.isUploadingLogo ? "Uploading..." : "PNG or JPG, up to 10 MB"}
              disabled={c.isUploadingLogo}
              className="h-32 w-32"
            />
          </div>
          <Form {...form}>
            <form onSubmit={c.onSubmit} noValidate className="flex-1 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField form={form} name="name" label="School name" />
                <TextField form={form} name="pincode" label="Pincode" />
                <TextField form={form} name="address" label="Address" className="sm:col-span-2" />
                <TextareaField
                  form={form}
                  name="description"
                  label="About the school"
                  rows={2}
                  className="sm:col-span-2"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" loading={c.isSaving} disabled={!c.isDirty}>
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Card>

      <LetterheadForm organizationId={c.organizationId} letterhead={c.organization?.letterhead} />
    </div>
  );
};

export default SchoolSettings;
