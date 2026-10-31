import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

import { FileField, SelectField } from "@/shared/ui/form-fields";
import { Button } from "@/shared/ui/kit/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/shared/ui/kit/dialog";
import { Form } from "@/shared/ui/kit/form";
import useBulkUploadModalController from "./bulk-upload-modal-controller";
import { downloadStudentSampleCsv, STUDENT_CSV_OPTIONAL, STUDENT_CSV_REQUIRED } from "../../student-csv";

interface BulkUploadModalProps {
  isOpen: boolean;
  organizationId: string;
  onClose: () => void;
  onImported: () => void;
}

const BulkUploadModal = ({ isOpen, organizationId, onClose, onImported }: BulkUploadModalProps) => {
  const c = useBulkUploadModalController(organizationId, onImported);

  const handleClose = () => {
    if (c.isSubmitting) return;
    c.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent showDefaultClose className="max-w-xl">
        <div className="space-y-4 overflow-y-auto p-6">
          <div>
            <DialogTitle className="text-lg font-medium text-gray-900">Bulk Upload Students (CSV)</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-gray-500">
              Choose the class and section these students belong to, then upload a CSV file.
            </DialogDescription>
          </div>

          <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
            <p>
              <span className="font-medium text-gray-800">Required:</span>{" "}
              <code className="text-xs">{STUDENT_CSV_REQUIRED.join(", ")}</code>
            </p>
            <p>
              <span className="font-medium text-gray-800">Optional:</span>{" "}
              <code className="text-xs">{STUDENT_CSV_OPTIONAL.join(", ")}</code>
            </p>
            <p>Dates use YYYY-MM-DD (for example 2015-06-21). Each roll number must be unique within the section.</p>
            <p>
              Keep your existing admission numbers in admissionNumber; a blank one gets the next number in your series.
            </p>
            <Button variant="link" onClick={downloadStudentSampleCsv} className="gap-1">
              <ArrowDownTrayIcon className="h-4 w-4" />
              Download sample CSV
            </Button>
          </div>

          {c.result && (
            <div className="space-y-3">
              <div className="rounded-md border border-green-200 bg-green-50 p-3">
                <p className="text-sm text-green-800">{c.result.createdCount} student(s) added successfully.</p>
              </div>
              {c.result.failed.length > 0 && (
                <div className="max-h-48 overflow-y-auto rounded-md border border-red-200 bg-red-50 p-3">
                  <p className="mb-2 text-sm font-medium text-red-800">{c.result.failed.length} row(s) failed:</p>
                  <ul className="space-y-1 text-sm text-red-700">
                    {c.result.failed.map((f, i) => (
                      <li key={i}>
                        Row {f.row} ({f.name || "unnamed"}): {f.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!c.result && (
            <Form {...c.form}>
              <form id="bulk-upload-form" onSubmit={c.handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <SelectField
                    form={c.form}
                    name="academicYearId"
                    label="Academic Year"
                    options={c.academicYearOptions}
                    onValueChange={c.onAcademicYearChange}
                  />
                  <SelectField
                    form={c.form}
                    name="classId"
                    label="Class"
                    options={c.classOptions}
                    disabled={!c.academicYearId}
                    onValueChange={c.onClassChange}
                  />
                  <SelectField
                    form={c.form}
                    name="sectionId"
                    label="Section"
                    options={c.sectionOptions}
                    disabled={!c.classId}
                  />
                </div>
                <FileField
                  form={c.form}
                  name="file"
                  label="CSV file"
                  accept=".csv,text/csv"
                  maxBytes={2 * 1024 * 1024}
                  hint="CSV, up to 2 MB"
                />
              </form>
            </Form>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-3">
          {c.result ? (
            <>
              <Button variant="secondary" onClick={c.reset}>
                Upload Another
              </Button>
              <Button onClick={handleClose}>Done</Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={handleClose} disabled={c.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" form="bulk-upload-form" loading={c.isSubmitting}>
                Upload
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadModal;
