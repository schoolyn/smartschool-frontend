import { SparklesIcon, PencilSquareIcon } from "@heroicons/react/24/solid";

import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/kit/dialog";

interface NoticeTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAI: () => void;
  onSelectCustom: () => void;
}

const NoticeTypeSelectionModal = ({ isOpen, onClose, onSelectAI, onSelectCustom }: NoticeTypeSelectionModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && onClose()}>
      <DialogContent showDefaultClose className="sm:max-w-lg">
        <div className="p-4 sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <DialogTitle className="text-lg leading-6 font-medium">Create Notice</DialogTitle>
              <div className="mt-0">
                <p className="text-sm text-gray-500 mb-6">Choose how you would like to create your notice:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={onSelectAI}
                    className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
                  >
                    <div className="p-4 bg-primary-100 rounded-full mb-4 group-hover:bg-primary-200 transition-colors">
                      <SparklesIcon className="h-8 w-8 text-primary-600" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">AI-Generated</h4>
                    <p className="text-sm text-gray-500 text-center">
                      Let AI help you create content based on your title
                    </p>
                  </button>

                  <button
                    onClick={onSelectCustom}
                    className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
                  >
                    <div className="p-4 bg-primary-100 rounded-full mb-4 group-hover:bg-primary-200 transition-colors">
                      <PencilSquareIcon className="h-8 w-8 text-primary-600" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Custom Notice</h4>
                    <p className="text-sm text-gray-500 text-center">Create your notice content manually</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoticeTypeSelectionModal;
