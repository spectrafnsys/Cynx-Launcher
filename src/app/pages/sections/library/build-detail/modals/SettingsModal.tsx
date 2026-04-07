"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Settings } from "lucide-react";

interface SettingsModalProps {
  bubbleWrapBuilds: boolean;
  resetOnRelease: boolean;
  onToggleBubbleWrap: () => void;
  onToggleResetOnRelease: () => void;
  onClose: () => void;
}

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      onClick={onToggle}
      className={`cursor-pointer relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 ${
        enabled ? "bg-blue-500" : "bg-gray-600"
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="inline-block h-3 w-3 rounded-full bg-white shadow-lg absolute top-1 left-1"
        animate={{
          x: enabled ? 16 : 0,
          scale: enabled ? 1.1 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: enabled
            ? "0 0 0 2px rgba(146, 148, 255, 0.3)"
            : "0 0 0 0px rgba(146, 148, 255, 0)",
        }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
}

export function SettingsModal({
  bubbleWrapBuilds,
  //resetOnRelease,
  onToggleBubbleWrap,
  //onToggleResetOnRelease,
  onClose,
}: SettingsModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.4,
          }}
          className="bg-[#1c1c1c] rounded-2xl w-full max-w-sm border border-gray-700/60 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            className="px-6 py-5 border-b border-gray-700/40"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                <motion.div
                  className="w-7 h-7 bg-pulse-purple/15 rounded-lg flex items-center justify-center"
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "rgba(146, 148, 255, 0.25)",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    animate={{ rotate: 0 }}
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Settings className="w-3.5 h-3.5 text-pulse-purple" />
                  </motion.div>
                </motion.div>
                <h2 className="text-white font-semibold text-lg">Settings</h2>
              </motion.div>
              <motion.button
                onClick={onClose}
                className="cursor-pointer p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700/40 rounded-lg transition-all duration-200"
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "rgba(55, 65, 81, 0.6)",
                }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            className="p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="space-y-5">
              <motion.div
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-800/20 transition-all duration-200"
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "rgba(31, 41, 55, 0.3)",
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
              >
                <div className="flex-1 pr-4">
                  <motion.div
                    className="text-white font-medium text-sm mb-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    Bubble Wrap Builds
                  </motion.div>
                  <motion.div
                    className="text-gray-400 text-xs leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.3 }}
                  >
                    Changes the build's texture to bubble wrap for reduced
                    delay.
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <Toggle
                    enabled={bubbleWrapBuilds}
                    onToggle={onToggleBubbleWrap}
                  />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="px-6 py-4 bg-gray-800/20 border-t border-gray-700/40"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <motion.button
              onClick={onClose}
              className="cursor-pointer w-full px-4 py-2.5 bg-pulse-purple hover:opacity-90 active:opacity-80 text-white text-sm font-medium rounded-lg transition-all duration-200 relative overflow-hidden"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 4px 12px rgba(146, 148, 255, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.3 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pulse-purple to-pulse-purple/90"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10">Done</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
