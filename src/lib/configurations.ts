import { Palette, User } from "lucide-react";
import { Setting, SettingsState } from "../app/pages/sections/temporary";

export function getWsConfig() {
  return {
      url: import.meta.env.VITE_WS_URL || "ws://26.157.83.30:9999",
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    timeout: 10000,
  };
}

export const TABS = [
  { id: "account", icon: User, label: "Account" },
  { id: "appearance", label: "Appearance", icon: Palette },
];

export const createSettingsArray = (settings: SettingsState): Setting[] => [
  {
    key: "alwaysOnTop",
    title: "Always On Top",
    description: "Keeps the launcher above all other windows.",
    checked: settings.alwaysOnTop,
  },
];
