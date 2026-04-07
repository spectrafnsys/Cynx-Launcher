import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { merge } from "lodash";
import { User } from "../app/types/user";

interface UserStore {
  accessToken: string | null;
  currentUser: User | null;
  authenticate: (token: string, userData?: User) => void;
  signOut: () => void;
  setAccessToken: (token: string | null) => void;
  setUser: (userData: User) => void;
  patchUser: (changes: Partial<User>) => void;
  hasValidSession: () => { valid: boolean; error?: string };
  clearSession: () => void;
  reset: () => void;
}

const initialState = {
  accessToken: null,
  currentUser: null,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      authenticate: (token, userData) => {
        console.log("[UserStore] Authenticating user");
        set({ accessToken: token, currentUser: userData ?? null });
      },

      signOut: () => {
        console.log("[UserStore] Signing out user");
        set(() => initialState);
      },

      setAccessToken: (token) => {
        set({ accessToken: token });
      },

      setUser: (userData) => {
        set({ currentUser: userData });
      },

      patchUser: (changes) => {
        set((state) => {
          if (!state.currentUser) return {};
          const updatedUser = merge({}, state.currentUser, changes);
          return { currentUser: updatedUser };
        });
      },

      hasValidSession: () => {
        const { accessToken, currentUser } = get();

        if (!accessToken && !currentUser) {
          return { valid: false };
        }

        if (!accessToken && currentUser) {
          return { valid: false, error: "Missing access token" };
        }

        if (accessToken) {
          try {
            return { valid: true };
          } catch (err) {
            console.error("Failed to validate token", err);
            return { valid: false, error: "Invalid token" };
          }
        }

        return { valid: false };
      },

      clearSession: () => {
        set(() => initialState);
      },

      reset: () => {
        set(() => initialState);
      },
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        currentUser: state.currentUser,
      }),
    }
  )
);
