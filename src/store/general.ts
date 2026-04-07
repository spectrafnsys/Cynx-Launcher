import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GeneralState {
  lastLeaderboardUpdate: number | null;
  nextLeaderboardUpdateAt: number | null;
  setLastLeaderboardUpdate: (timestamp: number) => void;
  setNextLeaderboardUpdateAt: (timestamp: number) => void;
}

export const useGeneralStore = create<GeneralState>()(
  persist(
    (set) => ({
      lastLeaderboardUpdate: null,
      nextLeaderboardUpdateAt: null,
      setLastLeaderboardUpdate: (timestamp) =>
        set({ lastLeaderboardUpdate: timestamp }),
      setNextLeaderboardUpdateAt: (timestamp) =>
        set({ nextLeaderboardUpdateAt: timestamp }),
    }),
    {
      name: "general-store",
      partialize: (state) => ({
        lastLeaderboardUpdate: state.lastLeaderboardUpdate,
        nextLeaderboardUpdateAt: state.nextLeaderboardUpdateAt,
      }),
    }
  )
);
