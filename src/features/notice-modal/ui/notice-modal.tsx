import { UseFormReturn } from "react-hook-form";
import { SparklesIcon, EyeIcon } from "@heroicons/react/24/solid";

import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/kit/dialog";
import { FileField } from "@/shared/ui/form-fields";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/kit/form";
import { Input } from "@/shared/ui/kit/input";
import { Textarea } from "@/shared/ui/kit/textarea";
import DatePicker from "@/shared/ui/date-picker";
import SelectDropdown from "@/shared/ui/custom-select";
import ButtonSpinner from "@/shared/ui/icons/button-spinner";
import { IClass, ISection } from "@/entities/academics";
import { NoticeAudienceScope } from "@/entities/notice";
import { SelectOption } from "@/shared/types";
import { NoticeFormValues } from "../model/notice-modal.schema";
import NoticePreviewModal from "./notice-preview-modal";

interface NoticeModalProps {
  t: (key: string) => string;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: UseFormReturn<NoticeFormValues>;
  noticeTypeOptions: SelectOption[];
  selectedNoticeType: SelectOption;
  isGeneratingContent: boolean;
  isAIModalOpen: boolean;
  isAIPreviewModalOpen: boolean;
  classOptions: IClass[];
  sectionOptions: ISection[];
  roleOptions: string[];
  sectionPickerClassId: string;
  setSectionPickerClassId: (classId: string) => void;
  handleAudienceScopeChange: (scope: NoticeAudienceScope) => void;
  handleAudienceRoleToggle: (role: string) => void;
  handleAudienceClassToggle: (classId: string) => void;
  handleAudienceSectionToggle: (sectionId: string) => void;
  handleNoticeTypeChange: (option: SelectOption) => void;
  generateContentWithAI: () => void;
  onClickAIPreviewButton: () => void;
  onCloseAIPreviewModal: () => void;
}

const audienceScopes: { value: NoticeAudienceScope; label: string }[] = [
  { value: "SCHOOL", label: "Whole School" },
  { value: "ROLE", label: "Specific Role" },
  { value: "CLASS", label: "Specific Class" },
  { value: "SECTION", label: "Specific Section" },
];

