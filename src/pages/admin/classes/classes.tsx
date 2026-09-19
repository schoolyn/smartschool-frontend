import { useTranslation } from "react-i18next";

import Spinner from "@/components/spinner";
import NoRecordFound from "@/components/no-record-found";
import SectionHeader from "@/components/section-header";
import CustomSelectDropdown from "@/components/custom-select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useClassesController from "./classes-controller";
import { SelectOption } from "@/types";

const roleOptions: SelectOption[] = [
  { id: "SUBJECT_TEACHER", name: "Subject Teacher" },
  { id: "CLASS_TEACHER", name: "Class Teacher" },
];

const tabs = [
  { key: "years", label: "Academic Years" },
  { key: "classes", label: "Classes" },
  { key: "sections", label: "Sections" },
  { key: "subjects", label: "Subjects" },
  { key: "teachers", label: "Teacher Assignments" },
] as const;

const btnPrimary =
  "inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50";
const btnSecondary =
  "inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50";

const AdminClasses = () => {
  const { t } = useTranslation();
  const c = useClassesController();

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        title="Academics"
        description="Manage academic years, classes, sections, subjects and teacher assignments"
      />

      <div className="mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => c.setActiveTab(tab.key)}
              className={`whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium ${
                c.activeTab === tab.key
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {c.activeTab === "years" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-4 flex justify-between items-center border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Academic Years</h2>
              <button className={btnPrimary} onClick={() => c.setShowYearForm(!c.showYearForm)}>
                + Add Academic Year
              </button>
            </div>

            {c.showYearForm && (
              <Form {...c.yearForm}>
                <form
                  onSubmit={c.submitYear}
                  className="p-4 border-b border-gray-200 grid grid-cols-1 sm:grid-cols-4 gap-4"
                  noValidate
                >
                  <FormField
                    control={c.yearForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (e.g. 2026-27)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={c.yearForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={c.yearForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={c.yearForm.control}
                    name="isCurrent"
                    render={({ field }) => (
                      <div className="flex items-end gap-3">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                          Set as current
                        </label>
                      </div>
                    )}
                  />
                  <div className="sm:col-span-4 flex justify-end gap-3">
                    <button type="button" className={btnSecondary} onClick={() => c.setShowYearForm(false)}>
                      {t("buttons.cancel")}
                    </button>
                    <button type="submit" disabled={c.isCreatingYear} className={btnPrimary}>
                      {t("buttons.save")}
                    </button>
                  </div>
                </form>
              </Form>
            )}

            {c.isLoadingYears ? (
              <Spinner />
            ) : c.academicYears.length === 0 ? (
              <NoRecordFound t={t} searchTerm="" clearFilters={() => {}} />
            ) : (
              <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {c.academicYears.map((y) => (
                    <tr key={y.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{y.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(y.startDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(y.endDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm">
                        {y.isCurrent && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        )}

        {c.activeTab === "classes" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-4 flex justify-between items-center border-b border-gray-200 gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700 whitespace-nowrap">Academic Year:</label>
                <div className="w-48">
                  <CustomSelectDropdown
                    options={c.academicYears.map((y): SelectOption => ({ id: y.id, name: y.name }))}
                    value={(() => {
                      const y = c.academicYears.find((y) => y.id === c.selectedAcademicYearId);
                      return y ? { id: y.id, name: y.name } : null;
                    })()}
                    onChange={(o) => c.setSelectedAcademicYearId(String(o.id))}
                  />
                </div>
              </div>
              <button
                className={btnPrimary}
                onClick={() => c.setShowClassForm(!c.showClassForm)}
                disabled={!c.selectedAcademicYearId}
              >
                + Add Class
              </button>
            </div>

            {c.showClassForm && (
              <Form {...c.classForm}>
                <form
                  onSubmit={c.submitClass}
                  className="p-4 border-b border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4"
                  noValidate
                >
                  <FormField
                    control={c.classForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (e.g. Class 10)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={c.classForm.control}
                    name="numericLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numeric Level</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-end justify-end gap-3">
                    <button type="button" className={btnSecondary} onClick={() => c.setShowClassForm(false)}>
                      {t("buttons.cancel")}
                    </button>
                    <button type="submit" disabled={c.isCreatingClass} className={btnPrimary}>
                      {t("buttons.save")}
                    </button>
                  </div>
                </form>
              </Form>
            )}

            {c.isLoadingClasses ? (
              <Spinner />
            ) : c.classes.length === 0 ? (
              <NoRecordFound t={t} searchTerm="" clearFilters={() => {}} />
            ) : (
              <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {c.classes.map((k) => (
                    <tr key={k.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{k.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{k.numericLevel ?? "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{k.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        )}

        {c.activeTab === "sections" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-4 flex justify-between items-center border-b border-gray-200 gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700 whitespace-nowrap">Class:</label>
                <div className="w-48">
                  <CustomSelectDropdown
                    options={c.classes.map((k): SelectOption => ({ id: k.id, name: k.name }))}
                    value={(() => {
                      const k = c.classes.find((k) => k.id === c.selectedClassId);
                      return k ? { id: k.id, name: k.name } : null;
                    })()}
                    onChange={(o) => c.setSelectedClassId(String(o.id))}
                  />
                </div>
              </div>
              <button
                className={btnPrimary}
                onClick={() => c.setShowSectionForm(!c.showSectionForm)}
                disabled={!c.selectedClassId}
              >
                + Add Section
              </button>
            </div>

            {c.showSectionForm && (
              <Form {...c.sectionForm}>
                <form
                  onSubmit={c.submitSection}
                  className="p-4 border-b border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4"
                  noValidate
                >
                  <FormField
                    control={c.sectionForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (e.g. A)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={c.sectionForm.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-end justify-end gap-3">
                    <button type="button" className={btnSecondary} onClick={() => c.setShowSectionForm(false)}>
                      {t("buttons.cancel")}
                    </button>
                    <button type="submit" disabled={c.isCreatingSection} className={btnPrimary}>
                      {t("buttons.save")}
                    </button>
                  </div>
                </form>
              </Form>
            )}

            {c.isLoadingSections ? (
              <Spinner />
            ) : c.sections.length === 0 ? (
              <NoRecordFound t={t} searchTerm="" clearFilters={() => {}} />
            ) : (
              <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class Teacher</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {c.sections.map((s) => (
                    <tr key={s.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{s.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{s.classTeacherId?.name || "Unassigned"}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{s.capacity ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        )}

        {c.activeTab === "subjects" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-4 flex justify-between items-center border-b border-gray-200 gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700 whitespace-nowrap">Academic Year:</label>
                <div className="w-48">
                  <CustomSelectDropdown
                    options={c.academicYears.map((y): SelectOption => ({ id: y.id, name: y.name }))}
                    value={(() => {
                      const y = c.academicYears.find((y) => y.id === c.selectedAcademicYearId);
                      return y ? { id: y.id, name: y.name } : null;
                    })()}
                    onChange={(o) => c.setSelectedAcademicYearId(String(o.id))}
                  />
                </div>
              </div>
              <button
                className={btnPrimary}
                onClick={() => c.setShowSubjectForm(!c.showSubjectForm)}
                disabled={!c.selectedAcademicYearId}
              >
                + Add Subject
              </button>
            </div>

            {c.showSubjectForm && (
              <Form {...c.subjectForm}>
                <form
                  onSubmit={c.submitSubject}
                  className="p-4 border-b border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4"
                  noValidate
                >
                  <FormField
                    control={c.subjectForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={c.subjectForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-end justify-end gap-3">
                    <button type="button" className={btnSecondary} onClick={() => c.setShowSubjectForm(false)}>
                      {t("buttons.cancel")}
                    </button>
                    <button type="submit" disabled={c.isCreatingSubject} className={btnPrimary}>
                      {t("buttons.save")}
                    </button>
                  </div>
                </form>
              </Form>
            )}

            {c.isLoadingSubjects ? (
              <Spinner />
            ) : c.subjects.length === 0 ? (
              <NoRecordFound t={t} searchTerm="" clearFilters={() => {}} />
            ) : (
              <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {c.subjects.map((s) => (
                    <tr key={s.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{s.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">{s.code}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{s.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        )}

        {c.activeTab === "teachers" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-4 flex justify-between items-center border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Teacher Assignments</h2>
              <button className={btnPrimary} onClick={() => c.setShowAssignForm(!c.showAssignForm)}>
                + Assign Teacher
              </button>
            </div>

            {c.showAssignForm && (
              <Form {...c.assignForm}>
                <form
                  onSubmit={c.submitAssign}
                  className="p-4 border-b border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4"
                  noValidate
                >
                  <FormField
                    control={c.assignForm.control}
                    name="teacherId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher</FormLabel>
                        <FormControl>
                          <CustomSelectDropdown
                            placeholder="Select teacher"
                            options={c.teachers.map((tch): SelectOption => ({
                              id: tch.id,
                              name: `${tch.name} (${tch.email})`,
                            }))}
                            value={(() => {
                              const tch = c.teachers.find((tch) => tch.id === field.value);
                              return tch ? { id: tch.id, name: `${tch.name} (${tch.email})` } : null;
                            })()}
                            onChange={(o) => field.onChange(String(o.id))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={c.assignForm.control}
                    name="classId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class</FormLabel>
                        <FormControl>
                          <CustomSelectDropdown
                            placeholder="Select class"
                            options={c.classes.map((k): SelectOption => ({ id: k.id, name: k.name }))}
                            value={(() => {
                              const k = c.classes.find((k) => k.id === field.value);
                              return k ? { id: k.id, name: k.name } : null;
                            })()}
                            onChange={(o) => field.onChange(String(o.id))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={c.assignForm.control}
                    name="sectionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <FormControl>
                          <CustomSelectDropdown
                            placeholder="Select section"
                            disabled={!c.assignForm.watch("classId")}
                            options={c.assignSections.map((s): SelectOption => ({ id: s.id, name: s.name }))}
                            value={(() => {
                              const s = c.assignSections.find((s) => s.id === field.value);
                              return s ? { id: s.id, name: s.name } : null;
                            })()}
                            onChange={(o) => field.onChange(String(o.id))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={c.assignForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <CustomSelectDropdown
                            options={roleOptions}
                            value={roleOptions.find((o) => o.id === field.value) || roleOptions[0]}
                            onChange={(o) => field.onChange(o.id as "SUBJECT_TEACHER" | "CLASS_TEACHER")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {c.assignForm.watch("role") === "SUBJECT_TEACHER" && (
                    <FormField
                      control={c.assignForm.control}
                      name="subjectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <CustomSelectDropdown
                              placeholder="Select subject"
                              options={c.subjects.map((s): SelectOption => ({ id: s.id, name: s.name }))}
                              value={(() => {
                                const s = c.subjects.find((s) => s.id === field.value);
                                return s ? { id: s.id, name: s.name } : null;
                              })()}
                              onChange={(o) => field.onChange(String(o.id))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <div className="flex items-end justify-end gap-3">
                    <button type="button" className={btnSecondary} onClick={() => c.setShowAssignForm(false)}>
                      {t("buttons.cancel")}
                    </button>
                    <button type="submit" disabled={c.isAssigning} className={btnPrimary}>
                      {t("buttons.save")}
                    </button>
                  </div>
                </form>
              </Form>
            )}

            {c.isLoadingAssignments ? (
              <Spinner />
            ) : c.teacherAssignments.length === 0 ? (
              <NoRecordFound t={t} searchTerm="" clearFilters={() => {}} />
            ) : (
              <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {c.teacherAssignments.map((a) => (
                    <tr key={a.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{a.teacherUserId?.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{a.classId?.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{a.sectionId?.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{a.subjectId?.name || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{a.assignmentRole}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClasses;
