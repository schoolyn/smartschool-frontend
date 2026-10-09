import { PrinterIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { Dialog, DialogContent, DialogHeader, DialogBody, DialogTitle } from "../ui/dialog";
import { ICreateNoticeRequest } from "@/types";

// platform-default letterhead logo for the print view — a school's own uploaded
// logo (organizationLogo prop) is a separate, unrelated default further below
const organisationLogo = "/opscul.png";

interface NoticePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  notice: ICreateNoticeRequest;
  onDownload?: (url: string, fileName: string) => void;
  organizationName?: string;
  organizationLogo?: string;
}

const NoticePreviewModal = ({
  isOpen,
  onClose,
  notice,
  // onDownload,
  organizationName = "School Organization",
  organizationLogo = "/logo.png",
}: NoticePreviewModalProps) => {
  if (!notice) return null;

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
                .org-name { font-size: 24px; font-weight: bold; }
                .notice-title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
                .notice-meta { color: #666; margin-bottom: 20px; }
                .notice-content { line-height: 1.6; white-space: pre-line; }
                .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="header">
                <img src="${organisationLogo}" class="logo" />
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
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={handlePrint}
            >
              <span className="sr-only">Print</span>
              <PrinterIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </DialogHeader>

        <DialogBody>
          <div id="notice-print-content" className="p-4 sm:p-6">
            {/* Organization Logo and Name */}
            <div className="mb-8 flex items-center border-b border-gray-200 pb-4">
              <img src={organizationLogo} alt="Organization Logo" className="mr-4 h-12 w-auto" />
              <h2 className="text-xl font-bold text-gray-800">{organizationName}</h2>
            </div>

            {/* Notice Title and Type */}
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

            {/* Notice Content */}
            <div className="prose max-w-none mb-8">
              <div className="text-gray-700 whitespace-pre-line">{notice.content}</div>
            </div>

            {/* Footer */}
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
