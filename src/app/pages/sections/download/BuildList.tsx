import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { HardDrive } from "lucide-react";
import { DownloadStatus } from "./DownloadStatus";

interface Build {
  version: string;
  isPrivate: boolean;
  v: string;
  zipUrl: string;
  normalUrl: string;
  splashUrl: string;
  status: "available" | "beta" | "stable";
  releaseDate: string;
  size: string;
  description: string;
}

export const BuildList: React.FC = () => {
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null);

  const builds: Build[] = [
    {
      version: "Chapter 2 Season 7",
      v: "17.30",
      isPrivate: false,
      zipUrl: "",
      normalUrl: "",
      splashUrl: "/ch2s7.jpg",
      status: "stable",
      releaseDate: "2021-06-08",
      size: "—",
      description: "Fortnite Chapter 2 Season 7",
    }
  ];

  return (
    <div className="p-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex-1">
          <motion.div
            className="mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl font-bold bg-gradient-to-r from-stone-400 to-neutral-400 bg-clip-text text-transparent mb-3">
              Pulse Builds
            </h1>
            <p className="text-slate-300 text-sm">
              Choose from available Fortnite builds. Private builds require
              special access.
            </p>
          </motion.div>

          <div className="flex flex-row gap-4">
            {builds.map((build, index) => (
              <motion.div
                key={build.version}
                className={`relative cursor-pointer backdrop-blur-sm transition-all duration-300 overflow-hidden`}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                onClick={() => setSelectedBuild(build)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stone-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

                <div className="">
                  <div className="flex items-start gap-6">
                    <div className="relative flex items-center justify-center mb-2">
                      <img
                        src={build.splashUrl}
                        className="w-45 h-56 rounded-lg object-cover bg-gradient-to-br from-stone-600 to-neutral-800 flex items-center justify-center text-white font-bold text-lg shadow-lg"
                      />
                      {selectedBuild?.version === build.version && (
                        <motion.div
                          className="absolute -inset-1 bg-gradient-to-r from-neutral-400 to-stone-400 rounded-xl opacity-75 blur-sm"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </div>

                    {selectedBuild?.version === build.version && (
                      <motion.div
                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-stone-400 to-neutral-400 rounded-l-2xl"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.4 }}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">
                      {build.version}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <HardDrive size={16} /> {build.size}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {selectedBuild && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBuild(null)}
          >
            <motion.div
              className="w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <DownloadStatus
                build={selectedBuild}
                onClose={() => setSelectedBuild(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
