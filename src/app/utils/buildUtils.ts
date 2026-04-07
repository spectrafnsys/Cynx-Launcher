import { invoke } from "@tauri-apps/api/core";

export const VERSION_MAP: {
  [key: number]: { version: string; netcl: string };
} = {
  3870737: { version: "2.4.2", netcl: "2.4.2-CL-3870737" },
  3858292: { version: "2.4", netcl: "2.4-CL-3858292" },
  3847564: { version: "2.3", netcl: "2.3-CL-3847564" },
  3841827: { version: "2.2", netcl: "2.2-CL-3841827" },
  3825894: { version: "2.1", netcl: "2.1-CL-3825894" },
  3807424: { version: "1.11", netcl: "1.11-CL-3807424" },
  3790078: { version: "1.10", netcl: "1.10-CL-3790078" },
  3775276: { version: "1.91", netcl: "1.91-CL-3775276" },
  3757339: { version: "1.9", netcl: "1.9-CL-3757339" },
  3729133: { version: "1.8.1", netcl: "1.81-CL-3729133" },
  3724489: { version: "1.8", netcl: "1.8-CL-3724489" },
  3700114: { version: "1.7.2", netcl: "1.72-CL-3700114" },
  3541083: { version: "1.2", netcl: "1.2-CL-3541083" },
  3532353: { version: "1.0", netcl: "1.0-CL-3532353" },
};

export const validateBuildPath = async (selectedPath: string) => {
  const splashPath = `${selectedPath}/FortniteGame/Content/Splash/Splash.bmp`;
  const shippingPath = `${selectedPath}/FortniteGame/Binaries/Win64/FortniteClient-Win64-Shipping.exe`;

  const [splashExists, shippingExists] = await Promise.all([
    invoke("check_file_exists", { path: splashPath }),
    invoke("check_file_exists", { path: shippingPath }),
  ]);

  return {
    isValid: splashExists && shippingExists,
    splashPath,
    shippingPath,
  };
};

const normalizeVersion = (version: string) => {
  const parts = version.split(".");
  if (parts[0]?.length === 2 && parts[1]?.length === 1) {
    return version + "0";
  }
  return version;
};

export const parseVersionInfo = (patternHexCheck: string[]) => {
  const regex = /\+\+Fortnite\+Release-(\d+\.\d+|Cert)-CL-(\d+)/;

  for (const str of patternHexCheck) {
    const match = str.match(regex);
    if (!match) continue;

    const [, versionMatch, clNumber] = match;
    const cl = parseInt(clNumber);
    const isLiveOrCert = str.includes("Live") || str.includes("Cert");

    if (isLiveOrCert && VERSION_MAP[cl]) {
      return VERSION_MAP[cl];
    }

    // ++Fortnite+Release-24.20-CL-25156858-Windows
    if (!isLiveOrCert) {
      const version = normalizeVersion(versionMatch);
      return {
        version,
        netcl: `++Fortnite+Release-${version}-CL-${clNumber}-Windows`,
      };
    }
  }

  return { version: "NOT FOUND", netcl: "NOT FOUND" };
};

export const getBuildSize = async (buildPath: string): Promise<number> => {
  try {
    const size = await invoke<number>("get_directory_size", {
      path: buildPath,
    });
    return size;
  } catch (error) {
    console.error("Failed to get build size:", error);
    return 0;
  }
};

export const formatBytes = (bytes: number): string => {
  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(2)} ${units[i]}`;
};

export const getChapterAndSeason = (
  version: string
): { chapter: number; season: number } => {
  const [major, _] = version.split(".").map(Number);

  if (major >= 27) return { chapter: 5, season: major - 27 + 1 };
  if (major >= 24) return { chapter: 4, season: major - 24 + 2 };
  if (major >= 19) return { chapter: 3, season: major - 19 + 1 };
  if (major >= 11) return { chapter: 2, season: major - 11 + 1 };
  return { chapter: 1, season: major };
};
