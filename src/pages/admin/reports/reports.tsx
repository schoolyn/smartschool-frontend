import { useTranslation } from "react-i18next";

import SectionHeader from "@/components/section-header";
import CustomSelectDropdown from "@/components/custom-select";
import DatePicker from "@/components/date-picker";
import Spinner from "@/components/spinner";
import NoRecordFound from "@/components/no-record-found";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, TableEmpty } from "@/components/table";
import { SelectOption } from "@/types";
import { exportToCsv } from "@/utils";
import { useReportsController } from "./reports-controller";

const inputClass =
  "mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm";
const btnPrimary =
  "inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50";
const btnSecondary =
  "inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50";

const typeOptions: SelectOption[] = [
  { id: "unit_test", name: "Unit Test" },
  { id: "mid_term", name: "Mid Term" },
  { id: "final", name: "Final" },
  { id: "other", name: "Other" },
];

const tabs = [
  { key: "exams", label: "Exams" },
  { key: "marks", label: "Marks Entry" },
  { key: "schemes", label: "Grading Schemes" },
] as const;

const statusBadge = (status: string) => {
  const tone =
    status === "published"
      ? "bg-green-100 text-green-800"
      : status === "verified"
      ? "bg-gray-100 text-gray-800"
      : status === "marks_entry" || status === "scheduled"
      ? "bg-amber-100 text-amber-800"
      : "bg-gray-100 text-gray-700";
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${tone}`}>{status.replace("_", " ")}</span>;
};

const AdminReports = () => {
  const { t } = useTranslation();
  const c = useReportsController();

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader title="Exams & Results" description="Set up grading, define exams, enter marks and publish results" />

      <div className="mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => c.setActiveTab(tab.key)}
              className={`whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium ${
                c.activeTab === tab.key ? "border-primary-500 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {c.activeTab === "schemes" && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Create Grading Scheme</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input className={inputClass} value={c.schemeName} onChange={(e) => c.setSchemeName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pass Percent</label>
                <input
                  type="number"
                  className={inputClass}
                  value={c.passPercent}
                  onChange={(e) => c.setPassPercent(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Grade Bands</label>
              <button type="button" onClick={c.addBandRow} className="text-xs text-primary-600">
                + Add band
              </button>
            </div>
            {c.bands.map((band, idx) => (
              <div key={idx} className="grid grid-cols-5 gap-2 mb-2 items-center">
                <input
                  className={inputClass}
                  placeholder="Grade (e.g. A+)"
                  value={band.grade}
                  onChange={(e) => c.updateBandRow(idx, "grade", e.target.value)}
                />
                <input
                  type="number"
                  className={inputClass}
                  placeholder="Min %"
                  value={band.minPercent}
                  onChange={(e) => c.updateBandRow(idx, "minPercent", e.target.value)}
                />
                <input
                  type="number"
                  className={inputClass}
                  placeholder="Max %"
                  value={band.maxPercent}
                  onChange={(e) => c.updateBandRow(idx, "maxPercent", e.target.value)}
                />
                <input
                  type="number"
                  className={inputClass}
                  placeholder="Grade point"
                  value={band.gradePoint}
                  onChange={(e) => c.updateBandRow(idx, "gradePoint", e.target.value)}
                />
                <button type="button" onClick={() => c.removeBandRow(idx)} className="text-sm text-red-600 justify-self-start">
                  Remove
                </button>
              </div>
            ))}

            <button onClick={c.handleCreateGradingScheme} disabled={c.isCreatingScheme} className={`${btnPrimary} mt-4`}>
              Create scheme
            </button>
          </div>

          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Existing Schemes</h2>
            {c.isLoadingSchemes ? (
              <Spinner />
            ) : (
              <Table>
                <TableHeader>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Pass %</TableHead>
                  <TableHead className="text-center">Bands</TableHead>
                </TableHeader>
                <TableBody>
                  {c.gradingSchemes.length === 0 ? (
                    <TableEmpty colSpan={3} message="No grading schemes yet — create one above." />
                  ) : (
                    c.gradingSchemes.map((scheme) => (
                      <TableRow key={scheme.id}>
                        <TableCell className="font-medium text-gray-900">{scheme.name}</TableCell>
                        <TableCell className="text-center">{scheme.passPercent}%</TableCell>
                        <TableCell className="text-center">{scheme.bands.map((b) => b.grade).join(", ")}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}

      {c.activeTab === "exams" && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Exams</h2>
              <button onClick={() => c.setShowExamForm(!c.showExamForm)} className={btnPrimary}>
                + Create Exam
              </button>
            </div>

            {c.showExamForm && (
              <div className="border border-gray-200 rounded-md p-4 mb-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input className={inputClass} value={c.examName} onChange={(e) => c.setExamName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                    <input className={inputClass} value={c.examTerm} onChange={(e) => c.setExamTerm(e.target.value)} />
                  </div>
                  <CustomSelectDropdown
                    label="Type"
                    options={typeOptions}
                    value={typeOptions.find((o) => o.id === c.examType) || typeOptions[0]}
                    onChange={(o) => c.setExamType(String(o.id))}
                  />
                  <DatePicker label="Start Date" value={c.examStart} onChange={c.setExamStart} />
                  <DatePicker label="End Date" value={c.examEnd} onChange={c.setExamEnd} />
                  <CustomSelectDropdown
                    label="Grading Scheme"
                    placeholder="Select scheme"
                    options={c.gradingSchemes.map((s): SelectOption => ({ id: s.id, name: s.name }))}
                    value={(() => {
                      const s = c.gradingSchemes.find((s) => s.id === c.examGradingSchemeId);
                      return s ? { id: s.id, name: s.name } : null;
                    })()}
                    onChange={(o) => c.setExamGradingSchemeId(String(o.id))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Classes</label>
                  <div className="flex flex-wrap gap-2">
                    {c.classOptions.map((k) => (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => c.toggleExamClass(k.id)}
                        className={`px-3 py-1 rounded-full text-xs border ${
                          c.examClassIds.includes(k.id)
                            ? "bg-primary-100 text-primary-800 border-primary-300"
                            : "bg-white text-gray-600 border-gray-300"
                        }`}
                      >
                        {k.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" className={btnSecondary} onClick={() => c.setShowExamForm(false)}>
                    {t("buttons.cancel")}
                  </button>
                  <button onClick={c.handleCreateExam} disabled={c.isCreatingExam} className={btnPrimary}>
                    {t("buttons.save")}
                  </button>
                </div>
              </div>
            )}

            {c.isLoadingExams ? (
              <Spinner />
            ) : c.exams.length === 0 ? (
              <NoRecordFound t={t} searchTerm="" clearFilters={() => {}} />
            ) : (
              <div className="divide-y divide-gray-100">
                {c.exams.map((exam) => (
                  <div key={exam.id} className="py-3">
                    <div className="flex justify-between items-center">
                      <div className="cursor-pointer" onClick={() => c.toggleExpandExam(exam.id, exam.classIds[0]?.id)}>
                        <p className="font-medium text-gray-900">
                          {exam.name} {statusBadge(exam.status)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(exam.startDate).toLocaleDateString()} – {new Date(exam.endDate).toLocaleDateString()} ·{" "}
                          {exam.classIds.map((k) => k.name).join(", ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {exam.status !== "published" && (
                          <button
                            onClick={() => c.handlePublishExam(exam.id)}
                            disabled={c.isPublishing}
                            className="text-sm text-primary-600 hover:text-primary-800"
                          >
                            Publish
                          </button>
                        )}
                        <span
                          className="text-sm text-primary-600 cursor-pointer"
                          onClick={() => c.toggleExpandExam(exam.id, exam.classIds[0]?.id)}
                        >
                          {c.expandedExamId === exam.id ? "Hide" : "Manage subjects"}
                        </span>
                      </div>
                    </div>

                    {c.expandedExamId === exam.id && (
                      <div className="mt-4 bg-gray-50 rounded-md p-4">
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                          <div className="flex flex-wrap gap-2">
                            {exam.classIds.map((k) => (
                              <button
                                key={k.id}
                                type="button"
                                onClick={() => c.setSubjectClassId(k.id)}
                                className={`px-3 py-1 rounded-full text-xs border ${
                                  c.subjectClassId === k.id
                                    ? "bg-primary-100 text-primary-800 border-primary-300"
                                    : "bg-white text-gray-600 border-gray-300"
                                }`}
                              >
                                {k.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium text-gray-700">Add subjects</p>
                          <button type="button" onClick={c.addSubjectRow} className="text-xs text-primary-600">
                            + Add row
                          </button>
                        </div>
                        {c.subjectRows.map((row, idx) => (
                          <div key={idx} className="grid grid-cols-6 gap-2 mb-2 items-center">
                            <div className="col-span-2">
                              <CustomSelectDropdown
                                placeholder="Subject"
                                options={c.subjectOptions.map((s): SelectOption => ({ id: s.id, name: s.name }))}
                                value={(() => {
                                  const s = c.subjectOptions.find((s) => s.id === row.subjectId);
                                  return s ? { id: s.id, name: s.name } : null;
                                })()}
                                onChange={(o) => c.updateSubjectRow(idx, "subjectId", String(o.id))}
                              />
                            </div>
                            <input
                              type="number"
                              className={inputClass}
                              placeholder="Max marks"
                              value={row.maxMarks}
                              onChange={(e) => c.updateSubjectRow(idx, "maxMarks", e.target.value)}
                            />
                            <input
                              type="number"
                              className={inputClass}
                              placeholder="Pass marks"
                              value={row.passMarks}
                              onChange={(e) => c.updateSubjectRow(idx, "passMarks", e.target.value)}
                            />
                            <label className="flex items-center gap-2 text-xs text-gray-700">
                              <input
                                type="checkbox"
                                checked={row.hasPractical}
                                onChange={(e) => c.updateSubjectRow(idx, "hasPractical", e.target.checked)}
                              />
                              Practical
                            </label>
                            <button type="button" onClick={() => c.removeSubjectRow(idx)} className="text-sm text-red-600 justify-self-start">
                              Remove
                            </button>
                          </div>
                        ))}
                        <button onClick={c.handleAddExamSubjects} disabled={c.isAddingSubjects} className={`${btnPrimary} mt-2`}>
                          Save subjects
                        </button>

                        {c.examSubjectsForExpanded.length > 0 && (
                          <div className="mt-4">
                            <Table>
                              <TableHeader>
                                <TableHead>Subject</TableHead>
                                <TableHead className="text-center">Max Marks</TableHead>
                                <TableHead className="text-center">Pass Marks</TableHead>
                                <TableHead className="text-center">Practical</TableHead>
                              </TableHeader>
                              <TableBody>
                                {c.examSubjectsForExpanded.map((es) => (
                                  <TableRow key={es.id}>
                                    <TableCell className="font-medium text-gray-900">
                                      {typeof es.subjectId === "object" ? es.subjectId.name : ""}
                                    </TableCell>
                                    <TableCell className="text-center">{es.maxMarks}</TableCell>
                                    <TableCell className="text-center">{es.passMarks}</TableCell>
                                    <TableCell className="text-center">
                                      {es.hasPractical ? `Yes (${es.practicalMaxMarks})` : "No"}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {c.activeTab === "marks" && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Select exam, class, section &amp; subject</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <CustomSelectDropdown
                placeholder="Select exam"
                options={c.exams.map((e): SelectOption => ({ id: e.id, name: e.name }))}
                value={(() => {
                  const e = c.exams.find((e) => e.id === c.marksExamId);
                  return e ? { id: e.id, name: e.name } : null;
                })()}
                onChange={(o) => {
                  c.setMarksExamId(String(o.id));
                  c.setMarksClassId("");
                  c.setMarksSectionId("");
                  c.setMarksExamSubjectId("");
                }}
              />
              <CustomSelectDropdown
                placeholder="Select class"
                disabled={!c.marksExamId}
                options={(c.exams.find((e) => e.id === c.marksExamId)?.classIds || []).map(
                  (k): SelectOption => ({ id: k.id, name: k.name })
                )}
                value={(() => {
                  const k = (c.exams.find((e) => e.id === c.marksExamId)?.classIds || []).find((k) => k.id === c.marksClassId);
                  return k ? { id: k.id, name: k.name } : null;
                })()}
                onChange={(o) => {
                  c.setMarksClassId(String(o.id));
                  c.setMarksSectionId("");
                  c.setMarksExamSubjectId("");
                }}
              />
              <CustomSelectDropdown
                placeholder="Select section"
                disabled={!c.marksClassId}
                options={c.sectionOptions.map((s): SelectOption => ({ id: s.id, name: s.name }))}
                value={(() => {
                  const s = c.sectionOptions.find((s) => s.id === c.marksSectionId);
                  return s ? { id: s.id, name: s.name } : null;
                })()}
                onChange={(o) => c.setMarksSectionId(String(o.id))}
              />
              <CustomSelectDropdown
                placeholder="Select subject"
                disabled={!c.marksClassId}
                options={c.examSubjectsForMarks.map(
                  (es): SelectOption => ({
                    id: es.id,
                    name: typeof es.subjectId === "object" ? es.subjectId.name : "",
                  })
                )}
                value={(() => {
                  const es = c.examSubjectsForMarks.find((es) => es.id === c.marksExamSubjectId);
                  return es ? { id: es.id, name: typeof es.subjectId === "object" ? es.subjectId.name : "" } : null;
                })()}
                onChange={(o) => c.setMarksExamSubjectId(String(o.id))}
              />
            </div>
          </div>

          {c.marksSectionId && c.marksExamSubjectId && (
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Marks Sheet</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      exportToCsv(
                        "marks-sheet",
                        c.marksSheet.map((item) => {
                          const draft = c.marksDraft[item.student.id];
                          return {
                            student: item.student.name,
                            roll_number: item.student.rollNumber,
                            theory_marks: draft?.isAbsent ? "" : draft?.theoryMarks ?? "",
                            practical_marks: draft?.isAbsent ? "" : draft?.practicalMarks ?? "",
                            absent: draft?.isAbsent ? "Yes" : "No",
                            status: item.marks?.status ?? "",
                          };
                        })
                      )
                    }
                    className={btnSecondary}
                  >
                    Export CSV
                  </button>
                  <button onClick={c.handleVerifyMarks} disabled={c.isVerifyingMarks} className={btnSecondary}>
                    Verify all
                  </button>
                  <button onClick={c.handleSaveMarks} disabled={c.isSavingMarks} className={btnPrimary}>
                    Save marks
                  </button>
                </div>
              </div>

              {c.isLoadingMarksSheet ? (
                <Spinner />
              ) : c.marksSheet.length === 0 ? (
                <NoRecordFound t={t} searchTerm="" clearFilters={() => {}} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-center">Theory</TableHead>
                    <TableHead className="text-center">Practical</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableHeader>
                  <TableBody>
                    {c.marksSheet.map((item) => {
                      const draft = c.marksDraft[item.student.id] || {
                        theoryMarks: "",
                        practicalMarks: "",
                        isAbsent: false,
                      };
                      return (
                        <TableRow key={item.student.id}>
                          <TableCell className="font-medium text-gray-900">
                            {item.student.name} <span className="text-xs text-gray-400">#{item.student.rollNumber}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <input
                              type="number"
                              disabled={draft.isAbsent}
                              className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm text-center disabled:bg-gray-100"
                              value={draft.theoryMarks}
                              onChange={(e) => c.updateMarksDraft(item.student.id, "theoryMarks", e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <input
                              type="number"
                              disabled={draft.isAbsent}
                              className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm text-center disabled:bg-gray-100"
                              value={draft.practicalMarks}
                              onChange={(e) => c.updateMarksDraft(item.student.id, "practicalMarks", e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <input
                              type="checkbox"
                              checked={draft.isAbsent}
                              onChange={(e) => c.updateMarksDraft(item.student.id, "isAbsent", e.target.checked)}
                            />
                          </TableCell>
                          <TableCell className="text-center">{item.marks ? statusBadge(item.marks.status) : "—"}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
