import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FolderOpen, CheckCircle, XCircle } from "lucide-react";
import { importBuild, type ImportResult } from "../../../utils/build";
import { useBuildStore } from "../../../../store/build";

export function ImportModal({ onClose }: { onClose: () => void }) {
  const [buildInfo, setBuildInfo] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const addBuild = useBuildStore((s: any) => s.addBuild);

  const supportedVersions = ["19.10", "10.40", "14.40", "17.30", "24.20"];
  const isVersionSupported =
    buildInfo && supportedVersions.includes(buildInfo.version);

  const handleImport = async () => {
    setLoading(true);
    try {
      const importResult = await importBuild();
      if (importResult) {
        setBuildInfo(importResult);
      }
    } catch (error) {
      console.error("Failed to import build:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!buildInfo || !isVersionSupported) return;

    setImporting(true);
    try {
      const splashMap: Record<string, string> = {
        "19.10": "https://dl.netcable.dev/19.10/Splash.bmp",
        "10.40": "https://dl.netcable.dev/10.40/Splash%20(1).bmp",
        "17.00": "/ch2s7.jpg",
        "17.30": "/ch2s7.jpg",
        "24.20": "/Ch4-S2.jpg",
      };

      const statusMap: Record<string, string> = {
        "19.10": "Private",
        "10.40": "Private",
        "17.00": "Public",
        "17.30": "Public",
        "24.20": "Soon",
      };

      const newBuild = {
        id: buildInfo.version,
        title: buildInfo.title,
        subtitle: `Version ${buildInfo.version}`,
        version: buildInfo.version,
        status: statusMap[buildInfo.version] || "Not Supported",
        description: `Imported ${buildInfo.title} build`,
        releaseDate: new Date().toLocaleDateString(),
        shortTitle: buildInfo.season,
        size: buildInfo.size,
        initials: buildInfo.season,
        color:
          buildInfo.version === "Unknown"
            ? "from-gray-600 to-gray-700"
            : "from-green-600 to-blue-700",
        path: buildInfo.path,
        splash: splashMap[buildInfo.version] || undefined,
        shipping: buildInfo.shipping,
      };

      addBuild(newBuild);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onClose();
    } catch (error) {
      console.error("Failed to add build:", error);
    } finally {
      setImporting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-[#101010] p-6 rounded-xl w-[32rem] shadow-2xl border border-gray-800/50 relative"
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-black/20 pointer-events-none rounded-xl" />

          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-2 bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/50"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <FolderOpen className="w-5 h-5 text-white" />
              </motion.div>
              <h2 className="text-xl font-semibold text-white">
                Add Pulse Installation
              </h2>
            </div>

            <motion.button
              onClick={onClose}
              className="p-1 hover:bg-gray-800/60 rounded-lg transition-colors duration-200 cursor-pointer"
              disabled={importing}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </motion.button>
          </div>

          <div className="mb-6 space-y-3 relative z-10">
            <p className="text-gray-300 text-sm leading-relaxed">
              Select the folder containing the{" "}
              <code className="px-2 py-1 bg-gray-800/60 rounded text-gray-200 font-mono text-xs border border-gray-700/50">
                📁 FortniteGame
              </code>{" "}
              and{" "}
              <code className="px-2 py-1 bg-gray-800/60 rounded text-gray-200 font-mono text-xs border border-gray-700/50">
                📁 Engine
              </code>{" "}
              directories.
            </p>
            <p className="text-gray-400 text-sm">
              Once imported, the build will be automatically added to your
              library.
            </p>
          </div>

          <div className="mb-6 relative z-10">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {buildInfo ? "Build Information" : "Selected Path"}
            </label>

            <div
              className={`bg-gray-900/60 backdrop-blur-sm px-4 py-3 rounded-lg text-sm transition-all duration-200 border ${buildInfo
                ? isVersionSupported
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-red-500/30 bg-red-500/5"
                : "border-gray-800/50 text-gray-500"
                }`}
            >
              {buildInfo ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {isVersionSupported ? (
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                    <span
                      className={`font-medium ${isVersionSupported ? "text-green-300" : "text-red-300"
                        }`}
                    >
                      {buildInfo.title}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-gray-300 ml-6">
                    <div>
                      Version:{" "}
                      <span className="text-gray-200">{buildInfo.version}</span>
                    </div>
                    <div>
                      Season:{" "}
                      <span className="text-gray-200">{buildInfo.season}</span>
                    </div>
                    <div className="font-mono text-gray-400 truncate">
                      Path: {buildInfo.path}
                    </div>

                    {!isVersionSupported && (
                      <motion.div
                        className="bg-red-500/10 border border-red-500/20 rounded p-3 mt-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-red-300 text-sm font-medium mb-1">
                          ❌ Unsupported Version
                        </p>
                        <p className="text-red-200 text-xs">
                          This build version is not supported for Pulse
                          gameplay. Only versions 19.10, 10.40, 17.30 and 24.20
                          are currently supported.
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              ) : (
                "No folder selected"
              )}
            </div>
          </div>

          <div className="flex justify-between items-center relative z-10">
            <motion.button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-800/60 backdrop-blur-sm hover:bg-gray-700/60 text-gray-300 hover:text-white text-sm transition-all duration-200 border border-gray-700/50 hover:border-gray-600/50 cursor-pointer"
              disabled={importing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>

            <div className="flex gap-2">
              <motion.button
                onClick={handleImport}
                className="px-4 py-2 rounded-lg bg-gray-800/60 backdrop-blur-sm hover:bg-gray-700/60 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 border border-gray-700/50 hover:border-gray-600/50 cursor-pointer"
                disabled={loading || importing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    />
                    Browsing...
                  </>
                ) : (
                  <>
                    <FolderOpen className="w-4 h-4" />
                    Browse
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={handleContinue}
                disabled={!buildInfo || importing || !isVersionSupported}
                className="px-4 py-2 rounded-lg bg-gray-700/60 backdrop-blur-sm hover:bg-gray-600/60 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 border border-gray-600/50 hover:border-gray-500/50 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {importing ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    />
                    Adding...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Add Build
                  </>
                )}
              </motion.button>
            </div>
          </div>

          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 via-transparent to-white/5 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
