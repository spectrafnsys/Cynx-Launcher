;
import { useState } from "react";
import ErrorManager from "../components/managers/ErrorManager";
import { Builds } from "./sections/library/Builds";
import { LibraryHeader } from "./sections/library/Header";
import BuildDetail from "./sections/library/BuildDetails";

export default function LibraryPage() {
  const [selectedBuild, setSelectedBuild] = useState<string | null>(null);

  const handleBuildSelect = (buildId: string) => {
    console.log("LibraryPage: handleBuildSelect called with:", buildId);
    setSelectedBuild(buildId);
  };

  const handleBackToLibrary = () => {
    setSelectedBuild(null);
  };

  console.log("LibraryPage: Rendering with selectedBuild:", selectedBuild);

  return (
    <ErrorManager>
      <div className="space-y-4 p-2 transition-all duration-300">
        {selectedBuild ? (
          <BuildDetail buildId={selectedBuild} onBack={handleBackToLibrary} />
        ) : (
          <>
            <LibraryHeader />
            <Builds onBuildClick={handleBuildSelect} />
          </>
        )}
      </div>
    </ErrorManager>
  );
}