import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { useCreateNotice, useGetNoticeList, useDeleteNotice } from "@/entities/notice";
import { ICreateNoticeRequest, INotice } from "@/entities/notice";
import { useError, usePaging } from "@/shared/lib/hooks";

const useNoticeController = () => {
  const { t } = useTranslation();
  const { organizationId } = useParams();

  const { page, pageSize, setPage, setPageSize } = usePaging();
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewAttachmentURL, setPreviewAttachmentURL] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [previewNotice, setPreviewNotice] = useState<INotice | null>(null);

  const getNoticeList = useGetNoticeList(organizationId, "", "", pageSize, page);
  const notices: INotice[] = getNoticeList.data?.rows ?? [];
  const createNotice = useCreateNotice(organizationId || "");
  const deleteNotice = useDeleteNotice(organizationId || "");

  useError({
    mutation: createNotice,
  });

  const handleViewAttachment = (attachmentURL: string, fileName: string) => {
    setPreviewAttachmentURL(attachmentURL);
    setPreviewFileName(fileName);
    setPreviewModalOpen(true);
  };

  const handleDownloadAttachment = (attachmentUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = attachmentUrl;
    link.download = fileName || "notice-attachment";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateNotice = (formData: ICreateNoticeRequest) => {
    const noticeFormData = new FormData();

    noticeFormData.append("title", formData.title);
    noticeFormData.append("content", formData.content);
    noticeFormData.append("type", formData.type);

    if (formData.date) {
      noticeFormData.append("date", formData.date);
    }

    if (formData.attachment instanceof File) {
      noticeFormData.append("attachment", formData.attachment);
    }

    if (formData.audience) {
      noticeFormData.append("audience", JSON.stringify(formData.audience));
    }

    createNotice.mutate(noticeFormData);
  };

  const onClickCreateNotice = () => {
    setIsNoticeModalOpen(true);
  };

  const onCancel = () => {
    setIsNoticeModalOpen(false);
  };

  const [noticeIdPendingDelete, setNoticeIdPendingDelete] = useState<string | null>(null);

  const handleDeleteNotice = (id: string) => {
    setNoticeIdPendingDelete(id);
  };

  const cancelDeleteNotice = () => setNoticeIdPendingDelete(null);

  const onClickPreviewNotice = (notice: INotice) => {
    setPreviewNotice(notice);
  };

  const closePreviewNotice = () => setPreviewNotice(null);

  const onClickDeleteFromDropdown = (id: string) => {
    handleDeleteNotice(id);
  };

  const confirmDeleteNotice = () => {
    if (!noticeIdPendingDelete) return;
    deleteNotice.mutate(noticeIdPendingDelete, {
      onSuccess: () => setNoticeIdPendingDelete(null),
      onError: (error) => {
        setNoticeIdPendingDelete(null);
        toast.error(error?.response?.Error?.message || "The notice could not be deleted.");
      },
    });
  };

  useEffect(() => {
    if (createNotice.isSuccess) {
      // the server says whether it went out now or is scheduled for later
      toast.success(createNotice.data?.message || t("messages.notice_created_successfully"));
      setIsNoticeModalOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createNotice.isSuccess]);

  useEffect(() => {
    if (deleteNotice.isSuccess) {
      toast.success("Notice deleted successfully");
    }
  }, [deleteNotice.isSuccess]);

  return {
    t,
    notices,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalNotices: getNoticeList.data?.pagination.totalItems ?? 0,
    isNoticeModalOpen,
    isLoadingNoticeList: getNoticeList.isLoading,
    isFetchingNoticeList: getNoticeList.isFetching,
    isCreatingNotice: createNotice.isPending,
    isSuccessNoticeCreation: createNotice.isSuccess,
    previewModalOpen,
    previewAttachmentURL,
    previewFileName,
    onCancel,
    handleCreateNotice,
    handleViewAttachment,
    handleDownloadAttachment,
    onClickCreateNotice,
    handleDeleteNotice,
    noticeIdPendingDelete,
    cancelDeleteNotice,
    confirmDeleteNotice,
    isDeletingNotice: deleteNotice.isPending,
    setPreviewModalOpen,
    previewNotice,
    onClickPreviewNotice,
    closePreviewNotice,
    onClickDeleteFromDropdown,
  };
};

export default useNoticeController;
