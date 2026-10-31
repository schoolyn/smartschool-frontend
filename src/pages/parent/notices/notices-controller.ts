import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetMyNotices, useMarkNoticeRead } from "@/entities/notice";

const useNoticesController = () => {
  const { t } = useTranslation();
  const { organizationId } = useParams();

  const getMyNotices = useGetMyNotices(organizationId || "");
  const markNoticeRead = useMarkNoticeRead(organizationId || "");

  const notices = getMyNotices.data?.items || [];

  const handleMarkRead = (notice: { id: string; isRead?: boolean }) => {
    if (notice.isRead) return;
    markNoticeRead.mutate(notice.id);
  };

  return {
    t,
    notices,
    isLoading: getMyNotices.isLoading,
    // a failed load shows an error with a retry, not an empty page
    loadError: getMyNotices.isError ? getMyNotices.error : null,
    retryLoad: () => getMyNotices.refetch(),
    handleMarkRead,
  };
};

export default useNoticesController;
