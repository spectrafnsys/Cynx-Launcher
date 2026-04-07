import { Check } from "lucide-react";
import { useState } from "react";

interface AnimatedToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function AnimatedToggle({
  checked,
  onCheckedChange,
}: AnimatedToggleProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onCheckedChange(!checked);
  };

  return (
    <div
      role="switch"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onMouseEnter={() => setIsHovered(true)}
      //   onMouseLeave={() => setIsHovered(false)}
      className={`relative w-16 h-8 rounded-full p-1 cursor-pointer select-none transition-all duration-300
        ${
          checked
            ? "bg-gradient-to-r from-pulse-purple to-pulse-purple/90 shadow-[0_0_20px_rgba(146,148,255,0.5)]"
            : "bg-gray-700 shadow-inner"
        }
        ${isPressed ? "scale-95" : isHovered ? "scale-105" : "scale-100"}
      `}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        className={`absolute inset-0 rounded-full transition-opacity duration-300
          ${checked ? "opacity-100" : "opacity-0"}`}
        style={{
          background:
            "radial-gradient(circle at center, rgba(146, 148, 255, 0.5) 0%, rgba(146, 148, 255, 0.2) 60%, transparent 80%)",
          filter: "blur(5px)",
          pointerEvents: "none",
        }}
      />

      <div className={`absolute inset-0 rounded-full bg-transparent`} />

      <div
        className={`relative w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-400 ease-out
          ${checked ? "translate-x-8 rotate-0" : "translate-x-0 rotate-0"}`}
        style={{
          boxShadow: checked
            ? "0 6px 20px rgba(146, 148, 255, 0.6), inset 0 1px 3px rgba(255,255,255,0.8)"
            : "0 4px 10px rgba(0,0,0,0.4), inset 0 1px 3px rgba(255,255,255,0.6)",
          willChange: "transform",
        }}
      >
        <Check
          className={`w-4 h-4 text-pulse-purple transition-opacity duration-300
            ${checked ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </div>
  );
}
