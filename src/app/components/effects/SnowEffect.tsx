import React from "react";
import { useSettingsStore } from "../../../store/settings";

const FLAKE_COUNT = 50;

export function SnowEffect() {
  const { movingSnow, movingSnowIntensity } = useSettingsStore();
  if (!movingSnow) return null;

  const opacity = movingSnowIntensity / 100;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden z-0"
      aria-hidden
    >
      <style>{`
        @keyframes snow-fall {
          0% { transform: translateY(-10%) translateX(0); }
          100% { transform: translateY(110%) translateX(10px); }
        }
        .snow-flake {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: snow-fall linear infinite;
        }
      `}</style>
      {Array.from({ length: FLAKE_COUNT }).map((_, i) => (
        <div
          key={i}
          className="snow-flake"
          style={{
            left: `${(i * 37) % 100}%`,
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            opacity: opacity * (0.4 + (i % 3) * 0.2),
            animationDuration: `${8 + (i % 5)}s`,
            animationDelay: `${(i * 0.2) % 5}s`,
          }}
        />
      ))}
    </div>
  );
}
