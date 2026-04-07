import { motion } from "framer-motion";
import { Download, Check, X } from "lucide-react";
import { FileManager } from "../../../../../components/managers/FileManager";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

interface FileDownloadProgress {
  name: string;
  url: string;
  size: number;
  downloaded: number;
  status: "pending" | "downloading" | "completed" | "error";
  error?: string;
}

interface DownloadModalProps {
  files: Array<{ name: string; url: string; size: number }>;
  onComplete: () => void;
  onCancel: () => void;
  buildPath: string;
}

export function DownloadModal({
  files,
  onComplete,
  //onCancel,
  buildPath,
}: DownloadModalProps) {
  const [fileProgress, setFileProgress] = useState<FileDownloadProgress[]>(
    files.map((file) => ({
      ...file,
      downloaded: 0,
      status: "pending",
    }))
  );
  const [overallProgress, setOverallProgress] = useState(0);

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const totalDownloaded = fileProgress.reduce(
    (sum, file) => sum + file.downloaded,
    0
  );
  const completedFiles = fileProgress.filter(
    (file) => file.status === "completed"
  ).length;
  const hasErrors = fileProgress.some((file) => file.status === "error");

  useEffect(() => {
    setOverallProgress(totalSize > 0 ? (totalDownloaded / totalSize) * 100 : 0);
  }, [totalDownloaded, totalSize]);

  useEffect(() => {
    const unlisten = listen("download_progress", (event: any) => {
      const { url, downloaded /*total, file_path*/ } = event.payload;

      setFileProgress((prev) =>
        prev.map((file) => {
          if (file.url === url) {
            return {
              ...file,
              downloaded,
              status: downloaded >= file.size ? "completed" : "downloading",
            };
          }
          return file;
        })
      );
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    startDownload();
  }, []);

  useEffect(() => {
    if (completedFiles === files.length && completedFiles > 0) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [completedFiles, files.length, onComplete]);

  const downloadFile = async (fileIndex: number): Promise<void> => {
    const file = fileProgress[fileIndex];

    try {
      setFileProgress((prev) =>
        prev.map((f, i) =>
          i === fileIndex ? { ...f, status: "downloading" } : f
        )
      );

      await invoke("download_crystal_file", {
        url: file.url,
        filePath: `${buildPath}\\Content\\Paks\\${file.name}`,
      });

      setFileProgress((prev) =>
        prev.map((f, i) =>
          i === fileIndex
            ? { ...f, status: "completed", downloaded: f.size }
            : f
        )
      );
    } catch (error) {
      console.error(`Failed to download ${file.name}:`, error);
      setFileProgress((prev) =>
        prev.map((f, i) =>
          i === fileIndex
            ? {
                ...f,
                status: "error",
                error:
                  error instanceof Error ? error.message : "Download failed",
              }
            : f
        )
      );
    }
  };

  const startDownload = async () => {
    try {
      for (let i = 0; i < fileProgress.length; i++) {
        await downloadFile(i);
      }
    } catch (error) {
      console.error("Download process failed:", error);
    }
  };

  const getFileIcon = (status: FileDownloadProgress["status"]) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-green-400" />;
      case "error":
        return <X className="w-4 h-4 text-red-400" />;
      case "downloading":
        return (
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        );
      default:
        return <Download className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatProgress = (downloaded: number, total: number): string => {
    if (total === 0) return "0%";
    return `${((downloaded / total) * 100).toFixed(1)}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Downloading Files
            </h3>
            <p className="text-sm text-gray-400">
              {files.length} files are being downloaded
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">Overall Progress</span>
            <span className="text-sm text-gray-400">
              {completedFiles}/{files.length} files
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">
              {FileManager.formatFileSize(totalDownloaded)} /{" "}
              {FileManager.formatFileSize(totalSize)}
            </span>
            <span className="text-xs text-gray-500">
              {overallProgress.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
          {fileProgress.map((file /*index*/) => (
            <div
              key={file.name}
              className="bg-gray-900/50 rounded-lg p-3 border border-gray-800"
            >
              <div className="flex items-center gap-3 mb-2">
                {getFileIcon(file.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {FileManager.formatFileSize(file.size)}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {formatProgress(file.downloaded, file.size)}
                </span>
              </div>

              {file.status === "downloading" && (
                <div className="w-full bg-gray-800 rounded-full h-1">
                  <motion.div
                    className="bg-blue-500 h-1 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(file.downloaded / file.size) * 100}%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}

              {file.status === "error" && file.error && (
                <p className="text-xs text-red-400 mt-1">{file.error}</p>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">
              {completedFiles === files.length
                ? "Complete! Launching game..."
                : "Downloading files..."}
            </span>
          </div>
        </div>

        {hasErrors && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
            <p className="text-sm text-red-400 text-center">
              Some files failed to download. The download will continue
              automatically.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
