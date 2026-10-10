import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { BellIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

import { useParams } from "react-router-dom";

import useGetAiGeneratedContent from "./service";
import { ICreateNoticeRequest, NoticeAudienceScope, SelectOption } from "@/types";
import { useError } from "@/hooks";
import {
  useGetClasses,
  useGetSections,
  useGetAcademicYears,
} from "@/pages/admin/classes/service/academics-service";
import { noticeFormSchema, defaultNoticeAudience, defaultNoticeFormValues } from "./notice-modal.schema";

const useNoticeModalWrapperController = (
  isSuccessNoticeCreation: boolean,
  onCancel: () => void,
  onSubmit: (formData: ICreateNoticeRequest) => void
) => {
  const { t } = useTranslation();
  const { organizationId } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAIPreviewModalOpen, setIsAIPreviewModalOpen] = useState(false);

  const form = useForm({ resolver: zodResolver(noticeFormSchema), defaultValues: defaultNoticeFormValues });
  const formData = form.watch();

  const [sectionPickerClassId, setSectionPickerClassId] = useState("");

  const getAcademicYears = useGetAcademicYears(organizationId || "");
  const currentAcademicYearId = getAcademicYears.data?.items.find((y) => y.isCurrent)?.id;
  const getClasses = useGetClasses(organizationId || "", currentAcademicYearId, "active");
  const classOptions = getClasses.data?.items || [];
  const getSections = useGetSections(organizationId || "", sectionPickerClassId || undefined, "active");
  const sectionOptions = getSections.data?.items || [];

  const roleOptions = ["SCHOOL_ADMIN", "TEACHER", "PARENT", "STAFF"];

  const handleAudienceScopeChange = (scope: NoticeAudienceScope) => {
    form.setValue("audience", { scope, roles: [], classIds: [], sectionIds: [] });
  };

  const handleAudienceRoleToggle = (role: string) => {
    const current = formData.audience?.roles || [];
    const roles = current.includes(role) ? current.filter((r) => r !== role) : [...current, role];
    form.setValue("audience", { ...(formData.audience || defaultNoticeAudience), roles });
  };

  const handleAudienceClassToggle = (classId: string) => {
    const current = formData.audience?.classIds || [];
    const classIds = current.includes(classId) ? current.filter((c) => c !== classId) : [...current, classId];
    form.setValue("audience", { ...(formData.audience || defaultNoticeAudience), classIds });
  };

  const handleAudienceSectionToggle = (sectionId: string) => {
    const current = formData.audience?.sectionIds || [];
    const sectionIds = current.includes(sectionId) ? current.filter((s) => s !== sectionId) : [...current, sectionId];
    form.setValue("audience", { ...(formData.audience || defaultNoticeAudience), sectionIds });
  };

  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  const getAiGeneratedContent = useGetAiGeneratedContent();

  useError({
    mutation: getAiGeneratedContent,
    cb: () => {
      setIsGeneratingContent(false);
    },
  });

  const noticeTypeOptions: SelectOption[] = [
    {
      id: "announcement",
      name: t("common.notice_types.announcement"),
      description: t("common.notice_types.announcement_description"),
      icon: <BellIcon className="h-5 w-5 text-primary-500" />,
    },
    {
      id: "holiday",
      name: t("common.notice_types.holiday"),
      description: t("common.notice_types.holiday_description"),
      icon: <CalendarDaysIcon className="h-5 w-5 text-green-500" />,
    },
  ];

  const selectedNoticeType = noticeTypeOptions.find((option) => option.id === formData.type) || noticeTypeOptions[0];

  const handleNoticeTypeChange = (option: SelectOption) => {
    form.setValue("type", option.id as "announcement" | "holiday");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      form.setValue("attachment", e.target.files[0]);
    }
  };

  const resetForm = () => {
    form.reset(defaultNoticeFormValues);
    setSectionPickerClassId("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values);
  });

  const generateContentWithAI = async () => {
    if (!formData.title.trim() || !formData.type) {
      return;
    }

    getAiGeneratedContent.mutate({ title: formData.title, type: formData.type });
    setIsGeneratingContent(true);
  };

  const handleSelectAI = () => {
    setIsAIModalOpen(true);
    openNoticeModal();
    onCancel();
  };

  const handleSelectCustom = () => {
    setIsAIModalOpen(false);
    openNoticeModal();
    onCancel();
  };

  // Notice modal handlers
  const openNoticeModal = () => {
    setIsNoticeModalOpen(true);
  };

  const closeNoticeModal = () => {
    setIsNoticeModalOpen(false);
    resetForm();
  };

  const onClickAIPreviewButton = () => {
    setIsAIPreviewModalOpen(true);
  };

  const onCloseAIPreviewModal = () => {
    setIsAIPreviewModalOpen(false);
  };

  useEffect(() => {
    if (getAiGeneratedContent.isSuccess && getAiGeneratedContent.data) {
      form.setValue("content", getAiGeneratedContent.data.content);
      setIsGeneratingContent(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAiGeneratedContent.isSuccess, getAiGeneratedContent.data]);

  useEffect(() => {
    if (getAiGeneratedContent.isError) {
      setIsGeneratingContent(false);
    }
  }, [getAiGeneratedContent.isError]);

  useEffect(() => {
    if (isSuccessNoticeCreation) {
      closeNoticeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessNoticeCreation]);

  return {
    t,
    file: formData.attachment,
    form,
    formData,
    fileInputRef,
    isAIModalOpen,
    isNoticeModalOpen,
    noticeTypeOptions,
    selectedNoticeType,
    isGeneratingContent,
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
    handleFileChange,
    handleSubmit,
    generateContentWithAI,
    handleSelectAI,
    handleSelectCustom,
    closeNoticeModal,
    onClickAIPreviewButton,
    onCloseAIPreviewModal,
  };
};

export default useNoticeModalWrapperController;
