import { AnimatedToggle } from "./AnimatedToggle";

interface SettingItemProps {
  setting: {
    key: string;
    title: string;
    description: string;
    checked: boolean;
  };
  onToggle: (key: string, checked: boolean) => void;
}

export function SettingItem({ setting, onToggle }: SettingItemProps) {
  const handleToggle = (checked: boolean) => {
    onToggle(setting.key, checked);
  };

  return (
    <div
      data-setting={setting.key}
      className={`relative flex items-center justify-between p-5 rounded-xl border bg-[#101010] 
          transition-all duration-300 cursor-pointer
          ${
            setting.checked
              ? "border-pulse-purple shadow-[0_0_12px_rgba(146,148,255,0.4)] bg-pulse-purple/20"
              : "border-gray-800 hover:border-pulse-purple/70 hover:bg-pulse-purple/10 hover:shadow-[0_0_8px_rgba(146,148,255,0.2)]"
          }
          hover:scale-[1.02]`}
      style={{
        transform: setting.checked ? "translateY(-2px)" : "translateY(0)",
        transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <div
        className={`absolute inset-0 rounded-xl pointer-events-none
          ${
            setting.checked
              ? "bg-gradient-to-r from-pulse-purple/40 to-pulse-purple/30"
              : "opacity-0"
          }
          transition-opacity duration-300`}
      />

      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="mr-4 flex flex-col">
          <div
            className={`font-semibold transition-colors duration-300
              ${
                setting.checked
                  ? "text-indigo-300"
                  : "text-gray-300 group-hover:text-indigo-400"
              }`}
          >
            {setting.title}
            {setting.checked && (
              <span className="ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-700/60 text-indigo-200">
                Active
              </span>
            )}
          </div>
          <p
            className={`text-sm mt-1 transition-colors duration-300
              ${setting.checked ? "text-indigo-400/80" : "text-gray-500"}`}
          >
            {setting.description}
          </p>
        </div>

        <div className="transform transition-transform duration-300 hover:scale-110">
          <AnimatedToggle
            checked={setting.checked}
            onCheckedChange={handleToggle}
          />
        </div>
      </div>
    </div>
  );
}
