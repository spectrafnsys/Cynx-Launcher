;

import { motion } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";
import type { LaunchStatus } from "../types";

interface LaunchModalProps {
  status: LaunchStatus;
}

export function LaunchModal({ status }: LaunchModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 text-center max-w-sm mx-4"
      >
        <div className="mb-4">
          {status === "success" ? (
            <div className="w-12 h-12 mx-auto bg-green-600 rounded-full flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          ) : (
            <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          )}
        </div>

        <h3 className="text-lg font-semibold text-white mb-2">
          {status === "starting"
            ? "Starting Game"
            : status === "loading"
            ? "Loading"
            : "Ready to Play"}
        </h3>

        <p className="text-sm text-gray-400">
          {status === "starting"
            ? "Getting things ready..."
            : status === "loading"
            ? "Almost there, just loading the game."
            : "You're in! Fortnite is running."}
        </p>
      </motion.div>
    </motion.div>
  );
}
