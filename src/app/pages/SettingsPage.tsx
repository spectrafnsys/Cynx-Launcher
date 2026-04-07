import { useState } from "react";
import { createSettingsArray } from "../../lib/configurations";
import { SettingsSidebar } from "./sections/settings/SettingsSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, useUserSession } from "../hooks/useAuth";
import { SettingsState } from "./sections/temporary";
import { SettingItem } from "./sections/settings/SettingItem";
import { LogOut, Loader2, Palette } from "lucide-react";
import { useSocket } from "../../lib/socket";
import { useSettingsStore } from "../../store/settings";
import { invoke } from "@tauri-apps/api/core";
import { ProfileSection } from "./sections/settings/selections/ProfileSelection";
import { AppearanceSelection } from "./sections/settings/selections/AppearanceSelection";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const user = useAuth();
  const isLoading =
    user !== null && typeof user === "object" && "loading" in user;
  const isAuthenticated = user !== null && !isLoading;
  const userData = isAuthenticated ? user : null;

  const session = useUserSession();
  const socket = useSocket();

  const settingsStore = useSettingsStore();


  const updateSetting = async (key: keyof SettingsState, value: boolean) => {
    switch (key) {
      case "alwaysOnTop":
        settingsStore.setAlwaysOnTop(value);
        await invoke("set_always_on_top", { alwaysOnTop: value });
        break;
    }
  };

  const settingsArray = createSettingsArray({
    alwaysOnTop: settingsStore.alwaysOnTop,
  });


  const handleSignOut = () => {
    setShowSignOutDialog(true);
    setIsClosing(false);
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowSignOutDialog(false);
      setIsClosing(false);
    }, 200);
  };

  const confirmSignOut = async () => {
    if (!user || !session.hasValidSession() || !socket.isConnected()) return;

    session.signOut();
    socket.disconnect();
    closeModal();
  };

  const cancelSignOut = () => {
    closeModal();
  };

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        if (isLoading || !userData) {
          return (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
          );
        }
        return <ProfileSection user={userData} />;
      case "preferences":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">General Settings</h2>
            {settingsArray.map((setting) => (
              <SettingItem
                key={setting.key}
                setting={setting}
                onToggle={(key, value) =>
                  updateSetting(key as keyof SettingsState, value)
                }
              />
            ))}
          </div>
        );
      case "appearance":
        return <AppearanceSelection />;
      default:
        return (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold">Section not found</h2>
            <p className="text-muted-foreground">
              The selected section doesn't exist.
            </p>
          </div>
        );
    }
  };

  if (!user || !session) {
    console.error("Invalid user.");
    return null;
  }

  return (
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto">
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0px);
          }
        }
        @keyframes scaleOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0px);
          }
          to {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
        }
      `}</style>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and launcher preferences
        </p>
      </div>

      <div className="flex flex-1 gap-8 min-h-0">
        <div className="w-64 flex-shrink-0">
          <SettingsSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onSignOut={handleSignOut}
          />
        </div>

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {showSignOutDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            animation: isClosing
              ? "fadeOut 0.2s ease-out"
              : "fadeIn 0.2s ease-out",
          }}
          onClick={closeModal}
        >
          <div
            className="rounded-lg p-6 max-w-md w-full mx-4"
            style={{
              backgroundColor: "#1f1f1f",
              border: "1px solid #404040",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
              animation: isClosing
                ? "scaleOut 0.2s ease-out"
                : "scaleIn 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: "#f8fafc" }}
            >
              Sign Out
            </h2>
            <p className="mb-6" style={{ color: "#94a3b8" }}>
              Are you sure you want to sign out? You'll need to sign back in to
              access your account.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelSignOut}
                className="px-4 py-2 rounded-md transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor: "#374151",
                  color: "#e2e8f0",
                  border: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#4b5563";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#374151";
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                className="px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer"
                style={{
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ef4444";
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
