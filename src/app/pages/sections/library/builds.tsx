import { Plus, HardDrive, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ImportModal } from "./ImportModal";
import { useBuildStore } from "../../../../store/build";
import { useSettingsStore } from "../../../../store/settings";

const defaultBuilds: any = [];

interface BuildsProps {
  onBuildClick?: (buildId: string) => void;
}

export function Builds({ onBuildClick }: BuildsProps) {
  const viewMode = useSettingsStore((s) => s.viewMode);
  const setViewMode = useSettingsStore((s) => s.setViewMode);
  const [mounted, setMounted] = useState(false);
  const [, setHoveredItem] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const importedBuilds = useBuildStore((s) => s.builds);
  const mergedBuilds = [...defaultBuilds];

  importedBuilds.forEach((importedBuild) => {
    const existingIndex = mergedBuilds.findIndex(
      (defaultBuild) => defaultBuild.version === importedBuild.version
    );

    if (existingIndex !== -1) {
      const defaultBuild = mergedBuilds[existingIndex];
      mergedBuilds[existingIndex] = {
        ...defaultBuild,
        ...importedBuild,
        id: defaultBuild.id,
        status: "Imported",
        size: defaultBuild.size,
      };
    } else {
      mergedBuilds.push({
        ...importedBuild,
        status: "Imported",
      });
    }
  });

  const availableBuilds = mergedBuilds.filter((build) => {
    const hasImportedVersion = importedBuilds.some(
      (imported) => imported.version === build.version
    );
    return hasImportedVersion;
  });

  const totalBuilds = availableBuilds.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBuildClick = (buildId: string) => {
    console.log("Build clicked:", buildId);
    if (onBuildClick && typeof onBuildClick === "function") {
      onBuildClick(buildId);
    } else {
      console.log("No build click handler provided for build:", buildId);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen text-white select-none">
        <div className="container mx-auto px-6 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800 rounded w-48"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white select-none">
      {showModal && <ImportModal onClose={handleModalClose} />}
      <div className="container mx-auto px-6 py-6">
        <motion.div
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Installed Builds
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {totalBuilds} build{totalBuilds !== 1 ? "s" : ""} available
              </p>
            </div>

            <div className="flex gap-2 bg-gray-900/60 backdrop-blur-sm rounded-lg p-1 border border-gray-800/50">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded text-sm transition-all duration-200 cursor-pointer ${viewMode === "list"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 rounded text-sm transition-all duration-200 cursor-pointer ${viewMode === "grid"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
              >
                Grid
              </button>
            </div>
          </div>

          <motion.button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/60 backdrop-blur-sm hover:bg-gray-700/60 text-white rounded-lg transition-all duration-200 border border-gray-700/50 hover:border-gray-600/50 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            Import Build
          </motion.button>
        </motion.div>

        {totalBuilds === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-800/60 rounded-full flex items-center justify-center border border-gray-700/50">
              <HardDrive className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-2">
              No builds imported
            </h3>
            <p className="text-gray-500 mb-6">
              Import your first Pulse Installation to get started
            </p>
          </motion.div>
        ) : (
          <>
            {viewMode === "list" ? (
              <div className="space-y-1">
                <div className="grid grid-cols-8 gap-6 px-4 py-3 text-sm text-gray-400 font-medium border-b border-gray-800/50">
                  <div className="col-span-5">Title</div>
                  <div className="col-span-2 text-end">Size</div>
                  <div className="col-span-1"></div>
                </div>

                {availableBuilds.map((build, index) => (
                  <motion.div
                    key={build.id}
                    className="grid grid-cols-8 gap-6 px-4 py-4 hover:bg-gray-900/40 transition-all duration-200 group rounded-lg cursor-pointer border border-transparent hover:border-gray-800/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onMouseEnter={() => setHoveredItem(build.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => handleBuildClick(build.id)}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800/60 flex-shrink-0 border border-gray-700/50">
                        <img
                          src={
                            build.title === "Fortnite 19.10"
                              ? "https://dl.netcable.dev/19.10/Splash.bmp"
                              : build.title === "Chapter 3 Season 1"
                                ? "https://dl.netcable.dev/Chapter3S1/Splash.bmp"
                                : build.title === "Chapter 1 Season 10"
                                  ? "https://dl.netcable.dev/10.40/Splash%20(1).bmp"
                                  : build.title === "Chapter 2 Season 7"
                                    ? "/ch2s7.jpg"
                                    : build.title === "Chapter 4 Season 2"
                                      ? "/Ch4-S2.jpg"
                                      : ""
                          }
                          alt={build.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "/placeholder.svg?height=48&width=48&text=" +
                              encodeURIComponent(build.initials || "??");
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-white truncate transition-colors duration-200 group-hover:text-gray-200">
                          {build.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            v{build.version}
                          </span>
                          {build.status && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800/60 text-gray-300 border border-gray-700/50">
                              {build.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center justify-end text-gray-300 font-medium">
                      <HardDrive className="w-3 h-3 mr-1 text-gray-400" />
                      {build.size}
                    </div>

                    <div className="col-span-1 flex items-center justify-end">
                      <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200 transition-all duration-200 opacity-0 group-hover:opacity-100">
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-6">
                {availableBuilds.map((build, index) => (
                  <motion.div
                    key={build.id}
                    className="group cursor-pointer"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onMouseEnter={() => setHoveredItem(build.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => handleBuildClick(build.id)}
                    whileHover={{ y: -4 }}
                  >
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-800/60 mb-3 border border-gray-700/50 transition-all duration-200 group-hover:border-gray-600/50">
                      <img
                        src={
                          build.title === "Fortnite 19.10"
                            ? "https://dl.netcable.dev/19.10/Splash.bmp"
                            : build.title === "Chapter 3 Season 1"
                              ? "https://dl.netcable.dev/Chapter3S1/Splash.bmp"
                              : build.title === "Chapter 1 Season 10"
                                ? "https://dl.netcable.dev/10.40/Splash%20(1).bmp"
                                : build.title === "Chapter 2 Season 7"
                                  ? "/ch2s7.jpg"
                                  : build.title === "Chapter 4 Season 2"
                                    ? "/Ch4-S2.jpg"
                                    : ""
                        }
                        alt={build.title}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/placeholder.svg?height=400&width=300&text=" +
                            encodeURIComponent(build.title);
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200" />

                      {build.status && (
                        <div className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-medium bg-gray-800/60 text-gray-300 border border-gray-700/50">
                          {build.status}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-medium text-white truncate transition-colors duration-200 group-hover:text-gray-200">
                        {build.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          {build.size}
                        </div>
                        <span>v{build.version}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="text-sm text-gray-500 border-t border-gray-800/50 pt-4 mt-6 flex justify-between items-center">
          <span>
            Showing {totalBuilds} build{totalBuilds !== 1 ? "s" : ""}
          </span>
          <span className="text-xs">
            {totalBuilds > 0 && `${totalBuilds} imported`}
          </span>
        </div>
      </div>
    </div>
  );
}
