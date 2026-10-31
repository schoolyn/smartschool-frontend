import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import DataTable from "@/shared/ui/data-table";
import DeleteConfirmationDialog from "@/shared/ui/delete-confirmation-dialog";
import ErrorState from "@/shared/ui/error-state";
import { CheckboxField, DateField, SelectField, TextareaField, TextField } from "@/shared/ui/form-fields";
import PageLoader from "@/shared/ui/page-loader";
import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";
import { Card, CardTitle } from "@/shared/ui/kit/card";
import { Form } from "@/shared/ui/kit/form";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/kit/tabs";
import { LetterheadForm } from "@/features/letterhead";
import { CertificateType } from "@/entities/certificate";
import { formatDate } from "@/shared/lib";
import { certificateColumns } from "../certificate-columns";
import { CATEGORY_OPTIONS, GENDER_OPTIONS, PURPOSE_OPTIONS } from "./issue-certificate.schema";
import useIssueCertificateController from "./issue-certificate-controller";

const TABS = [
  { key: "bonafide", label: "Bonafide", icon: DocumentTextIcon },
  { key: "transfer", label: "Transfer certificate", icon: DocumentCheckIcon },
] as const;

const Notice = ({ children }: { children: React.ReactNode }) => (
  <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">{children}</p>
);

