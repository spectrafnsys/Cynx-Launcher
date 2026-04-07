import { create } from "zustand";

interface UpdateState {
  updateInfo: any | null;
  setUpdateInfo: (info: any) => void;
  clearUpdateInfo: () => void;
}

export const useUpdateStore = create<UpdateState>((set) => ({
  updateInfo: null,
  setUpdateInfo: (info) => set({ updateInfo: info }),
  clearUpdateInfo: () => set({ updateInfo: null }),
}));
