import { PrinterIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { Dialog, DialogContent, DialogHeader, DialogBody, DialogTitle } from "@/shared/ui/kit/dialog";
import { ICreateNoticeRequest } from "@/entities/notice";
import { useTenant } from "@/entities/session";

interface NoticePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  notice: ICreateNoticeRequest;
  onDownload?: (url: string, fileName: string) => void;
}

const NoticePreviewModal = ({ isOpen, onClose, notice }: NoticePreviewModalProps) => {
  const { organization } = useTenant();
  if (!notice) return null;

  // the school's own letterhead: its uploaded logo, or its initials when it has none
  const organizationName = organization?.name ?? "";
  const organizationLogo = organization?.logo?.url;
  const initials = organizationName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  const handlePrint = () => {
    const printContent = document.getElementById("notice-print-content");
    if (printContent) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${notice.title} - Notice</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; }
                .header { display: flex; align-items: center; margin-bottom: 30px; }
                .logo { width: 80px; height: auto; margin-right: 20px; }
                .initials { width: 56px; height: 56px; margin-right: 20px; border-radius: 8px; background: #171717; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; }
                .org-name { font-size: 24px; font-weight: bold; }
                .notice-title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
                .notice-meta { color: #666; margin-bottom: 20px; }
                .notice-content { line-height: 1.6; white-space: pre-line; }
                .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="header">
                ${organizationLogo ? `<img src="${organizationLogo}" class="logo" />` : `<div class="initials">${initials}</div>`}
                <div class="org-name">${organizationName}</div>
              </div>
              <div class="notice-title">${notice.title}</div>
              <div class="notice-meta">
                <div>Date: ${new Date(notice.date ? notice.date : Date.now()).toLocaleDateString()}</div>
                <div>Type: ${notice.type.charAt(0).toUpperCase() + notice.type.slice(1)}</div>
              </div>
              <div class="notice-content">${notice.content}</div>
              <div class="footer">
                This is an official notice from ${organizationName}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Notice Preview</DialogTitle>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              onClick={handlePrint}
            >
              <span className="sr-only">Print</span>
              <PrinterIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </DialogHeader>

        <DialogBody>
          <div id="notice-print-content" className="p-4 sm:p-6">
            <div className="mb-8 flex items-center border-b border-gray-200 pb-4">
              {organizationLogo ? (
                <img
                  src={organizationLogo}
                  alt={organizationName}
                  className="mr-4 h-12 w-auto max-w-[8rem] object-contain"
                />
              ) : (
                <div className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-base font-semibold text-white">
                  {initials}
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-800">{organizationName}</h2>
            </div>

            <div className="mb-6">
              <h1 className="mb-2 text-2xl font-bold text-gray-900">{notice.title}</h1>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Date: {new Date(notice.date ? notice?.date : Date.now()).toLocaleDateString()}
                </span>
                <span
                  className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                    notice.type === "holiday" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {notice.type.charAt(0).toUpperCase() + notice.type.slice(1)}
                </span>
              </div>
            </div>

            <div className="prose max-w-none mb-8">
              <div className="text-gray-700 whitespace-pre-line">{notice.content}</div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
              This is an official notice from {organizationName}
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default NoticePreviewModal;
