import { TextField } from "@/shared/ui/form-fields";
import { Button } from "@/shared/ui/kit/button";
import { Card, CardTitle } from "@/shared/ui/kit/card";
import { Form } from "@/shared/ui/kit/form";
import { ILetterhead } from "@/entities/organization";
import useLetterheadFormController from "../model/letterhead-form-controller";

interface LetterheadFormProps {
  organizationId: string;
  letterhead?: Partial<ILetterhead>;
  readOnly?: boolean;
  // narrow column on the certificate page
  compact?: boolean;
}

// registration ids, contacts and the signing principal, printed on every certificate
const LetterheadForm = ({ organizationId, letterhead, readOnly = false, compact = false }: LetterheadFormProps) => {
  const c = useLetterheadFormController(organizationId, letterhead);
  const grid = compact ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 gap-4 sm:grid-cols-2";
  const { form } = c;

  return (
    <Card>
      <CardTitle className="font-medium">School registration &amp; letterhead</CardTitle>
      <p className="mb-4 mt-1 text-sm text-gray-500">
        Printed under the school name and logo on certificates. Leave a line empty to skip it.
      </p>
      <Form {...form}>
        <form onSubmit={c.onSubmit} noValidate className="space-y-4">
          <fieldset disabled={readOnly} className={grid}>
            <TextField form={form} name="board" label="Board" placeholder="CBSE" />
            <TextField form={form} name="affiliationNo" label="Affiliation number" />
            <TextField form={form} name="udiseCode" label="UDISE code" />
            <TextField form={form} name="registrationNo" label="Registration number" />
            <TextField form={form} name="principalName" label="Principal's name" />
            <TextField form={form} name="principalTitle" label="Signing as" placeholder="Principal" />
            <TextField form={form} name="phone" label="Phone" />
            <TextField form={form} name="email" label="Email" type="email" />
            <TextField form={form} name="website" label="Website" />
            <TextField form={form} name="tagline" label="Tagline or motto" />
          </fieldset>
          {!readOnly && (
            <div className="flex justify-end">
              <Button type="submit" loading={c.isSaving} disabled={!c.isDirty}>
                Save school details
              </Button>
            </div>
          )}
        </form>
      </Form>
    </Card>
  );
};

export default LetterheadForm;
