export class BuildImportErrorManager extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "BuildImportError";
  }
}

export const getImportErrorHelp = (errorCode: string): string => {
  const errorHelp: Record<string, string> = {
    INVALID_PATH:
      "Select the main Fortnite installation folder that contains the FortniteGame directory.",
    ACCESS_DENIED:
      "Ensure you have read permissions for the selected folder and try running as administrator if needed.",
    VERSION_NOT_FOUND:
      "This may not be a valid Fortnite installation or the executable file is corrupted.",
    DUPLICATE_BUILD:
      "This build has already been imported. Check your existing builds list.",
    UNSUPPORTED_VERSION:
      "This version is not officially supported but can still be imported with limited functionality.",
  };

  return (
    errorHelp[errorCode] ||
    "Please check the Fortnite installation and try again."
  );
};
