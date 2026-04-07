import { open, message } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import {
  formatBytes,
  getBuildSize,
  getChapterAndSeason,
  parseVersionInfo,
  validateBuildPath,
} from "./buildUtils";
import { useBuildStore } from "../../store/build";

const supportedVersions = ["19.10", "10.40", "14.40", "17.30", "24.20"];

export interface ImportResult {
  path: string;
  version: string;
  title: string;
  size: string;
  season: string;
  isSupported: boolean;
  shipping: string;
}

export const importBuild = async (): Promise<ImportResult | null> => {
  try {
    const buildStore = useBuildStore.getState();

    const selectedPath = await open({
      multiple: false,
      directory: true,
      title: "Select Fortnite Installation Folder",
    });

    if (!selectedPath) {
      return null;
    }

    if (typeof selectedPath !== "string" || selectedPath.trim() === "") {
      await message(
        "Invalid path selected. Please select a valid Fortnite installation folder.",
        { title: "Invalid Path" }
      );
      return null;
    }

    let validationResult;
    try {
      validationResult = await validateBuildPath(selectedPath);
    } catch (error) {
      await message(
        `Unable to access the selected folder: ${selectedPath}\n\nPlease ensure you have permission to read this directory and try again.`,
        { title: "Access Error" }
      );
      return null;
    }

    const { isValid, shippingPath } = validationResult;

    if (!isValid) {
      await message(
        `The selected folder does not appear to be a valid Fortnite installation:\n\n${selectedPath}\n\nPlease select the root Fortnite folder that contains the FortniteGame directory.`,
        { title: "Invalid Fortnite Installation" }
      );
      return null;
    }

    const existingBuild = buildStore.builds.find(
      (b) => b.shipping === shippingPath
    );
    if (existingBuild) {
      await message(
        `This Fortnite build has already been imported:\n\n${existingBuild.title} (${existingBuild.version})\n\nPath: ${selectedPath}`,
        { title: "Build Already Exists" }
      );
      return null;
    }

    let patternHexCheck: string[];
    try {
      patternHexCheck = (await invoke("locate_version", {
        filePath: shippingPath,
      })) as string[];
    } catch (error) {
      await message(
        `Failed to analyze the Fortnite executable:\n\n${shippingPath}\n\nThis may not be a valid Fortnite installation, or the file may be corrupted.`,
        { title: "Version Detection Failed" }
      );
      return null;
    }

    if (!patternHexCheck || !Array.isArray(patternHexCheck)) {
      await message(
        "Unable to read version information from the Fortnite executable.\n\nThe file may be corrupted or not a valid Fortnite installation.",
        { title: "Invalid Version Data" }
      );
      return null;
    }

    const { version, netcl } = parseVersionInfo(patternHexCheck);

    if (version === "NOT FOUND") {
      await message(
        `Could not detect the Fortnite version from:\n\n${shippingPath}\n\nThis may be a corrupted installation or an unsupported Fortnite version.`,
        { title: "Version Not Found" }
      );
      return null;
    }

    if (netcl === "NOT FOUND") {
      await message(
        `Found Fortnite version ${version}, but could not detect the network client version.\n\nThis installation may be incomplete or corrupted.`,
        { title: "Network Client Not Found" }
      );
      return null;
    }

    const isSupported = supportedVersions.includes(version);

    const fortniteGameDir =
      shippingPath.replace(/\//g, "\\").split("\\FortniteGame\\")[0] +
      "\\FortniteGame";

    let buildSize: number;
    let formattedSize: string;

    try {
      buildSize = await getBuildSize(fortniteGameDir);
      formattedSize = formatBytes(buildSize);
    } catch (error) {
      console.warn("Could not calculate build size:", error);
      formattedSize = "Unknown";
    }

    let chapterSeasonInfo;
    try {
      chapterSeasonInfo = getChapterAndSeason(version);
    } catch (error) {
      console.warn("Could not determine chapter/season:", error);
      chapterSeasonInfo = { chapter: "Unknown", season: "Unknown" };
    }

    const { chapter, season } = chapterSeasonInfo;

    const result: ImportResult = {
      path: fortniteGameDir,
      version: version,
      title: `Chapter ${chapter} Season ${season}`,
      season: season.toString(),
      size: formattedSize,
      isSupported,
      shipping: shippingPath,
    };

    console.log("Successfully imported build:", result);

    return result;
  } catch (error) {
    console.error("Import build error:", error);
    let errorMessage = "An unexpected error occurred during import.";

    if (error instanceof Error) {
      if (error.message.includes("permission")) {
        errorMessage =
          "Permission denied. Please ensure you have read access to the selected folder and try again.";
      } else if (
        error.message.includes("not found") ||
        error.message.includes("ENOENT")
      ) {
        errorMessage =
          "The selected folder or required files could not be found. Please verify the Fortnite installation is complete.";
      } else if (error.message.includes("timeout")) {
        errorMessage =
          "The operation timed out. This may be due to a slow disk or large installation. Please try again.";
      } else {
        errorMessage = `Import failed: ${error.message}`;
      }
    }

    await message(
      `${errorMessage}\n\nPlease check the console for more details and try again.`,
      { title: "Import Error" }
    );

    return null;
  }
};

export const isVersionSupported = (version: string): boolean => {
  if (!version || typeof version !== "string") {
    return false;
  }
  return supportedVersions.includes(version.trim());
};
