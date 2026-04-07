import { Routes, Route, useNavigate } from "react-router-dom";
import Background from "../background";
import Sidebar from "./sidebar";
import HomePage from "../pages/HomePage";
import PlaceholderPage from "../pages/PlaceholderPage";
import Frame from "../frame";
import Login from "../pages/auth/login";
import ErrorManager from "../components/managers/ErrorManager";
import LibraryPage from "../pages/LibraryPage";
import { useCallback, useEffect, useState, useRef } from "react";
import { useUserStore } from "../../store/user";
import { ShopView } from "../pages/ShopPage";
import SettingsPage from "../pages/SettingsPage";
import { invoke } from "@tauri-apps/api/core";
import UpdaterPage from "../pages/updater/UpdaterPage";
import { useUpdateStore } from "../../store/updater";
import { getVersion } from "@tauri-apps/api/app";
import DownloadPage from "../pages/DownloadPage";
import DonatePage from "../pages/DonatePage";
import FloatingParticles from "../pages/sections/home/FloatingParticles";

function AuthenticatedLayout() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="relative flex flex-col flex-1">
        <FloatingParticles />
        <div className="pb-2">
          <Frame />
        </div>
        <div className="flex-1 overflow-auto p-4">
          {{
            home: <HomePage setView={setActiveTab} />,
            library: <LibraryPage />,
            downloads: <DownloadPage />,
            shop: <ShopView />,
            donate: <DonatePage />,
            settings: <SettingsPage />,
          }[activeTab] || <PlaceholderPage title={activeTab} />}
        </div>
      </div>
    </>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useUserStore();
  const navigate = useNavigate();

  const session = user.hasValidSession();

  useEffect(() => {
    if (!session.valid) {
      console.log("No valid session in ProtectedRoute, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [session.valid, navigate]);

  if (!session.valid) {
    return null;
  }

  return <>{children}</>;
}

export default function App() {
  const user = useUserStore();
  const updateStore = useUpdateStore();
  const navigate = useNavigate();
  const [appState, setAppState] = useState<"loading" | "update" | "ready">(
    "loading"
  );
  const initializationComplete = useRef(false);

  const startRichPresence = useCallback(async () => {
    const currentUser = user?.currentUser;
    if (!currentUser) return;

    try {
      const characterId = currentUser.profile.athena.favoriteCharacterId;
      if (!characterId) return;

      const baseUrl = "https://fortnite-api.com/images/cosmetics/br/";
      const imageUrls = [
        `${baseUrl}${characterId}/icon.png`,
        `${baseUrl}${characterId}/icon.png`,
      ];

      const validImage = await Promise.any(
        imageUrls.map((url) =>
          fetch(url, { method: "HEAD" }).then((res) =>
            res.ok ? url : Promise.reject()
          )
        )
      ).catch(() => null);

      await invoke("start_rich_presence", {
        username: currentUser.discord.displayName,
        character: validImage,
      });
    } catch (error) {
      console.error("Failed to start rich presence:", error);
    }
  }, [
    user?.currentUser?.discord?.displayName,
    user?.currentUser?.profile?.athena?.favoriteCharacterId,
  ]);

  useEffect(() => {
    if (initializationComplete.current) return;

    const initializeApp = async () => {
      try {
        console.log("Checking for updates...");
        const currentVersion = await getVersion();
        const response = (await invoke("fetch_update_info")) as {
          version: string;
        };

        if (response.version !== currentVersion) {
          console.log("Update available:", response.version);
          updateStore.setUpdateInfo(response);
          setAppState("update");
          navigate("/updater", { replace: true });
          initializationComplete.current = true;
          return;
        }

        console.log("App initialization complete");
        setAppState("ready");

        const session = user.hasValidSession();
        if (session.valid && user.currentUser) {
          navigate("/home", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }

        initializationComplete.current = true;
      } catch (error) {
        console.error("App initialization failed:", error);
        setAppState("ready");
        navigate("/login", { replace: true });
        initializationComplete.current = true;
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (user.currentUser) {
      startRichPresence();
    }
  }, [user.currentUser, startRichPresence]);

  if (appState === "loading") {
    return (
      <Background>
        <div className="flex h-screen w-screen items-center justify-center"></div>
      </Background>
    );
  }

  return (
    <Background>
      <ErrorManager>
        <div className="flex h-screen w-screen overflow-hidden">
          <Routes>
            <Route
              path="/login"
              element={
                <div className="flex flex-col flex-1">
                  <Frame />
                  <Login />
                </div>
              }
            />
            <Route
              path="/updater"
              element={
                <div className="flex flex-col flex-1">
                  <Frame />
                  <UpdaterPage />
                </div>
              }
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </ErrorManager>
    </Background>
  );
}