// one student's certificates: issue a bonafide or TC, with the school's letterhead alongside
const IssueCertificate = () => {
  const c = useIssueCertificateController();

  if (c.isLoading) return <PageLoader />;
  if (c.loadError || !c.draft) return <ErrorState error={c.loadError} onRetry={c.retry} />;
  const { student, records, existingTc } = c.draft;
  const { bonafideForm, transferForm } = c;
  const purposeChoice = bonafideForm.watch("purposeChoice");
  const studentLine = [
    [student.className, student.sectionName && `Section ${student.sectionName}`].filter(Boolean).join(", "),
    student.academicYear,
    student.admissionNumber && `Adm. no. ${student.admissionNumber}`,
    student.dob && `Born ${formatDate(student.dob)}`,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <Link to={c.studentsPath} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeftIcon className="h-4 w-4" /> Students
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg bg-white p-6 shadow">
        <div>
          <p className="text-lg font-semibold text-gray-900">{student.name}</p>
          <p className="text-sm text-gray-500">{studentLine.join("  ·  ")}</p>
        </div>
        <Badge tone={student.status === "active" ? "green" : "gray"}>
          {student.status === "active" ? "Enrolled" : "Left the school"}
        </Badge>
      </div>

      <Tabs value={c.type} onValueChange={(value) => c.setType(value as CertificateType)}>
        <TabsList>
          {TABS.map(({ key, label, icon: Icon }) => (
            <TabsTrigger key={key} value={key}>
              <Icon />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {c.type === "transfer" && existingTc ? (
            <Card>
              <CardTitle className="font-medium">Transfer certificate issued</CardTitle>
              <p className="mt-1 text-sm text-gray-500">
                {existingTc.number} was issued on {formatDate(existingTc.issuedAt)}. A TC is issued once; print a
                duplicate from the history if a copy is needed.
              </p>
            </Card>
          ) : !c.enrolled ? (
            <Notice>Certificates can only be issued for a student currently enrolled in a class.</Notice>
          ) : c.type === "bonafide" ? (
            <Card>
              <CardTitle className="font-medium">Bonafide certificate</CardTitle>
              <p className="mb-4 mt-1 text-sm text-gray-500">
                Confirms {student.name} studies here. Class, year, admission number and date of birth come from the
                school record.
              </p>
              <Form {...bonafideForm}>
                <form onSubmit={c.onIssueBonafide} noValidate className="space-y-4">
                  <fieldset disabled={!c.canIssue} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SelectField
                      form={bonafideForm}
                      name="gender"
                      label="Son, daughter or ward of"
                      options={GENDER_OPTIONS}
                    />
                    <TextField form={bonafideForm} name="parentName" label="Parent's name" />
                    <SelectField form={bonafideForm} name="purposeChoice" label="Purpose" options={PURPOSE_OPTIONS} />
                    {purposeChoice === "other" && (
                      <TextField form={bonafideForm} name="purposeOther" label="Write the purpose" />
                    )}
                  </fieldset>
                  {c.canIssue && (
                    <div className="flex justify-end">
                      <Button type="submit" loading={c.isIssuing}>
                        Issue bonafide
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </Card>
          ) : (
            <Card>
              <CardTitle className="font-medium">Transfer certificate</CardTitle>
              <p className="mb-4 mt-1 text-sm text-gray-500">
                Issuing it marks {student.name} as having left the school. A TC is issued once.
              </p>
              {records && (
                <dl className="mb-6 grid grid-cols-1 gap-x-6 gap-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm sm:grid-cols-2">
                  {[
                    [
                      "First admission",
                      [formatDate(records.admissionDate ?? ""), records.admissionClass].filter(Boolean).join(", ") ||
                        "-",
                    ],
                    ["Last exam", records.lastExam || "-"],
                    ["Promotion", records.promotion],
                    [
                      "Attendance this year",
                      records.workingDays ? `${records.daysPresent} of ${records.workingDays} days` : "-",
                    ],
                    ["Fees", records.feesStatus],
                    ["Subjects", records.subjects.join(", ") || "-"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
                      <dd className="mt-0.5 text-gray-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <Form {...transferForm}>
                <form onSubmit={c.onReviewTransfer} noValidate className="space-y-4">
                  <fieldset disabled={!c.canIssue} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SelectField
                      form={transferForm}
                      name="gender"
                      label="Son, daughter or ward"
                      options={GENDER_OPTIONS}
                    />
                    <SelectField form={transferForm} name="category" label="Category" options={CATEGORY_OPTIONS} />
                    <TextField form={transferForm} name="fatherName" label="Father's / guardian's name" />
                    <TextField form={transferForm} name="motherName" label="Mother's name" />
                    <TextField form={transferForm} name="nationality" label="Nationality" />
                    <TextField form={transferForm} name="conduct" label="General conduct" />
                    <DateField form={transferForm} name="leavingDate" label="Date of leaving" />
                    <TextField form={transferForm} name="reason" label="Reason for leaving" />
                    <TextareaField
                      form={transferForm}
                      name="remarks"
                      label="Remarks (optional)"
                      rows={2}
                      className="sm:col-span-2"
                    />
                  </fieldset>
                  {c.dueText && (
                    <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-amber-700" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-amber-900">This student has {c.dueText} in fees.</p>
                        <CheckboxField
                          form={transferForm}
                          name="acknowledgeDues"
                          label="I know about the unpaid fees and want to issue the TC anyway"
                          disabled={!c.canIssue}
                        />
                      </div>
                    </div>
                  )}
                  {c.canIssue && (
                    <div className="flex justify-end">
                      <Button type="submit" loading={c.isIssuing}>
                        Review &amp; issue TC
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </Card>
          )}

          <div>
            <h3 className="mb-3 text-lg font-medium text-gray-900">Certificates for {student.name}</h3>
            <DataTable
              columns={certificateColumns({
                download: c.download,
                duplicate: c.duplicate,
                busyId: c.duplicatingId,
                withStudent: false,
              })}
              data={c.history}
              getRowId={(row) => row.id}
              isLoading={c.isLoadingHistory}
              empty={{
                title: "Nothing issued yet",
                description: "Certificates you issue for this student show up here.",
              }}
            />
          </div>
        </div>

        <LetterheadForm organizationId={c.organizationId} letterhead={c.letterhead} readOnly={!c.canIssue} compact />
      </div>

      <DeleteConfirmationDialog
        open={c.confirmTc}
        onClose={c.closeConfirmTc}
        onConfirm={c.onIssueTransfer}
        isLoading={c.isIssuing}
        title={`Issue a transfer certificate for ${student.name}?`}
        description={`${student.name} will be marked as having left the school on ${formatDate(transferForm.getValues("leavingDate"))}, and removed from class lists. Their records stay. A TC can be issued only once.`}
        confirmLabel="Issue TC"
      />
    </div>
  );
};

export default IssueCertificate;