const NoticeModal = ({
  t,
  isOpen,
  isLoading,
  onClose,
  onSubmit,
  form,
  noticeTypeOptions,
  selectedNoticeType,
  isGeneratingContent,
  isAIModalOpen,
  isAIPreviewModalOpen,
  classOptions,
  sectionOptions,
  roleOptions,
  sectionPickerClassId,
  setSectionPickerClassId,
  handleAudienceScopeChange,
  handleAudienceRoleToggle,
  handleAudienceClassToggle,
  handleAudienceSectionToggle,
  handleNoticeTypeChange,
  generateContentWithAI,
  onClickAIPreviewButton,
  onCloseAIPreviewModal,
}: NoticeModalProps) => {
  const formData = form.watch();
  const audienceScope = formData.audience?.scope || "SCHOOL";
  return (
    <>
      <Dialog open={isOpen} onOpenChange={(next) => !next && onClose()}>
        <DialogContent showDefaultClose className="sm:max-w-lg">
          {/* padding on the non-scrolling wrapper, so the scrollbar doesn't eat the right padding */}
          <div className="p-4 sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="text-center sm:text-left w-full">
                <DialogTitle className="text-lg leading-6 font-medium pr-8">
                  {isAIModalOpen ? t("labels.generate_notice_with_ai") : t("labels.add_new_notice")}
                </DialogTitle>
                <div className="mt-4">
                  <Form {...form}>
                    <form onSubmit={onSubmit} className="space-y-4" noValidate>
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("labels.title")}</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input {...field} placeholder={t("messages.enter_title")} />
                              </FormControl>
                              {isAIModalOpen && (
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={generateContentWithAI}
                                    disabled={!formData.title.trim() || isGeneratingContent}
                                    className="mt-1 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Generate content with AI"
                                  >
                                    {isGeneratingContent ? <ButtonSpinner /> : <SparklesIcon className="h-4 w-4" />}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={onClickAIPreviewButton}
                                    disabled={!formData.content.trim()}
                                    className="mt-1 ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Preview notice"
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <SelectDropdown
                          label={t("labels.type")}
                          options={noticeTypeOptions}
                          value={selectedNoticeType}
                          onChange={handleNoticeTypeChange}
                        />
                      </div>

                      {isAIModalOpen ? null : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Send To</label>
                          <div className="flex flex-wrap gap-2">
                            {audienceScopes.map((s) => (
                              <button
                                key={s.value}
                                type="button"
                                onClick={() => handleAudienceScopeChange(s.value)}
                                className={`px-3 py-1.5 rounded-md text-sm border ${
                                  audienceScope === s.value
                                    ? "bg-primary-600 text-white border-primary-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>

                          {audienceScope === "ROLE" && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {roleOptions.map((role) => {
                                const selected = (formData.audience?.roles || []).includes(role);
                                return (
                                  <button
                                    key={role}
                                    type="button"
                                    onClick={() => handleAudienceRoleToggle(role)}
                                    className={`px-3 py-1 rounded-full text-xs border ${
                                      selected
                                        ? "bg-primary-100 text-primary-800 border-primary-300"
                                        : "bg-white text-gray-600 border-gray-300"
                                    }`}
                                  >
                                    {role}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {audienceScope === "CLASS" && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {classOptions.length === 0 && <p className="text-sm text-gray-500">No classes found.</p>}
                              {classOptions.map((c) => {
                                const selected = (formData.audience?.classIds || []).includes(c.id);
                                return (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => handleAudienceClassToggle(c.id)}
                                    className={`px-3 py-1 rounded-full text-xs border ${
                                      selected
                                        ? "bg-primary-100 text-primary-800 border-primary-300"
                                        : "bg-white text-gray-600 border-gray-300"
                                    }`}
                                  >
                                    {c.name}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {audienceScope === "SECTION" && (
                            <div className="mt-3 space-y-2">
                              <select
                                value={sectionPickerClassId}
                                onChange={(e) => setSectionPickerClassId(e.target.value)}
                                className="block w-full p-2 rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 sm:text-sm"
                              >
                                <option value="">Select a class first</option>
                                {classOptions.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                              <div className="flex flex-wrap gap-2">
                                {sectionOptions.length === 0 && sectionPickerClassId && (
                                  <p className="text-sm text-gray-500">No sections found.</p>
                                )}
                                {sectionOptions.map((sec) => {
                                  const selected = (formData.audience?.sectionIds || []).includes(sec.id);
                                  return (
                                    <button
                                      key={sec.id}
                                      type="button"
                                      onClick={() => handleAudienceSectionToggle(sec.id)}
                                      className={`px-3 py-1 rounded-full text-xs border ${
                                        selected
                                          ? "bg-primary-100 text-primary-800 border-primary-300"
                                          : "bg-white text-gray-600 border-gray-300"
                                      }`}
                                    >
                                      {sec.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("labels.content")}</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={4} placeholder={t("messages.enter_content")} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {isAIModalOpen ? null : (
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <DatePicker
                                label={t("labels.date")}
                                value={field.value ? new Date(field.value).toISOString() : ""}
                                onChange={field.onChange}
                                placeholder={t("messages.select_date")}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {isAIModalOpen ? null : (
                        <FileField
                          form={form}
                          name="attachment"
                          label={t("labels.attachment")}
                          accept=".pdf,application/pdf"
                          maxBytes={10 * 1024 * 1024}
                          hint="PDF, up to 10 MB"
                        />
                      )}

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                          {isLoading ? <ButtonSpinner /> : t("buttons.add_notice")}
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                          onClick={onClose}
                        >
                          {t("buttons.cancel")}
                        </button>
                      </div>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <NoticePreviewModal
        isOpen={isAIPreviewModalOpen}
        onClose={onCloseAIPreviewModal}
        notice={formData}
        onDownload={() => {}}
      />
    </>
  );
};

export default NoticeModal;
