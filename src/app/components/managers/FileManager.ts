import { invoke } from "@tauri-apps/api/core";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { SettingsStore } from "../../../store/settings";

interface FileInfo {
  name: string;
  url: string;
  size: number;
}

interface FileDefinition {
  name: string;
  url: string;
  estimatedSize?: number;
}

export class FileManager {
  private static readonly BUBBLE_WRAP_FILES: FileDefinition[] = [
    {
      name: "z_pakchunk250-Windows_P.pak",
      url: "",
      estimatedSize: 52428800,
    },
    {
      name: "z_pakchunk250-Windows_P.sig",
      url: "",
      estimatedSize: 524288,
    },
    {
      name: "z_pakchunk250-Windows_P.ucas",
      url: "",
      estimatedSize: 10485760,
    },
    {
      name: "z_pakchunk250-Windows_P.utoc",
      url: "",
      estimatedSize: 1048576,
    },
  ];

  private static async getFileSize(url: string): Promise<number> {
    try {
      const response = await tauriFetch(url, {
        method: "HEAD",
      });

      const contentLength = response.headers.get("content-length");
      const size = contentLength ? parseInt(contentLength, 10) : 0;
      return size;
    } catch (error) {
      console.warn(`Error getting size for ${url}:`, error);
      return 0;
    }
  }

  private static async processFile(
    fileDefinition: FileDefinition
  ): Promise<FileInfo> {
    let size = await this.getFileSize(fileDefinition.url);

    if (size === 0 && fileDefinition.estimatedSize) {
      size = fileDefinition.estimatedSize;
      console.log(
        `Using estimated size: ${size} bytes for ${fileDefinition.name}`
      );
    }

    return {
      name: fileDefinition.name,
      url: fileDefinition.url,
      size,
    };
  }

  static async getBubbleWrapFiles(): Promise<FileInfo[]> {
    try {
      const filePromises = this.BUBBLE_WRAP_FILES.map((file) =>
        this.processFile(file)
      );
      const files = await Promise.all(filePromises);
      return files;
    } catch (error) {
      console.error("Error processing bubble wrap files:", error);
      return this.BUBBLE_WRAP_FILES.map((file) => ({
        name: file.name,
        url: file.url,
        size: file.estimatedSize || 1048576,
      }));
    }
  }

  static async deleteBubbleWrapFiles(basePath: string): Promise<void> {
    const filesToDelete = this.BUBBLE_WRAP_FILES.map((file) => file.name);

    for (const fileName of filesToDelete) {
      try {
        const filePath = `${basePath}\\Content\\Paks\\${fileName}`;
        await invoke("delete_file", { filePath });
        console.log(`Successfully deleted: ${fileName}`);
      } catch (error) {
        console.warn(`Failed to delete ${fileName}:`, error);
      }
    }
  }

  static async forceRedownloadBubbleWrapFiles(
    basePath: string
  ): Promise<FileInfo[]> {
    await this.deleteBubbleWrapFiles(basePath);

    const bubbleWrapFiles = await this.getBubbleWrapFiles();

    return bubbleWrapFiles;
  }

  static async fileExists(filePath: string): Promise<boolean> {
    try {
      return await invoke<boolean>("file_exists", { filePath });
    } catch (error) {
      console.warn(`Error checking file existence for ${filePath}:`, error);
      return false;
    }
  }

  static async getBubbleWrapFileStatus(basePath: string): Promise<{
    existing: string[];
    missing: FileInfo[];
    total: number;
  }> {
    const bubbleWrapFiles = await this.getBubbleWrapFiles();
    const existing: string[] = [];
    const missing: FileInfo[] = [];

    for (const file of bubbleWrapFiles) {
      const filePath = `${basePath}\\Content\\Paks\\${file.name}`;
      const exists = await this.fileExists(filePath);

      if (exists) {
        existing.push(file.name);
      } else {
        missing.push(file);
      }
    }

    return {
      existing,
      missing,
      total: bubbleWrapFiles.length,
    };
  }

  static async getRequiredFiles(
    settingsStore: SettingsStore,
    basePath: string,
    forceRecheck: boolean = false
  ): Promise<FileInfo[]> {
    const files: FileInfo[] = [];

    if (settingsStore.bubbleWrapBuilds) {
      try {
        if (forceRecheck) {
          const bubbleWrapFiles = await this.getBubbleWrapFiles();
          files.push(...bubbleWrapFiles);
        } else {
          const filesToCheck = await this.getBubbleWrapFiles();
          const filesToDownload: FileInfo[] = [];

          for (const file of filesToCheck) {
            const filePath = `${basePath}\\Content\\Paks\\${file.name}`;

            try {
              const fileExists = await invoke<boolean>("file_exists", {
                filePath,
              });
              if (!fileExists) {
                filesToDownload.push(file);
              } else {
                console.log(`File already exists: ${file.name}`);
              }
            } catch (error) {
              console.warn(
                `Error checking file existence for ${file.name}, assuming it needs download:`,
                error
              );
              filesToDownload.push(file);
            }
          }

          files.push(...filesToDownload);
        }
      } catch (error) {
        console.error("Error getting bubble wrap files:", error);
      }
    } else {
      try {
        await this.deleteBubbleWrapFiles(basePath);
      } catch (error) {
        console.warn("Failed to delete some bubble wrap files:", error);
      }
    }

    return files;
  }

  static async validateBubbleWrapFiles(basePath: string): Promise<{
    isValid: boolean;
    missingFiles: string[];
    corruptedFiles: string[];
  }> {
    const bubbleWrapFiles = await this.getBubbleWrapFiles();
    const missingFiles: string[] = [];
    const corruptedFiles: string[] = [];

    for (const file of bubbleWrapFiles) {
      const filePath = `${basePath}\\Content\\Paks\\${file.name}`;

      try {
        const exists = await this.fileExists(filePath);

        if (!exists) {
          missingFiles.push(file.name);
        }
      } catch (error) {
        console.warn(`Error validating ${file.name}:`, error);
        corruptedFiles.push(file.name);
      }
    }

    return {
      isValid: missingFiles.length === 0 && corruptedFiles.length === 0,
      missingFiles,
      corruptedFiles,
    };
  }

  static formatFileSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  static formatFileInfo(files: FileInfo[]): string {
    if (files.length === 0) return "No files";

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const fileList = files
      .map((file) => `${file.name} (${this.formatFileSize(file.size)})`)
      .join(", ");

    return `${files.length} files (${this.formatFileSize(
      totalSize
    )}): ${fileList}`;
  }
}
