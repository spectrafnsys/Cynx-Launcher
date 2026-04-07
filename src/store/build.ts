import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Build {
  id: string;
  title: string;
  subtitle?: string;
  version: string;
  status?: string;
  description?: string;
  releaseDate?: string;
  shortTitle?: string;
  shipping: string;
  size: string;
  initials?: string;
  color?: string;
  path?: string;
  splash?: string;
}

interface BuildStore {
  builds: Build[];
  addBuild: (build: Build) => void;
  removeBuild: (id: string) => void;
  updateBuild: (id: string, updates: Partial<Build>) => void;
  getBuild: (id: string) => Build | undefined;
}

export const useBuildStore = create<BuildStore>()(
  persist(
    (set, get) => ({
      builds: [],

      addBuild: (build) => {
        console.log("Adding build to store:", build);
        set((state) => {
          const newBuilds = [...state.builds, build];
          console.log("Updated builds array:", newBuilds);
          return { builds: newBuilds };
        });
      },

      removeBuild: (id) =>
        set((state) => ({
          builds: state.builds.filter((build) => build.id !== id),
        })),

      updateBuild: (id, updates) =>
        set((state) => ({
          builds: state.builds.map((build) =>
            build.id === id ? { ...build, ...updates } : build
          ),
        })),

      getBuild: (id) => {
        const state = get();
        return state.builds.find((build) => build.id === id);
      },
    }),
    {
      name: "pulse-builds",
      version: 1,
    }
  )
);
