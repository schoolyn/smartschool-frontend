import Spinner from "@/components/spinner";
import NoRecordFound from "@/components/no-record-found";
import SectionHeader from "@/components/section-header";
import { useTranslation } from "react-i18next";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ButtonSpinner from "@/icons/button-spinner";
import useTeachersController from "./teachers-controller";

const AdminTeachers = () => {
  const { t } = useTranslation();
  const c = useTeachersController();

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader title="Teachers" description="Teacher directory and staff profiles" />

      <div>
        <div className="bg-white shadow rounded-lg">
          {c.isLoading ? (
            <Spinner />
          ) : c.teachers.length === 0 ? (
            <NoRecordFound t={t} searchTerm="" clearFilters={() => {}} />
          ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {c.teachers.map((teacher) => (
                  <tr key={teacher.userId}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{teacher.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{teacher.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{teacher.staffProfile?.employeeCode || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{teacher.staffProfile?.designation || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{teacher.staffProfile?.department || "-"}</td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button onClick={() => c.openEdit(teacher)} className="text-primary-600 hover:text-primary-800">
                        Edit profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>

      {c.editingTeacher && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={c.closeEdit}></div>

            <div className="relative w-full max-h-[90vh] overflow-y-auto transform rounded-lg bg-white text-left shadow-xl transition-all sm:max-w-lg">
              <div className="absolute top-4 right-4">
                <button type="button" className="text-gray-400 hover:text-gray-500" onClick={c.closeEdit}>
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="p-4 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Staff Profile — {c.editingTeacher.name}</h3>

                <Form {...c.form}>
                  <form onSubmit={c.submitProfile} className="space-y-4 text-left" noValidate>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={c.form.control}
                        name="employeeCode"
                        render={({ field }) => {
                          const isLocked = !!c.editingTeacher?.staffProfile?.employeeCode;
                          return (
                            <FormItem>
                              <FormLabel>Employee Code</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={isLocked}
                                  className={isLocked ? "bg-gray-100 text-gray-500 cursor-not-allowed" : undefined}
                                  title={isLocked ? "Employee code can't be changed once assigned." : undefined}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={c.form.control}
                        name="dateOfJoining"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Joining</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={c.form.control}
                      name="designation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Designation</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={c.form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={c.form.control}
                      name="qualification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qualification</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={c.closeEdit}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={c.isSaving}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                      >
                        {c.isSaving && <ButtonSpinner />}
                        Save
                      </button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeachers;
