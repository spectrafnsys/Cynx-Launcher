import { useSettingsStore, type LauncherCircleColor } from "../../../../../store/settings";
import { AnimatedToggle } from "../AnimatedToggle";

const CIRCLE_COLORS: { value: LauncherCircleColor; label: string; class: string }[] = [
  { value: "pulse-purple", label: "Pulse Purple", class: "bg-[#9294FF]" },
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "cyan", label: "Cyan", class: "bg-cyan-400" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "orange", label: "Orange", class: "bg-orange-500" },
  { value: "pink", label: "Pink", class: "bg-pink-500" },
  { value: "red", label: "Red", class: "bg-red-500" },
];

export function AppearanceSelection() {
  const {
    movingSnow,
    movingSnowIntensity,
    launcherCircleColor,
    setMovingSnow,
    setMovingSnowIntensity,
    setLauncherCircleColor,
  } = useSettingsStore();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Appearance</h2>

      <div className="rounded-xl border border-gray-800 bg-[#101010] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-100">Moving Snow</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Show falling snow effect on the launcher background.
            </p>
          </div>
          <AnimatedToggle
            checked={movingSnow}
            onCheckedChange={setMovingSnow}
          />
        </div>
        {movingSnow && (
          <div className="pt-2 border-t border-gray-800/60">
            <label className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>Intensity</span>
              <span className="font-medium text-gray-200">{movingSnowIntensity}%</span>
            </label>
            <input
              type="range"
              min={50}
              max={100}
              value={movingSnowIntensity}
              onChange={(e) => setMovingSnowIntensity(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-gray-700 accent-pulse-purple cursor-pointer"
            />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-800 bg-[#101010] p-5 space-y-4">
        <div>
          <h3 className="font-medium text-gray-100">Color Launcher (Moving Circles)</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Choose the color of the animated circles on the launcher.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {CIRCLE_COLORS.map(({ value, label, class: colorClass }) => (
            <button
              key={value}
              type="button"
              onClick={() => setLauncherCircleColor(value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                launcherCircleColor === value
                  ? "border-pulse-purple bg-pulse-purple/20 text-white"
                  : "border-gray-700 bg-gray-800/60 text-gray-300 hover:border-gray-600 hover:bg-gray-700/60"
              }`}
            >
              <span className={`w-3 h-3 rounded-full ${colorClass}`} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
