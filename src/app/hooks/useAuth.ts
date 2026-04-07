import { useCallback, useMemo } from "react";
import { useUserStore } from "../../store/user";
import { User } from "../types/user";

export function useAuth(): User | { loading: true } | null {
  const userStore = useUserStore();

  return useMemo(() => {
    const { currentUser, hasValidSession } = userStore;
    const session = hasValidSession();

    if (!session.valid) {
      return null;
    }

    if (!currentUser) {
      return { loading: true };
    }

    return currentUser;
  }, [userStore.currentUser, userStore.accessToken]);
}

export function useUserSession() {
  const userStore = useUserStore();

  const isAuthenticated = useMemo(() => {
    const session = userStore.hasValidSession();
    return session.valid;
  }, [userStore.accessToken]);

  const logout = useCallback(() => {
    try {
      userStore.signOut();
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  }, [userStore]);

  return {
    ...userStore,
    isAuthenticated,
    logout,
  };
}
