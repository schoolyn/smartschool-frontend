import { UseFormReturn } from "react-hook-form";

import { IStudentFormData, SelectOption } from "@/types";
import { useGetAcademicYears, useGetClasses, useGetSections } from "@/pages/admin/classes/service/academics-service";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CustomSelectDropdown from "@/components/custom-select";

interface IStudentDetailsFormProps {
  t: (key: string) => string;
  organizationId: string;
  form: UseFormReturn<IStudentFormData>;
  isEditStudent?: boolean;
}

const StudentDetailsForm = ({ t, organizationId, form, isEditStudent }: IStudentDetailsFormProps) => {
  const academicYearId = form.watch("academicYearId");
  const classId = form.watch("classId");
  const academicYears = useGetAcademicYears(organizationId);
  const classes = useGetClasses(organizationId, academicYearId, "active");
  const sections = useGetSections(organizationId, classId, "active");

  return (
    <>
      <h3 className="text-md font-medium mb-4">{t("labels.student_details")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Column 1 */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="admissionNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("labels.admission_no")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("messages.enter_admission_no")}
                    disabled={isEditStudent}
                    title={isEditStudent ? "Admission number can't be changed once assigned." : undefined}
                    className={isEditStudent ? "bg-gray-100 text-gray-500 cursor-not-allowed" : undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="admissionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("labels.admission_date")}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isEditStudent ? (
            <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-600">
              <p className="font-medium text-gray-700 mb-1">Class / Section / Roll No.</p>
              <p>Current: {classId ? "assigned" : "unassigned"}, use Promote/Transfer to change enrollment.</p>
            </div>
          ) : (
            <>
              <FormField
                control={form.control}
                name="academicYearId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year</FormLabel>
                    <FormControl>
                      <CustomSelectDropdown
                        placeholder="Select academic year"
                        options={(academicYears.data?.items || []).map((y): SelectOption => ({
                          id: y.id,
                          name: y.name,
                        }))}
                        value={(() => {
                          const y = (academicYears.data?.items || []).find((y) => y.id === field.value);
                          return y ? { id: y.id, name: y.name } : null;
                        })()}
                        onChange={(o) => field.onChange(String(o.id))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <FormControl>
                      <CustomSelectDropdown
                        placeholder="Select class"
                        disabled={!academicYearId}
                        options={(classes.data?.items || []).map((k): SelectOption => ({ id: k.id, name: k.name }))}
                        value={(() => {
                          const k = (classes.data?.items || []).find((k) => k.id === field.value);
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
                control={form.control}
                name="sectionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <FormControl>
                      <CustomSelectDropdown
                        placeholder="Select section"
                        disabled={!classId}
                        options={(sections.data?.items || []).map((s): SelectOption => ({ id: s.id, name: s.name }))}
                        value={(() => {
                          const s = (sections.data?.items || []).find((s) => s.id === field.value);
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
                control={form.control}
                name="rollNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("labels.roll_number")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("messages.enter_roll_no")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("labels.fullname")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("messages.enter_fullname")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("labels.date_of_birth")}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("labels.city")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("messages.enter_city")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("labels.state")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("messages.enter_state")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Full width field */}
      <div className="mt-4">
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("labels.address")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("messages.enter_full_address")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default StudentDetailsForm;
