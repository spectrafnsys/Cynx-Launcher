"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Settings, Trash2, ArrowLeft } from "lucide-react";
import { LaunchModal } from "./build-detail/modals/LaunchModal";
import { DeleteModal } from "./build-detail/modals/DeleteModal";
import { SettingsModal } from "./build-detail/modals/SettingsModal";
import { DownloadModal } from "./build-detail/modals/DownloadModal";
import type { BuildConfig, LaunchStatus } from "./build-detail/types";
import { useSettingsStore } from "../../../../store/settings";
import { useBuildStore } from "../../../../store/build";
import { useUserStore } from "../../../../store/user";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import { invoke } from "@tauri-apps/api/core";
import api from "../../../../lib/axios";
import { FileManager } from "../../../components/managers/FileManager";

interface BuildDetailProps {
  buildId: string;
  onBack: () => void;
}

const builds = useBuildStore.getState().builds;

export const buildConfigs: Record<string, BuildConfig> = {
  "20.20": {
    title: "Chapter 3 Season 2",
    subtitle: "Resistance",
    version: "20.20",
    status: builds.find((x) => x.id === "20.20")?.status || "Unknown",
    size: builds.find((x) => x.id === "20.20")?.size || "0.00",
    releaseDate: "March 2022",
    image:
      "https://cdn2.unrealengine.com/fortnite-chapter-3-season-2-resistance-key-art-1920x1080-f9b60d56f9db.jpg",
    description:
      "Join the Resistance in Fortnite Battle Royale Chapter 3 Season 2. Take the fight to the Imagined Order with new weapons, vehicles, and movement mechanics like sprinting and mantling. Experience the game without building in core modes, utilize the Overshield for protection, and support the war effort to reclaim the Island.",
    highlights: [],
    stats: [],
    gradientColors: "",
    hoverGradientColors: "",
    theme: {
      primary: "blue",
      secondary: "red",
    },
  },
  "17.30": {
    title: "Chapter 2 Season 7",
    subtitle: "Top Secret",
    version: "17.30",
    status: builds.find((x) => x.id === "17.30")?.status || "Public",
    size: builds.find((x) => x.id === "17.30")?.size || "35.21 GB",
    releaseDate: "February 2020",
    image: "/ch2s2.jpg",
    description: "Dive into the world of spies in Chapter 2 Season 7. Choose your side between Ghost and Shadow, explore new POIs like The Agency and The Shark, and enjoy the game's first secret agent themed season.",
    highlights: [],
    stats: [],
    gradientColors: "",
    hoverGradientColors: "",
    theme: {
      primary: "yellow",
      secondary: "black",
    },
  },
  "19.10": {
    title: "Chapter 3 Season 1",
    subtitle: "Flipped",
    version: "19.10",
    status: builds.find((x) => x.id === "19.10")?.status || "Public",
    size: builds.find((x) => x.id === "19.10")?.size || "44.77 GB",
    releaseDate: "December 2021",
    image: "https://dl.netcable.dev/19.10/Splash.bmp",
    description: "The Island from Chapter 2 has been flipped, uncovering a never-before-seen Island. Explore new locations, meet new characters, and experience new gameplay mechanics on the other side.",
    highlights: [],
    stats: [],
    gradientColors: "",
    hoverGradientColors: "",
    theme: {
      primary: "blue",
      secondary: "cyan",
    },
  },
  "24.20": {
    title: "Chapter 4 Season 2",
    subtitle: "MEGA",
    version: "24.20",
    status: builds.find((x) => x.id === "24.20")?.status || "Public",
    size: builds.find((x) => x.id === "24.20")?.size || "37 GB",
    releaseDate: "March 2023",
    image: "/s2.bmp",
    description: "Become MEGA in Fortnite Battle Royale Chapter 4 Season 2. Ride the grind rails of MEGA City and swerve on its streets on a sport bike. Go beyond the neon towers to the rest of the new biome: Cause havoc at Steamy Springs, drive a drifting car to Kenjutsu Crossing, or sharpen your skills at Knotty Nets.",
    highlights: [],
    stats: [],
    gradientColors: "",
    hoverGradientColors: "",
    theme: {
      primary: "purple",
      secondary: "pink",
    },
  },
  "10.40": {
    title: "Chapter 2 Season 7",
    subtitle: "Out of Time",
    version: "17.30",
    status: builds.find((x) => x.id === "17.30")?.status || "Public",
    size: builds.find((x) => x.id === "17.30")?.size || "0.00",
    releaseDate: "June 2021",
    image:
      "https://cdn2.unrealengine.com/Fortnite%2Fpatch-notes%2Fv10-00-patch-notes%2Fbr-header-v10-00-patch-notes%2F10BR_Mech_PatchNotes-1920x1080-30ada9e73d283d3dbdbf73bd86738e597aa939d4.jpg",
    description:
      "Time is fractured. Classic locations return with a twist as rifts in reality bring chaos to the island. Experience the end of Chapter 1 with new zones, missions, and the looming Black Hole event.",
    highlights: [],
    stats: [],
    gradientColors: "",
    hoverGradientColors: "",
    theme: {
      primary: "gray",
      secondary: "indigo",
    },
  },
};

