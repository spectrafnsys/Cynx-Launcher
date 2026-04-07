import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LauncherCircleColor =
  | "pulse-purple"
  | "blue"
  | "cyan"
  | "green"
  | "orange"
  | "pink"
  | "red";

export interface SettingsStore {
  bubbleWrapBuilds: boolean;
  resetOnRelease: boolean;
  viewMode: "list" | "grid";
  alwaysOnTop: boolean;
  movingSnow: boolean;
  movingSnowIntensity: number;
  launcherCircleColor: LauncherCircleColor;
  setAlwaysOnTop: (alwaysOnTop: boolean) => void;
  setMovingSnow: (enabled: boolean) => void;
  setMovingSnowIntensity: (value: number) => void;
  setLauncherCircleColor: (color: LauncherCircleColor) => void;
  toggleBubbleWrapBuilds: () => void;
  toggleResetOnRelease: () => void;
  setViewMode: (mode: "list" | "grid") => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      bubbleWrapBuilds: false,
      resetOnRelease: false,
      viewMode: "list",
      alwaysOnTop: false,
      movingSnow: false,
      movingSnowIntensity: 75,
      launcherCircleColor: "pulse-purple",
      setAlwaysOnTop: (alwaysOnTop) => set({ alwaysOnTop }),
      setMovingSnow: (movingSnow) => set({ movingSnow }),
      setMovingSnowIntensity: (movingSnowIntensity) =>
        set({ movingSnowIntensity: Math.max(50, Math.min(100, movingSnowIntensity)) }),
      setLauncherCircleColor: (launcherCircleColor) => set({ launcherCircleColor }),
      toggleBubbleWrapBuilds: () =>
        set((state) => ({ bubbleWrapBuilds: !state.bubbleWrapBuilds })),
      toggleResetOnRelease: () =>
        set((state) => ({ resetOnRelease: !state.resetOnRelease })),
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: "pulse-settings",
    }
  )
);
