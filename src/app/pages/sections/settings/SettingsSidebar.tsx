"use client";
import { LogOut } from "lucide-react";
import { navigationItems } from "../temporary";

interface SettingsSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onSignOut: () => void;
}

export function SettingsSidebar({
  activeSection,
  onSectionChange,
  onSignOut,
}: SettingsSidebarProps) {
  return (
    <div className="bg-[#101010] border border-[#1a1a1a] rounded-lg p-4">
      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                isActive
                  ? "bg-stone-500/20 text-gray-100 border border-stone-500/30"
                  : "text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-200"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-medium truncate">{item.title}</div>
                <div className="text-xs opacity-70 truncate">
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-[#1a1a1a] my-4"></div>

      <button
        onClick={onSignOut}
        className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  );
}
