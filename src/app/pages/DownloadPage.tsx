import React from "react";
import { BuildList } from "./sections/download/BuildList";

const DownloadPage: React.FC = () => {
    return (
        <div className="p-3">
            <BuildList />
        </div>
    )
}

export default DownloadPage;