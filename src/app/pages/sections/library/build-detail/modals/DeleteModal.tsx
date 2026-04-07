import { motion } from "framer-motion";
import { X, Trash2, Loader2 } from "lucide-react";
import type { BuildData } from "../types";

interface DeleteModalProps {
  buildData: BuildData;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteModal({
  buildData,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#1a1a1a] rounded-xl p-6 max-w-md w-full border border-gray-800"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Delete Build</h3>
          <button
            onClick={onCancel}
            className="cursor-pointer text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-600/20 rounded-full flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-gray-300 text-center">
            Are you sure you want to delete{" "}
            <strong className="text-white">{buildData.title}</strong>? This will
            remove all build files ({buildData.size}) and cannot be undone.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="cursor-pointer flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="cursor-pointer flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
