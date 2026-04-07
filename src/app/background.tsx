import type React from "react";
import { SnowEffect } from "./components/effects/SnowEffect";

interface BackgroundProps {
  children: React.ReactNode;
}

export default function Background({ children }: BackgroundProps) {
  return (
    <div className="w-[1280px] h-[720px] relative bg-[#101010] text-gray-300 overflow-hidden flex flex-col shadow-2xl">
      <SnowEffect />
      <div className="relative z-10 flex flex-col flex-1 min-h-0">{children}</div>
    </div>
  );
}
