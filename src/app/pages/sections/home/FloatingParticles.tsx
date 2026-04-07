import { useSettingsStore, type LauncherCircleColor } from "../../../../store/settings";

const CIRCLE_COLOR_CLASS: Record<LauncherCircleColor, string> = {
  "pulse-purple": "bg-pulse-purple",
  blue: "bg-blue-500",
  cyan: "bg-cyan-400",
  green: "bg-green-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
  red: "bg-red-500",
};

export default function FloatingParticles() {
  const { launcherCircleColor } = useSettingsStore();
  const colorClass = CIRCLE_COLOR_CLASS[launcherCircleColor];

  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      <div
        className={`absolute top-4 right-4 w-1 h-1 ${colorClass} rounded-full animate-ping`}
      />
      <div
        className={`absolute top-8 right-12 w-1.5 h-1.5 ${colorClass} rounded-full animate-ping`}
        style={{ animationDelay: "0.5s" }}
      />
      <div
        className={`absolute top-12 right-6 w-1 h-1 ${colorClass} rounded-full animate-ping`}
        style={{ animationDelay: "1s" }}
      />
      <div
        className={`absolute top-6 right-20 w-0.5 h-0.5 ${colorClass}/60 rounded-full animate-ping`}
        style={{ animationDelay: "1.5s" }}
      />
    </div>
  );
}
