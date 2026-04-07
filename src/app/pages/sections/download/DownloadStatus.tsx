import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  X,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

interface Build {
  version: string;
  isPrivate: boolean;
  zipUrl: string;
  normalUrl: string;
  splashUrl: string;
  status: "available" | "beta" | "stable";
  releaseDate: string;
  size: string;
  description: string;
}

interface DownloadStatusProps {
  build: Build;
  onClose: () => void;
}

export const DownloadStatus: React.FC<DownloadStatusProps> = ({
  build,
  onClose,
}) => {
  const [step, setStep] = useState<"initial" | "preparing" | "redirecting">("initial");

  const startDownload = async () => {
    setStep("preparing");


    await new Promise(resolve => setTimeout(resolve, 2000));

    setStep("redirecting");

    try {
      await invoke("plugin:opener|open_url", { url: build.zipUrl });
      setTimeout(onClose, 3000);
    } catch (error) {
      console.error("Failed to open URL:", error);
    }
  };

  return (
    <div className="backdrop-blur-xl border border-stone-700/50 bg-stone-900/40 rounded-3xl p-8 shadow-2xl max-w-md mx-auto relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-pulse-purple/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-8 h-8 rounded-full bg-stone-800/50 hover:bg-stone-700/50 flex items-center justify-center text-stone-400 hover:text-white transition-colors z-10"
      >
        <X className="w-4 h-4" />
      </button>

      <AnimatePresence mode="wait">
        {step === "initial" && (
          <motion.div
            key="initial"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="w-24 h-32 mx-auto mb-6 rounded-2xl overflow-hidden shadow-2xl border border-stone-700/50 group relative">
              <img
                src={build.splashUrl}
                alt={build.version}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              {build.version}
            </h2>
            <p className="text-stone-400 text-sm mb-8 px-4 leading-relaxed">
              This build will be downloaded via your default browser. Click below to begin the preparation.
            </p>

            <motion.button
              onClick={startDownload}
              className="w-full py-4 bg-gradient-to-r from-stone-200 to-stone-400 hover:from-white hover:to-stone-300 text-stone-950 font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-stone-950/20 flex items-center justify-center gap-2 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download className="w-5 h-5 transition-transform group-hover:translate-y-0.5" />
              Download Build
            </motion.button>

            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-stone-500 font-medium">
              <span className="bg-stone-800/50 px-3 py-1.5 rounded-lg border border-stone-700/30">
                {build.size}
              </span>
              <span className="bg-stone-800/50 px-3 py-1.5 rounded-lg border border-stone-700/30">
                {build.status.toUpperCase()}
              </span>
            </div>
          </motion.div>
        )}

        {step === "preparing" && (
          <motion.div
            key="preparing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center py-10"
          >
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-stone-800 rounded-full" />
              <motion.div
                className="absolute inset-0 border-4 border-t-stone-200 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-stone-200 animate-pulse-glow" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-3">Preparing Download</h3>
            <p className="text-stone-400 text-sm animate-pulse-glow">Initializing direct link transfer...</p>

            <div className="mt-12 w-full bg-stone-800/50 h-1 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-stone-200"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}

        {step === "redirecting" && (
          <motion.div
            key="redirecting"
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center py-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20"
            >
              <ExternalLink className="w-10 h-10 text-green-400" />
            </motion.div>

            <h3 className="text-xl font-bold text-white mb-3">Redirecting to Browser</h3>
            <p className="text-stone-400 text-sm leading-relaxed px-6">
              Your browser should now start the download automatically. If it doesn't, please click the button below.
            </p>

            <button
              onClick={() => invoke("plugin:opener|open_url", { url: build.zipUrl })}
              className="mt-8 text-stone-400 hover:text-white text-sm font-medium underline underline-offset-4 transition-colors"
            >
              Didn't work? Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
