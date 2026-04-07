import { Palette, Settings, User, Bug } from "lucide-react";

export interface SettingsState {
  alwaysOnTop: boolean;
}

export interface Setting {
  key: keyof SettingsState;
  title: string;
  description: string;
  checked: boolean;
}

export const navigationItems = [
  {
    id: "profile",
    title: "Profile",
    icon: User,
    description: "Manage your account",
  },
  {
    id: "preferences",
    title: "Preferences",
    icon: Settings,
    description: "Launcher settings",
  },
  {
    id: "appearance",
    title: "Appearance",
    icon: Palette,
    description: "Snow effect & circle colors",
  },
  {
    id: "debug",
    title: "Debug",
    icon: Bug,
    description: "WebSocket information",
  },
];
