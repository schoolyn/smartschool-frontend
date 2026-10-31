import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/kit/dialog";
import { Button } from "@/shared/ui/kit/button";
import Spinner from "@/shared/ui/spinner";

interface AttachmentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachmentURL: string;
  fileName?: string;
}

const AttachmentPreviewModal = ({
  isOpen,
  onClose,
  attachmentURL,
  fileName = "Document Preview",
}: AttachmentPreviewModalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [viewerFailed, setViewerFailed] = useState(false);

  // Google Docs Viewer gives a more reliable PDF preview
  const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(attachmentURL)}&embedded=true`;

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setViewerFailed(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-4xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-lg font-medium">{fileName}</DialogTitle>
            <button type="button" className="rounded-md bg-white text-gray-400 hover:text-gray-500" onClick={onClose}>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="relative h-[70vh] bg-white rounded-md overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner />
              </div>
            )}

            <iframe
              src={googleDocsViewerUrl}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="PDF Preview"
            />

            {viewerFailed && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                <div className="text-center p-6">
                  <p className="text-gray-700 mb-4">Unable to preview this PDF document.</p>
                  <Button asChild>
                    <a href={attachmentURL} download>
                      Download Instead
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <Button asChild>
              <a href={attachmentURL} download>
                Download
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttachmentPreviewModal;
