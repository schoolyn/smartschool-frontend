import { ArrowDownTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { Input } from "@/components/ui/input";
import ButtonSpinner from "@/icons/button-spinner";
import CustomSelectDropdown from "@/components/custom-select";
import useBulkUploadModalController from "./bulk-upload-modal-controller";
import { SelectOption } from "@/types";
import { downloadStudentSampleCsv, STUDENT_CSV_OPTIONAL, STUDENT_CSV_REQUIRED } from "../../student-csv";

interface BulkUploadModalProps {
  isOpen: boolean;
  organizationId: string;
  onClose: () => void;
  onImported: () => void;
}

const BulkUploadModal = ({ isOpen, organizationId, onClose, onImported }: BulkUploadModalProps) => {
  const c = useBulkUploadModalController(organizationId, onImported);

  if (!isOpen) return null;

  const handleClose = () => {
    c.reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={handleClose}></div>

        <div className="relative w-full max-h-[90vh] overflow-y-auto transform rounded-lg bg-white text-left shadow-xl transition-all sm:max-w-xl">
          <div className="absolute top-4 right-4">
            <button type="button" className="text-gray-400 hover:text-gray-500" onClick={handleClose}>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Bulk Upload Students (CSV)</h3>
            <p className="text-sm text-gray-500 mb-3">
              Choose the class and section these students belong to, then upload a CSV file.
            </p>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 mb-4 text-sm text-gray-600 space-y-2">
              <p>
                <span className="font-medium text-gray-800">Required:</span>{" "}
                <code className="text-xs">{STUDENT_CSV_REQUIRED.join(", ")}</code>
              </p>
              <p>
                <span className="font-medium text-gray-800">Optional:</span>{" "}
                <code className="text-xs">{STUDENT_CSV_OPTIONAL.join(", ")}</code>
              </p>
              <p>Dates use YYYY-MM-DD (for example 2015-06-21). Each roll number must be unique within the section.</p>
              <button
                type="button"
                onClick={downloadStudentSampleCsv}
                className="inline-flex items-center gap-1 font-medium text-primary-600 hover:text-primary-700"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Download sample CSV
              </button>
            </div>

            {!c.result ? (
              <form onSubmit={c.handleSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                    <CustomSelectDropdown
                      placeholder="Select"
                      options={c.academicYears.map((y): SelectOption => ({ id: y.id, name: y.name }))}
                      value={(() => {
                        const y = c.academicYears.find((y) => y.id === c.academicYearId);
                        return y ? { id: y.id, name: y.name } : null;
                      })()}
                      onChange={(o) => c.setAcademicYearId(String(o.id))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <CustomSelectDropdown
                      placeholder="Select"
                      disabled={!c.academicYearId}
                      options={c.classes.map((k): SelectOption => ({ id: k.id, name: k.name }))}
                      value={(() => {
                        const k = c.classes.find((k) => k.id === c.classId);
                        return k ? { id: k.id, name: k.name } : null;
                      })()}
                      onChange={(o) => c.setClassId(String(o.id))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                    <CustomSelectDropdown
                      placeholder="Select"
                      disabled={!c.classId}
                      options={c.sections.map((s): SelectOption => ({ id: s.id, name: s.name }))}
                      value={(() => {
                        const s = c.sections.find((s) => s.id === c.sectionId);
                        return s ? { id: s.id, name: s.name } : null;
                      })()}
                      onChange={(o) => c.setSectionId(String(o.id))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">CSV File</label>
                  <Input type="file" accept=".csv,text/csv" onChange={c.handleFileChange} />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={c.isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                  >
                    {c.isSubmitting && <ButtonSpinner />}
                    Upload
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-left">
                <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
                  <p className="text-sm text-green-800">{c.result.createdCount} student(s) added successfully.</p>
                </div>

                {c.result.failed.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 max-h-48 overflow-y-auto">
                    <p className="text-sm font-medium text-red-800 mb-2">{c.result.failed.length} row(s) failed:</p>
                    <ul className="text-sm text-red-700 space-y-1">
                      {c.result.failed.map((f, i) => (
                        <li key={i}>
                          Row {f.row} ({f.name || "unnamed"}): {f.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={c.reset}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Upload Another
                  </button>
                  <button
                    onClick={handleClose}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