export default function BuildDetail({ buildId, onBack }: BuildDetailProps) {
  const [launchStatus, setLaunchStatus] = useState<LaunchStatus>("idle");
  const [launchErrorMessage, setLaunchErrorMessage] = useState<string | null>(null);
  const [gameRunning, setGameRunning] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [filesToDownload, setFilesToDownload] = useState<
    Array<{ name: string; url: string; size: number }>
  >([]);
  const [currentBuildPath, setCurrentBuildPath] = useState<string>("");
  const [deletionProgress, setDeletionProgress] = useState({
    current: 0,
    total: 0,
    currentFile: "",
  });

  const user = useAuth();
  const isLoading =
    user !== null && typeof user === "object" && "loading" in user;
  const isAuthenticated = user !== null && !isLoading;
  const userData = isAuthenticated ? user : null;

  const {
    bubbleWrapBuilds,
    resetOnRelease,
    toggleBubbleWrapBuilds,
    toggleResetOnRelease,
  } = useSettingsStore();

  const config = buildConfigs[buildId];
  const buildData = {
    id: buildId,
    title: config?.title || "Unknown Build",
    subtitle: config?.subtitle || "",
    version: config?.version || buildId,
    status: config?.status || "Unknown",
    size: config?.size || "0 GB",
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-[#101010] text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-200">
            Build Not Found
          </h2>
          <p className="text-gray-400 mb-6">
            The requested build configuration could not be found.
          </p>
          <button
            onClick={onBack}
            className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] hover:bg-gray-800 rounded-xl transition-colors duration-200 border border-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  const proceedWithLaunch = async (build: any) => {
    try {
      const { shipping, path: buildPath } = build;
      const filePath = (shipping || `${buildPath}\\Binaries\\Win64\\FortniteClient-Win64-Shipping.exe`).replace(/\//g, "\\");
      const fileExists = await invoke<boolean>("file_exists", { filePath });

      if (!fileExists) {
        setLaunchErrorMessage(
          "Build file not found at path. Re-import the build from Library."
        );
        setLaunchStatus("idle");
        return;
      }

      const accessToken = useUserStore.getState().accessToken;
      const secret =
        userData?.hellowelcometocrystalfortnite?.trim() || accessToken?.trim();

      let code: string | null = null;

      if (secret) {
        const exchangeCode = await api.auth.createExchangeCode(secret);

        if (import.meta.env.DEV) {
          console.log("[Launch] Exchange API response:", {
            ok: exchangeCode.ok,
            error: exchangeCode.error,
            dataKeys: exchangeCode?.data
              ? (typeof exchangeCode.data === "object"
                  ? Object.keys(exchangeCode.data as object)
                  : [])
              : [],
            data: exchangeCode?.data,
          });
        }

        if (exchangeCode.ok && exchangeCode.data != null) {
          const data = exchangeCode.data as unknown;
          if (typeof data === "string" && data.trim() !== "") {
            code = data.trim();
          } else if (data && typeof data === "object") {
            const d = data as Record<string, unknown>;
            code =
              [
                d.code,
                d.exchangeCode,
                d.exchange_code,
                d.token,
                (d.data as Record<string, unknown> | undefined)?.code,
              ]
                .filter(
                  (v): v is string => typeof v === "string" && v.trim() !== ""
                )
                .map((v) => v.trim())[0] ?? null;
          }
        }
      }

      if (!code && accessToken?.trim()) {
        code = accessToken.trim();
      }

      if (!code) {
        setLaunchErrorMessage(
          "Please log in to launch. Log out and log in again if the issue persists."
        );
        setLaunchStatus("idle");
        return;
      }

      await doLaunchGame(build, filePath, code);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setLaunchErrorMessage(`Launch failed: ${msg}`);
      setLaunchStatus("idle");
    }
  };

  const doLaunchGame = async (
    build: any,
    filePath: string,
    exchangeCode: string
  ) => {
    try {
      setLaunchStatus("loading");
      setLaunchErrorMessage(null);

      const isLaunched = await invoke("launch_game", {
        filePath,
        exchangeCode,
        version: build.version,
        isLocal: process.env.NODE_ENV === "development" ? true : false,
      });

      if (!isLaunched) {
        setLaunchErrorMessage("Game failed to start. Check the build path.");
        setLaunchStatus("idle");
        return;
      }

      setLaunchStatus("success");
      setTimeout(() => {
        setLaunchStatus("idle");
        setGameRunning(true);
      }, 2000);
    } catch (error: unknown) {
      let msg = "Unknown error";
      if (error instanceof Error) msg = error.message;
      else if (typeof error === "string") msg = error;
      else if (error && typeof error === "object" && "message" in error) msg = String((error as { message: unknown }).message);
      setLaunchErrorMessage(msg);
      setLaunchStatus("idle");
    }
  };

  const tryLaunchWithoutCode = async () => {
    const buildStore = useBuildStore.getState();
    const build = buildStore.builds.find((b) => b.id === buildId);
    if (!build) return;
    const filePath = (build.shipping || `${build.path}\\Binaries\\Win64\\FortniteClient-Win64-Shipping.exe`).replace(/\//g, "\\");
    const fileExists = await invoke<boolean>("file_exists", { filePath });
    if (!fileExists) {
      setLaunchErrorMessage("Build file not found. Re-import the build.");
      return;
    }
    setLaunchErrorMessage(null);
    setLaunchStatus("loading");
    try {
      await doLaunchGame(build, filePath, "");
    } catch {
      setLaunchStatus("idle");
    }
  };

  const handleLaunch = async () => {
    setLaunchStatus("starting");
    setLaunchErrorMessage(null);
    try {
      const buildStore = useBuildStore.getState();
      const build = buildStore.builds.find((b) => b.id === buildId);
      if (!build) {
        console.error("Build not found.");
        setLaunchStatus("idle");
        return;
      }

      const settingsStore = useSettingsStore.getState();

      if (!user) {
        console.error("Invalid user.");
        setLaunchStatus("idle");
        return;
      }

      if (!build.path) {
        console.error("Build path is invalid.");
        setLaunchStatus("idle");
        return;
      }

      if (settingsStore.bubbleWrapBuilds) {
        const bubbleWrapFiles = await FileManager.getBubbleWrapFiles();
        const filesStatus = await FileManager.getBubbleWrapFileStatus(
          build.path
        );

        if (filesStatus.existing.length > 0) {
          setShowDeletionModal(true);
          setDeletionProgress({
            current: 0,
            total: filesStatus.existing.length,
            currentFile: "",
          });

          for (let i = 0; i < bubbleWrapFiles.length; i++) {
            const file = bubbleWrapFiles[i];
            const filePath = `${build.path}\\Content\\Paks\\${file.name}`;

            setDeletionProgress({
              current: i + 1,
              total: bubbleWrapFiles.length,
              currentFile: file.name,
            });

            try {
              const fileExists = await FileManager.fileExists(filePath);
              if (fileExists) {
                await invoke("delete_file", { filePath });
                console.log(`Deleted existing file: ${file.name}`);
              }

              await new Promise((resolve) => setTimeout(resolve, 200));
            } catch (error) {
              console.warn(`Failed to delete ${file.name}:`, error);
            }
          }

          setShowDeletionModal(false);
        }
      }

      const files = await FileManager.getRequiredFiles(
        settingsStore,
        build.path
      );

      if (files.length > 0) {
        setFilesToDownload(files);
        setCurrentBuildPath(build.path);
        setShowDownloadModal(true);
        return;
      }

      await proceedWithLaunch(build);
    } catch (error) {
      console.error("Failed to launch build:", error);
      setLaunchStatus("idle");
    }
  };

  const handleDownloadComplete = async () => {
    setShowDownloadModal(false);
    setFilesToDownload([]);
    setCurrentBuildPath("");

    const buildStore = useBuildStore.getState();
    const build = buildStore.builds.find((b) => b.id === buildId);
    if (build) {
      console.log("Download completed, proceeding with launch...");
      await proceedWithLaunch(build);
    } else {
      console.error("Build not found after download completion");
      setLaunchStatus("idle");
    }
  };

  const handleDownloadCancel = () => {
    setShowDownloadModal(false);
    setFilesToDownload([]);
    setCurrentBuildPath("");
    setLaunchStatus("idle");
  };

  const handleClose = async () => {
    try {
      const buildStore = useBuildStore.getState();
      const build = buildStore.builds.find((b) => b.id === buildId);
      if (!build) {
        console.error("Build not found.");
        return;
      }

      await invoke("close_game");
      setGameRunning(false);
    } catch (error) {
      console.error("Failed to close build:", error);
    }
  };

  const isLaunching = launchStatus === "starting" || launchStatus === "loading";
  const isDisabled = isLaunching;

  const handleDelete = async () => {
    setIsDeleting(true);
    const buildStore = useBuildStore.getState();
    const build = buildStore.builds.find((b) => b.id === buildId);

    if (!build) {
      console.error("Build not found.");
      return;
    }

    buildStore.removeBuild(build.id);
    setShowDeleteConfirm(false);
    setIsDeleting(false);

    setTimeout(() => {
      onBack();
    }, 300);
  };

  const parseTitle = (title: string) => {
    if (title.startsWith("Welcome to ")) {
      return {
        welcome: "Welcome to",
        mainTitle: title.replace("Welcome to ", ""),
      };
    }
    return {
      welcome: "Welcome to",
      mainTitle: title,
    };
  };

  const { welcome, mainTitle } = parseTitle(config.title);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, stiffness: 330, damping: 30 }}
      className="min-h-screen bg-[#101010] text-white"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
        <button
          onClick={onBack}
          className="cursor-pointer flex items-center gap-2 sm:gap-3 text-gray-400 hover:text-white transition-colors duration-200 bg-[#1a1a1a] hover:bg-gray-800 px-3 sm:px-4 py-2 rounded-lg border border-gray-800 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Back to Library</span>
          <span className="sm:hidden">Back</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="cursor-pointer p-2 sm:p-3 bg-[#1a1a1a] hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors duration-200 border border-gray-800"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="cursor-pointer p-2 sm:p-3 bg-[#1a1a1a] hover:bg-red-900/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors duration-200 border border-gray-800 hover:border-red-800/50"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      <div className="p-3">
        <div className="relative h-[60vh] sm:h-[70vh] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-900/50 border border-gray-800/50 group">
          <img
            src={config.image || "/placeholder.svg"}
            alt={buildData.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-center px-8">
            <div className="max-w-2xl">
              {welcome ? (
                <div className="mb-3 sm:mb-4 lg:mb-6">
                  <div className="text-lg sm:text-xl md:text-2xl text-gray-300 font-medium mb-2">
                    {welcome}
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                    {mainTitle}
                  </h1>
                </div>
              ) : (
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 lg:mb-6 leading-tight">
                  {config.title}
                </h1>
              )}

              {config.subtitle && (
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-200 mb-2 sm:mb-3 lg:mb-4">
                  {config.subtitle}
                </h2>
              )}

              <p className="text-sm sm:text-base lg:text-lg text-gray-200 mb-4 sm:mb-6 lg:mb-8 max-w-xl leading-relaxed">
                {config.description}
              </p>

              {launchErrorMessage && (
                <div className="mb-3">
                  <p className="text-amber-400/90 text-sm mb-2">
                    {launchErrorMessage}
                  </p>
                  <button
                    onClick={tryLaunchWithoutCode}
                    disabled={isLaunching}
                    className="text-xs text-gray-400 hover:text-white underline"
                  >
                    Launch anyway (may fail to connect)
                  </button>
                </div>
              )}
              <button
                onClick={gameRunning ? handleClose : handleLaunch}
                disabled={isDisabled}
                className={`
                  flex items-center gap-2 px-8 py-4 cursor-pointer rounded-lg font-medium text-base
                  transition-all duration-200 border
                  ${gameRunning
                    ? "bg-red-600 hover:bg-red-700 border-red-500 text-white"
                    : isLaunching
                      ? "bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 border-blue-500 text-white"
                  }
                  ${isDisabled ? "opacity-60" : ""}
                `}
              >
                {isLaunching && (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                )}
                <span>
                  {isLaunching
                    ? "Launching..."
                    : gameRunning
                      ? "Close Game"
                      : "Launch Game"}
                </span>
              </button>
            </div>
          </div>

          <div className="absolute top-3 sm:top-4 lg:top-6 right-3 sm:right-4 lg:right-6">
            <div
              className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium border ${config.status === "Live"
                ? "bg-green-500/20 text-green-300 border-green-500/30"
                : "bg-gray-800/60 text-gray-300 border-gray-700/50"
                }`}
            >
              {config.status}
            </div>
          </div>

          <div className="absolute top-3 sm:top-4 lg:top-6 left-3 sm:left-4 lg:left-6">
            <div className="px-2 sm:px-3 py-1 bg-black/40 text-gray-300 rounded-full text-xs sm:text-sm font-medium border border-gray-700/50">
              v{config.version}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {(launchStatus === "starting" ||
          launchStatus === "loading" ||
          launchStatus === "success") && <LaunchModal status={launchStatus} />}
      </AnimatePresence>

      <AnimatePresence>
        {showDeletionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  Deleting Files
                </h3>

                <p className="text-gray-400 mb-4">
                  Removing existing files before redownload...
                </p>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>
                      {deletionProgress.current} / {deletionProgress.total}
                    </span>
                  </div>

                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${deletionProgress.total > 0
                          ? (deletionProgress.current /
                            deletionProgress.total) *
                          100
                          : 0
                          }%`,
                      }}
                    />
                  </div>

                  {deletionProgress.currentFile && (
                    <p className="text-sm text-gray-500 truncate">
                      Deleting: {deletionProgress.currentFile}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Please wait...</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDownloadModal && (
          <DownloadModal
            files={filesToDownload}
            buildPath={currentBuildPath}
            onComplete={handleDownloadComplete}
            onCancel={handleDownloadCancel}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <DeleteModal
            buildData={buildData}
            isDeleting={isDeleting}
            onCancel={() => setShowDeleteConfirm(false)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <SettingsModal
            bubbleWrapBuilds={bubbleWrapBuilds}
            resetOnRelease={resetOnRelease}
            onToggleBubbleWrap={toggleBubbleWrapBuilds}
            onToggleResetOnRelease={toggleResetOnRelease}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
