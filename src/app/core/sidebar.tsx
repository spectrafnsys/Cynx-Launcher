import {
  Home,
  Library,
  Settings,
  User,
  ShoppingCart,
  LogOut,
  ChevronUp,
  Clock,
  Loader2,
  Download,
  Heart,
} from "lucide-react";
import { useAuth, useUserSession } from "../hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const user = useAuth();
  const userValidation = useUserSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isLoading =
    user !== null && typeof user === "object" && "loading" in user;
  const isAuthenticated = user !== null && !isLoading;
  const userData = isAuthenticated ? user : null;

  const sidebarItems = [
    { icon: Home, label: "Home", id: "home" },
    { icon: Library, label: "Library", id: "library" },
    { icon: Download, label: "Download", id: "downloads" },
  ];

  const customizationItems = [
    { icon: ShoppingCart, label: "Item Shop", id: "shop" },
    { icon: Heart, label: "Donate", id: "donate" },
    { icon: Settings, label: "Settings", id: "settings" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = () => {
    if (userValidation.hasValidSession()) {
      userValidation.logout();
    }
    setIsProfileOpen(false);
  };

  return (
    <div className="w-61 bg-stone-900/30 backdrop-blur-sm border-r border-stone-700/30 flex flex-col h-full">
      <div className="p-4 flex-shrink-0">
        <div className="text-xs flex justify-center items-center text-slate-400 uppercase tracking-wider mb-3 font-semibold">
          <img src="/icon.png" className="h-15" alt="Logo" />
        </div>
      </div>

      <div className="flex-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-stone-700/50 hover:scrollbar-thumb-slate-600/70">
        <div className="px-4 pb-3">
          <div className="space-y-1.5">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 cursor-pointer transform hover:scale-105 ${activeTab === item.id
                  ? "bg-stone-800/50 text-slate-200 font-medium shadow-lg shadow-stone-700/20 border border-stone-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-stone-800/30 hover:shadow-md hover:shadow-stone-700/10"
                  }`}
              >
                <item.icon
                  className={`w-4 h-4 transition-all duration-300 flex-shrink-0 ${activeTab === item.id
                    ? "text-zinc-300"
                    : "group-hover:text-zinc-400"
                    }`}
                />
                <span className="transition-all duration-300 truncate">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-3 border-t border-stone-700/30">
          <div className="space-y-1">
            {customizationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`sidebar-item w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-300 cursor-pointer transform hover:scale-103 hover:translate-x-0.5 ${activeTab === item.id
                  ? "bg-stone-800/50 text-slate-200 font-medium shadow-lg shadow-slate-500/20 border border-stone-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-stone-800/30 hover:shadow-md hover:shadow-slate-500/10"
                  }`}
              >
                <item.icon
                  className={`w-4 h-4 transition-all duration-300 flex-shrink-0 ${activeTab === item.id
                    ? "text-zinc-300"
                    : "group-hover:text-zinc-400"
                    }`}
                />
                <span className="transition-all duration-300 truncate">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 p-4 border-t border-stone-700/30 relative">
        {isLoading ? (
          <div className="flex items-center gap-3 p-3 bg-stone-800/30 rounded-lg border border-stone-700/30">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-800 via-slate-900 to-zinc-950 flex items-center justify-center shadow-lg border border-stone-700/30 flex-shrink-0">
              <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-slate-200 truncate font-medium">
                Loading...
              </div>
              <div className="text-xs text-slate-400">Connecting</div>
            </div>
          </div>
        ) : isAuthenticated ? (
          <>
            <button
              ref={buttonRef}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-full flex items-center gap-3 p-3 bg-stone-800/30 rounded-lg hover:bg-stone-800/50 transition-all duration-300 cursor-pointer border border-stone-700/30 group"
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden shadow-lg shadow-gray-900/40 border border-stone-700/30 flex-shrink-0 group-hover:shadow-emerald-900/20 group-hover:border-stone-600/50 transition-all duration-300">
                {userData?.discord?.avatarUrl ? (
                  <img
                    src={userData.discord.avatarUrl || "/placeholder.svg"}
                    alt="User Avatar"
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-stone-800 via-slate-900 to-zinc-950 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm text-slate-200 truncate font-medium group-hover:text-white transition-colors">
                  {userData?.discord?.displayName ||
                    userData?.discord?.username ||
                    "User"}
                </div>
                <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                  Level {userData?.profile?.athena?.season?.level || 0}
                </div>
              </div>
              <ChevronUp
                className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isProfileOpen ? "rotate-0" : "rotate-180"
                  }`}
              />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    y: 10,
                    scale: 0.95,
                    transition: { duration: 0.2 },
                  }}
                  className="absolute bottom-20 left-4 right-4 bg-gradient-to-b from-stone-800 to-stone-900 rounded-lg shadow-xl border border-stone-700/50 overflow-hidden z-10"
                  style={{
                    boxShadow:
                      "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05) inset",
                  }}
                >
                  <div className="p-4 border-b border-stone-700/50 bg-stone-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-stone-600/50 shadow-lg">
                        {userData?.discord?.avatarUrl ? (
                          <img
                            src={
                              userData.discord.avatarUrl || "/placeholder.svg"
                            }
                            alt="User Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-stone-800 via-slate-900 to-zinc-950 flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-200">
                          {userData?.discord?.displayName ||
                            userData?.discord?.username ||
                            "User"}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Level {userData?.profile?.athena?.season?.level || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-2 text-xs text-slate-400 border-b border-stone-700/50">
                    <div
                      className="pl-4 truncate text-ellipsis overflow-hidden flex items-start gap-2"
                      title={userData?.id ? String(userData.id) : ""}
                    >
                      <Clock className="w-3.5 h-3.5 text--500 mt-0.5" />
                      <span className="text-left">
                        Account ID:{" "}
                        {userData?.id
                          ? String(userData.id).substring(0, 12)
                          : "..."}
                        ...
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 border-b border-stone-700/50">
                    <div className="p-1">
                      <motion.button
                        whileHover={{
                          transition: { duration: 0.2 },
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onTabChange("settings")}
                        className="w-full flex items-center hover:bg-stone-900 gap-2 px-3 py-2.5 text-sm text-stone-400 rounded-md transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-stone-500/30 focus:bg-stone-900/20"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </motion.button>
                    </div>
                  </div>
                  <div className="p-1">
                    <motion.button
                      whileHover={{
                        backgroundColor: "rgba(239, 68, 68, 0.15)",
                        transition: { duration: 0.2 },
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 rounded-md transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-stone-800/20 rounded-lg opacity-50 border border-stone-700/20">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 flex items-center justify-center shadow-lg border border-gray-700/50 flex-shrink-0">
              <User className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-400 truncate">
                Not logged in
              </div>
              <div className="text-xs text-gray-500">Level 0</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
