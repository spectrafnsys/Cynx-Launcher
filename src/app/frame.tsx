import type React from "react";
import { useEffect, useState } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getVersion } from "@tauri-apps/api/app";
import { Minus, X } from "lucide-react";

const Frame: React.FC = () => {
  const [, setVersion] = useState<string>("0.0.0");

  useEffect(() => {
    const fetchVersion = async () => {
      const v = await getVersion();
      setVersion(v.toString());
    };
    fetchVersion();
  }, []);

  return (
    <div
      data-tauri-drag-region
      className="w-full h-10 px-2 pt-2 bg-transparent top-0 flex justify-end items-center select-none"
    >
      <div className="flex flex-row items-center justify-center gap-1 text-white">
        <button
          className="p-1.5 rounded-md hover:bg-zinc-800/40 active:bg-zinc-700/50 transition-all duration-200 cursor-pointer h-8 w-8 flex justify-center items-center border border-transparent hover:border-zinc-600/30 shadow-sm"
          onClick={() => getCurrentWebviewWindow().minimize()}
        >
          <Minus className="text-white drop-shadow-sm" size={14} />
        </button>
        <button
          className="p-1.5 rounded-md hover:bg-red-800/40 active:bg-red-700/50 transition-all duration-200 cursor-pointer h-8 w-8 flex justify-center items-center border border-transparent hover:border-red-600/30 shadow-sm"
          onClick={() => getCurrentWebviewWindow().close()}
        >
          <X className="text-white drop-shadow-sm" size={16} />
        </button>
      </div>
    </div>
  );
};

export default Frame;
