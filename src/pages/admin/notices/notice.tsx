import { DocumentArrowDownIcon, EyeIcon, EllipsisHorizontalIcon, TrashIcon } from "@heroicons/react/24/outline";

import NoticeModal from "@/components/notice-modal";
import NoticePreviewModal from "@/components/notice-preview-modal/notice-preview-modal";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import NoRecordFound from "@/components/no-record-found";
import useNoticeController from "./notice-controller";
import Spinner from "@/components/spinner";
import AttachmentPreviewModal from "./preview-modal";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/table";
import SectionHeader from "@/components/section-header";
import { usePageHeader } from "@/hooks";

const AdminNotices = () => {
  const {
    t,
    notices,
    isNoticeModalOpen,
    isLoadingNoticeList,
    isFetchingNoticeList,
    isCreatingNotice,
    isSuccessNoticeCreation,
    previewModalOpen,
    previewAttachmentURL,
    previewFileName,
    onCancel,
    handleCreateNotice,
    handleViewAttachment,
    handleDownloadAttachment,
    onClickCreateNotice,
    noticeIdPendingDelete,
    cancelDeleteNotice,
    confirmDeleteNotice,
    isDeletingNotice,
    setPreviewModalOpen,
    activeDropdown,
    dropdownRef,
    toggleDropdown,
    previewNotice,
    onClickPreviewNotice,
    closePreviewNotice,
    onClickDeleteFromDropdown,
  } = useNoticeController();

  usePageHeader({
    actions: (
      <button
        onClick={onClickCreateNotice}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        {t("labels.create_notice")}
      </button>
    ),
  });

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="All Notices" description="View and manage all school notices" />

        {/* Notices Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div>
            {isLoadingNoticeList ? (
              <Spinner />
            ) : notices.length === 0 ? (
              <NoRecordFound t={t} searchTerm="" clearFilters={() => {}} />
            ) : (
              <Table>
                <TableHeader>
                  <TableHead>Title</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-center">Audience</TableHead>
                  <TableHead className="text-center">Date</TableHead>
                  <TableHead className="text-center">Created At</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableHeader>
                {!isFetchingNoticeList ? (
                  <TableBody>
                    {notices.map((notice) => (
                      <TableRow key={notice.id}>
                        <TableCell>
                          <div className="text-sm font-medium text-gray-900">{notice.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{notice.content}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              notice.type === "holiday" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {notice.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-100 text-gray-700">
                            {notice.audience?.scope === "SCHOOL" || !notice.audience
                              ? "Whole School"
                              : notice.audience.scope === "ROLE"
                              ? `Roles: ${notice.audience.roles.join(", ")}`
                              : notice.audience.scope === "CLASS"
                              ? `${notice.audience.classIds.length} class(es)`
                              : `${notice.audience.sectionIds.length} section(s)`}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-gray-500">
                          {notice.date ? new Date(notice.date).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell className="text-center text-gray-500">{new Date(notice.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center items-center gap-2">
                            {notice.attachmentURL && (
                              <>
                                <button
                                  onClick={() => handleViewAttachment(notice.attachmentURL!, notice.title)}
                                  className="text-primary-600 hover:text-primary-900"
                                  title="View attachment"
                                >
                                  <EyeIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDownloadAttachment(notice.attachmentURL!, `notice-${notice.id}`)}
                                  className="text-primary-600 hover:text-primary-900"
                                  title="Download attachment"
                                >
                                  <DocumentArrowDownIcon className="h-5 w-5" />
                                </button>
                              </>
                            )}
                            <div
                              className="relative inline-block text-left"
                              ref={activeDropdown === notice.id ? dropdownRef : undefined}
                            >
                              <button
                                onClick={() => toggleDropdown(notice.id)}
                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                aria-expanded={activeDropdown === notice.id}
                                aria-haspopup="true"
                              >
                                <EllipsisHorizontalIcon className="h-5 w-5" />
                              </button>

                              {activeDropdown === notice.id && (
                                <div
                                  className="absolute right-0 top-full mt-1 w-36 bg-white border rounded-lg shadow-lg overflow-hidden z-20"
                                  role="menu"
                                  aria-orientation="vertical"
                                >
                                  <button
                                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    role="menuitem"
                                    onClick={() => onClickPreviewNotice(notice)}
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                    Preview
                                  </button>
                                  <button
                                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                                    role="menuitem"
                                    onClick={() => onClickDeleteFromDropdown(notice.id)}
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                ) : (
                  <Spinner />
                )}
              </Table>
            )}
          </div>
        </div>
      </div>

      <NoticeModal
        isOpen={isNoticeModalOpen}
        onCancel={onCancel}
        isLoading={isCreatingNotice}
        onSubmit={handleCreateNotice}
        isSuccessNoticeCreation={isSuccessNoticeCreation}
      />

      {previewNotice && (
        <NoticePreviewModal
          isOpen={!!previewNotice}
          onClose={closePreviewNotice}
          notice={previewNotice}
        />
      )}

      <AttachmentPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        attachmentURL={previewAttachmentURL}
        fileName={previewFileName}
      />

      <DeleteConfirmationDialog
        open={!!noticeIdPendingDelete}
        title="Delete Notice"
        description="Are you sure you want to delete this notice? This action cannot be undone."
        isLoading={isDeletingNotice}
        onClose={cancelDeleteNotice}
        onConfirm={confirmDeleteNotice}
      />
    </>
  );
};

export default AdminNotices;
