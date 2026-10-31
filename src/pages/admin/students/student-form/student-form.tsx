import EmptyState from "@/shared/ui/empty-state";
import { ImageDropzone } from "@/shared/ui/file-dropzone";
import { CheckboxField, DateField, SelectField, TextField } from "@/shared/ui/form-fields";
import PageLoader from "@/shared/ui/page-loader";
import SectionHeader from "@/shared/ui/section-header";
import { Button } from "@/shared/ui/kit/button";
import { Form } from "@/shared/ui/kit/form";
import { usePageHeader } from "@/shared/lib/hooks";
import { localDateString } from "@/shared/lib";
import FormSection from "./components/form-section";
import PersonFields from "./components/person-fields";
import PrefixDialog from "./components/prefix-dialog";
import useStudentFormController from "./student-form-controller";
import { BLOOD_GROUP_OPTIONS, CATEGORY_OPTIONS, GENDER_OPTIONS, LOGIN_CONTACT_OPTIONS } from "./student-form.schema";

// the full admission form; the same page edits a student's details
const StudentForm = () => {
  const c = useStudentFormController();
  const { form } = c;
  const title = c.isEdit ? "Edit Student" : "New Admission";
  usePageHeader({ title, onBack: c.cancel });

  if (c.isLoading) return <PageLoader />;
  if (c.notFound) return <EmptyState title="Student not found" description="This student may have been removed." />;

  const today = localDateString();

  return (
    <div className="mx-auto max-w-5xl">
      <SectionHeader
        title={c.isEdit ? `Edit ${c.studentName}` : "New Admission"}
        description={
          c.isEdit
            ? "Update the student's details. Class changes go through Promotion."
            : "Admit a new student: their details, class, family and address."
        }
      />

      <Form {...form}>
        <form onSubmit={c.onSubmit} noValidate className="space-y-6">
          <FormSection title="Student" description="Who is joining the school">
            <div className="flex flex-col gap-6 md:flex-row">
              <ImageDropzone
                src={c.shownPhoto}
                onPick={c.pickPhoto}
                onRemove={c.clearPhoto}
                alt="Student photo"
                maxBytes={10 * 1024 * 1024}
                hint="PNG or JPG, up to 10 MB"
                className="h-40 w-32 shrink-0"
              />
              <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  form={form}
                  name="name"
                  label="Full name"
                  placeholder="e.g. Aarav Sharma"
                  className="sm:col-span-2"
                />
                <SelectField
                  form={form}
                  name="gender"
                  label="Gender"
                  options={GENDER_OPTIONS}
                  placeholder="Select gender"
                />
                <DateField
                  form={form}
                  name="dateOfBirth"
                  label="Date of birth"
                  placeholder="Select date of birth"
                  max={today}
                />
                <SelectField
                  form={form}
                  name="bloodGroup"
                  label="Blood group"
                  options={BLOOD_GROUP_OPTIONS}
                  placeholder="Select blood group"
                />
                <TextField form={form} name="aadhaarNumber" label="Aadhaar number" placeholder="12 digits" />
                <SelectField
                  form={form}
                  name="category"
                  label="Category"
                  options={CATEGORY_OPTIONS}
                  placeholder="Select category"
                />
                <TextField form={form} name="religion" label="Religion" placeholder="e.g. Hindu" />
                <TextField form={form} name="motherTongue" label="Mother tongue" placeholder="e.g. Hindi" />
                <TextField form={form} name="nationality" label="Nationality" placeholder="e.g. Indian" />
              </div>
            </div>
          </FormSection>

          <FormSection title="Admission" description="Class, section and admission number">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {c.isEdit ? (
                <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600 sm:col-span-3">
                  <p className="font-medium text-gray-800">
                    {c.enrollment?.classId?.name ?? "No class"}
                    {c.enrollment?.sectionId?.name ? ` - ${c.enrollment.sectionId.name}` : ""}
                    {c.enrollment?.rollNumber ? `, roll no. ${c.enrollment.rollNumber}` : ""}
                  </p>
                  <p className="mt-0.5">To move this student to another class or section, use Promotion.</p>
                </div>
              ) : (
                <>
                  <SelectField
                    form={form}
                    name="academicYearId"
                    label="Academic year"
                    options={c.yearOptions}
                    placeholder="Select year"
                    onValueChange={c.onYearChange}
                  />
                  <SelectField
                    form={form}
                    name="classId"
                    label="Class"
                    options={c.classOptions}
                    onValueChange={c.onClassChange}
                    disabled={!c.hasClasses}
                    placeholder={c.hasClasses ? "Select class" : "No classes in this year"}
                  />
                  <SelectField
                    form={form}
                    name="sectionId"
                    label="Section"
                    options={c.sectionOptions}
                    placeholder="Select section"
                  />
                  <TextField form={form} name="rollNumber" label="Roll number" placeholder="e.g. 12" />
                </>
              )}
              <div>
                <TextField
                  form={form}
                  name="admissionNumber"
                  label="Admission number"
                  disabled={c.isEdit}
                  placeholder={c.nextAdmissionNumber ? `Auto: ${c.nextAdmissionNumber}` : ""}
                />
                {!c.isEdit && (
                  <p className="mt-1 text-xs text-gray-500">
                    Leave blank to use the next number.{" "}
                    {c.canSetPrefix && (
                      <button
                        type="button"
                        className="font-medium text-primary-600 hover:underline"
                        onClick={() => c.setIsPrefixOpen(true)}
                      >
                        Change format
                      </button>
                    )}
                  </p>
                )}
              </div>
              <DateField form={form} name="admissionDate" label="Admission date" placeholder="Select admission date" />
            </div>
          </FormSection>

          <FormSection title="Parents" description="Family details, and who signs in to the parent app">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <PersonFields form={form} who="father" isLogin={!c.isEdit && c.loginContact === "father"} />
              <PersonFields form={form} who="mother" isLogin={!c.isEdit && c.loginContact === "mother"} />
            </div>

            <div className="mt-6 space-y-4">
              {!c.isEdit && (
                <SelectField
                  form={form}
                  name="loginContact"
                  label="Who signs in to the parent app"
                  options={LOGIN_CONTACT_OPTIONS}
                  className="sm:max-w-xs"
                />
              )}
              {((c.isEdit && c.hasLogin) || (!c.isEdit && c.loginContact === "guardian")) && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <TextField
                    form={form}
                    name="parentName"
                    label={c.isEdit ? "App login: name" : "Guardian's name"}
                    placeholder="Full name"
                  />
                  <TextField form={form} name="parentEmail" label="Email" placeholder="name@example.com" type="email" />
                  <TextField
                    form={form}
                    name="phoneNumber"
                    label="Phone"
                    placeholder="10-digit mobile number"
                    type="tel"
                  />
                </div>
              )}
              {c.isEdit && (
                <p className="text-xs text-gray-500">
                  {c.hasLogin
                    ? "The app login can be changed only until that parent sets up their account. "
                    : "No parent signs in for this student yet. "}
                  Add or change guardians from the student's profile.
                </p>
              )}
              {c.existingParent && (
                <p className="rounded-md bg-primary-50 px-3 py-2 text-sm text-primary-800">
                  {c.existingParent.name || c.existingParent.email} already has a parent account here. This child will
                  be added to it, so no new invite is sent.
                </p>
              )}
            </div>
          </FormSection>

          <FormSection title="Address">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <TextField
                form={form}
                name="address"
                label="Current address"
                placeholder="House no., street, area"
                className="sm:col-span-3"
              />
              <TextField form={form} name="city" label="City" placeholder="e.g. Pune" />
              <TextField form={form} name="state" label="State" placeholder="e.g. Maharashtra" />
              <TextField form={form} name="pincode" label="Pincode" placeholder="6 digits" />
            </div>
            <CheckboxField form={form} name="sameAddress" label="Permanent address is the same" className="mt-4" />
            {!c.sameAddress && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <TextField
                  form={form}
                  name="permanentAddress.address"
                  placeholder="House no., street, area"
                  label="Permanent address"
                  className="sm:col-span-3"
                />
                <TextField form={form} name="permanentAddress.city" label="City" placeholder="e.g. Pune" />
                <TextField form={form} name="permanentAddress.state" label="State" placeholder="e.g. Maharashtra" />
                <TextField form={form} name="permanentAddress.pincode" label="Pincode" placeholder="6 digits" />
              </div>
            )}
          </FormSection>

          <FormSection title="Previous school" description="Leave empty for a first school">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <TextField
                form={form}
                name="previousSchool.name"
                label="School name"
                placeholder="e.g. Little Steps School"
              />
              <TextField
                form={form}
                name="previousSchool.lastClass"
                label="Last class attended"
                placeholder="e.g. Class 5"
              />
              <TextField
                form={form}
                name="previousSchool.tcNumber"
                label="Transfer certificate no."
                placeholder="e.g. TC-1023"
              />
            </div>
          </FormSection>

          <div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-lg border border-gray-200 bg-white px-6 py-3 shadow">
            <Button variant="secondary" onClick={c.cancel} disabled={c.isSaving}>
              Cancel
            </Button>
            <Button type="submit" loading={c.isSaving}>
              {c.isEdit ? "Save changes" : "Admit student"}
            </Button>
          </div>
        </form>
      </Form>

      <PrefixDialog
        open={c.isPrefixOpen}
        prefix={c.admissionPrefix}
        isSaving={c.isSavingPrefix}
        onClose={() => c.setIsPrefixOpen(false)}
        onSave={c.savePrefix}
      />
    </div>
  );
};

export default StudentForm;
