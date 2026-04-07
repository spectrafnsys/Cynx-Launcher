"use client";
import { Check, Crown, Loader2, User, X, AlertCircle } from "lucide-react";
import type { User as UserData } from "../../../../types/user";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ProfileSectionProps {
  user: UserData;
}

export function ProfileSection({ user }: ProfileSectionProps) {
  if (!user) return null;
  const [showEditModal, setShowEditModal] = useState(false);
  const [displayName, setDisplayName] = useState(user.discord.username);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSave = async () => {
    setSaveState("saving");
    setErrorMessage("");

    try {
      setSaveState("success");
      console.log("Saving name:", displayName);

      setTimeout(() => {
        setSaveState("idle");
        setShowEditModal(false);
      }, 1200);
    } catch (error) {
      setSaveState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      console.error("Save failed:", error);

      setTimeout(() => {
        setSaveState("idle");
      }, 4000);
    }
  };

  const isDonator = user?.discord?.isDonator === true;

  return (
    <div className="bg-[#101010] border border-[#1a1a1a] rounded-lg">
      <div className="p-6 border-b border-[#1a1a1a]">
        <h2 className="text-xl font-semibold text-gray-100">
          Profile Information
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Your account details and membership status
        </p>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
            <img
              src={
                user.discord.avatarUrl ||
                "/placeholder.svg?height=80&width=80&text=AJ" ||
                "/placeholder.svg"
              }
              alt={user.discord.username}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-gray-100">
                {user.discord.username}
              </h3>
              {isDonator && (
                <span className="px-2 py-1 bg-[#2a2a2a] text-gray-300 text-xs rounded border border-[#3a3a3a] flex items-center gap-1">
                  Donator
                </span>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Account ID
              </label>
              <div className="font-mono text-xs text-gray-300 bg-[#1a1a1a] px-2 py-1 rounded border border-[#2a2a2a] break-all">
                {user.id}
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-[#1a1a1a] pt-6"></div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
          >
            <User className="h-4 w-4" />
            Edit Profile
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-[#101010] border border-[#2a2a2a] rounded-lg w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-[#1a1a1a]">
                <div>
                  <h3 className="text-lg font-semibold text-gray-100">
                    Edit Profile
                  </h3>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Update your display information
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a] rounded-md transition-colors cursor-pointer"
                  disabled={saveState === "saving"}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Display Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={saveState === "saving"}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Enter your display name..."
                    />
                  </div>
                </div>

                {saveState === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-900/20 border border-red-800/30 rounded-lg flex items-start gap-2"
                  >
                    <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-300 font-medium">
                        Failed to save changes
                      </p>
                      <p className="text-xs text-red-400 mt-0.5">
                        {errorMessage}
                      </p>
                    </div>
                  </motion.div>
                )}

                {user.discord.isDonator && (
                  <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Crown className="h-4 w-4 text-yellow-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-100">
                          Donator
                        </div>
                        <div className="text-xs text-gray-400">
                          Thanks for supporting Pulse!
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-[#1a1a1a] bg-[#0a0a0a]">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
                  disabled={saveState === "saving"}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveState === "saving"}
                  className={`px-6 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 cursor-pointer min-w-[100px] justify-center ${saveState === "success"
                    ? "bg-green-600 text-white"
                    : saveState === "error"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                >
                  <AnimatePresence mode="wait">
                    {saveState === "idle" && (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Save
                      </motion.div>
                    )}
                    {saveState === "saving" && (
                      <motion.div
                        key="saving"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving
                      </motion.div>
                    )}
                    {saveState === "success" && (
                      <motion.div
                        key="success"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 25,
                        }}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Saved!
                      </motion.div>
                    )}
                    {saveState === "error" && (
                      <motion.div
                        key="error"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 20,
                        }}
                        className="flex items-center gap-2"
                      >
                        <AlertCircle className="h-4 w-4" />
                        Try Again
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
