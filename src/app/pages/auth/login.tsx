import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ErrorManager from "../../components/managers/ErrorManager";
import { useSafeSetState } from "../../utils/reactUtils";

import { open } from "@tauri-apps/plugin-shell";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { useUserStore } from "../../../store/user";
import api from "../../../lib/axios";
import { Window } from "@tauri-apps/api/window";

interface LoginProps {
  onLogin?: () => void;
}

type LoginStatus = "idle" | "waiting" | "success" | "failed" | "banned";

const Login: React.FC<LoginProps> = () => {
  const [loginStatus, setLoginStatus] = useState<LoginStatus>("idle");
  const navigate = useNavigate();
  const isComponentMountedRef = useRef(true);
  const deepLinkUnlistenRef = useRef<(() => void) | null>(null);
  const loginInProgressRef = useRef(false);
  const safeSetState = useSafeSetState();
  const userStore = useUserStore();
  const win = new Window("main");

  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      isComponentMountedRef.current = false;
    };
  }, []);

  const handleDiscordLogin = async () => {
    if (loginStatus !== "idle" && loginStatus !== "failed") return;
    if (loginInProgressRef.current) return;

    loginInProgressRef.current = true;
    safeSetState(setLoginStatus, "waiting", isComponentMountedRef);

    try {
      const callbackResult = await api.discord.getCallback();
      if (!callbackResult?.ok || !callbackResult.data) {
        throw new Error("Invalid callback response");
      }

      await open(callbackResult.data);
    } catch (error) {
      console.error("[Login] Login failed:", error);
      loginInProgressRef.current = false;
      safeSetState(setLoginStatus, "failed", isComponentMountedRef);
    }
  };

  const handleNewToken = useCallback(
    async (payload: string[]) => {
      try {
        const loginToken = payload.find(
          (token) =>
            typeof token === "string" &&
            (token.startsWith("pulse://") ||
              token.startsWith("vortyx://") ||
              token.startsWith("crystal://"))
        );

        if (!loginToken) return;

        const cleanedToken = loginToken
          .replace(/^(pulse|vortyx|crystal):\/\//, "")
          .replace(/\//g, "")
          .trim();

        if (!cleanedToken || cleanedToken.length < 10) {
          safeSetState(setLoginStatus, "failed", isComponentMountedRef);
          return;
        }

        win.setFocus();
        safeSetState(setLoginStatus, "waiting", isComponentMountedRef);

        console.log("[Login] Attempting to authenticate with token...");
        await userStore.authenticate(cleanedToken);

        loginInProgressRef.current = false;
        safeSetState(setLoginStatus, "success", isComponentMountedRef);

        console.log("[Login] Authentication successful, navigating to /home");
        navigate("/home", { replace: true });
      } catch (error) {
        console.error("[Login] Failed to handle token:", error);
        loginInProgressRef.current = false;
        safeSetState(setLoginStatus, "failed", isComponentMountedRef);
      }
    },
    [userStore, navigate, safeSetState]
  );

  useEffect(() => {
    let isActive = true;

    const setupDeepLink = async () => {
      try {
        const unlisten = await onOpenUrl(async (urls) => {
          if (isActive) await handleNewToken(urls);
        });

        if (isActive && typeof unlisten === "function") {
          deepLinkUnlistenRef.current = unlisten;
        }
      } catch (error) {
        console.error("[Login] Deep link setup error:", error);
      }
    };

    setupDeepLink();

    return () => {
      isActive = false;
      if (deepLinkUnlistenRef.current) {
        try {
          deepLinkUnlistenRef.current();
        } catch (e) {
          console.warn("[Login] Deep link cleanup error:", e);
        }
        deepLinkUnlistenRef.current = null;
      }
    };
  }, [handleNewToken]);

  const getButtonContent = () => {
    switch (loginStatus) {
      case "waiting":
        return <span className="relative z-10">Waiting...</span>;
      case "success":
        return <span className="relative z-10">Success</span>;
      case "failed":
        return <span className="relative z-10">Failed</span>;
      case "banned":
        return <span className="relative z-10">Banned</span>;
      default:
        return <span className="relative z-10">Authenticate</span>;
    }
  };

  return (
    <ErrorManager>
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            damping: 30,
            stiffness: 330,
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="flex flex-col gap-2 rounded-lg border justify-center items-center text-center border-stone-800 p-6 bg-gradient-to-b from-stone-950 to-neutral-800"
        >
          <img className="h-25" src="/icon.png" />
          <h2 className="font-bold text-3xl">Sign in</h2>
          <p className="rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 p-3 text-xs font-bold">
            Pulse utilizes Discord OAuth2 to login and create users, please
            authenticate below.
          </p>
          <button
            onClick={handleDiscordLogin}
            className="rounded-sm bg-pulse-purple w-full h-10 font-bold text-white text-sm cursor-pointer hover:opacity-90 transition-all"
          >
            {getButtonContent()}
          </button>
        </motion.div>
      </div>
    </ErrorManager>
  );
};

export default Login;
