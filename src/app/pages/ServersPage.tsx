"use client";

import {
  Filter,
  Check,
  Users,
  Globe,
  Clock,
  RefreshCw,
  Zap,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { type IncomingEvent, useSocket } from "../../lib/socket";

const playlistNames: Record<string, string> = {
  playlist_defaultsolo: "Solo",
  playlist_defaultduo: "Duos",
  playlist_defaulttrio: "Trios",
  playlist_defaultsquads: "Squads",
  playlist_showdownalt_solo: "Solo Lategame Arena",
  playlist_showdownalt_duo: "Duo Lategame Arena",
  playlist_showdownalt_duos: "Duo Lategame Arena",
  playlist_showdownalt_trio: "Trio Lategame Arena",
  playlist_showdownalt_trios: "Trio Lategame Arena",
  playlist_showdownalt_squad: "Squad Lategame Arena",
  playlist_showdownalt_squads: "Squad Lategame Arena",
  playlist_showdown_solo: "Solo Tournament",
  playlist_showdown_duo: "Duo Tournament",
  playlist_showdown_trio: "Trio Tournament",
  playlist_showdown_squad: "Squad Tournament",
  playlist_showdown_duos: "Duo Tournament",
  playlist_showdown_trios: "Trio Tournament",
  playlist_showdown_squads: "Squad Tournament",
  playlist_defaultsquad: "Squad",
  playlist_trios: "Trios",
  playlist_playgroundv2: "Creative",
  playlist_playground: "Playground",
  playlist_low_solo: "One Shot Solo",
  playlist_low_duos: "One Shot Duos",
  playlist_low_squad: "One Shot Squads",
  playlist_fill_solo: "Floor Is Lava Solo",
  playlist_fill_duos: "Floor Is Lava Duos",
  playlist_fill_squads: "Floor Is Lava Squads",
  playlist_slide_solo: "Slide Solo",
  playlist_slide_duos: "Slide Duos",
  playlist_slide_squad: "Slide Squads",
  playlist_blitz_solo: "Blitz! Solo",
  playlist_blitz_duos: "Blitz! Duos",
  playlist_blitz_squads: "Blitz! Squads",
  playlist_vamp_solo: "Siphon Solo",
  playlist_vamp_duos: "Siphon Duos",
  playlist_vamp_squad: "Siphon Squads",
  playlist_soaring_solo: "Infinite Gliders Solo",
  playlist_soaring_duos: "Infinite Gliders Duos",
  playlist_soaring_squads: "Infinite Gliders Squads",
  playlist_beagles_solo: "Headshots Only Solo",
  playlist_beagles_duo: "Headshots Only Duos",
  playlist_highexplosives_solo: "High Explosives Solo",
  playlist_highexplosives_duos: "High Explosives Duos",
  playlist_highexplosives_squads: "High Explosives Squads",
  playlist_unvaulted_solo: "Unvaulted Solo",
  playlist_unvaulted_duos: "Unvaulted Duos",
  playlist_unvaulted_trios: "Unvaulted Trios",
  playlist_unvaulted_squads: "Unvaulted Squads",
  playlist_solidgold_solo: "Solid Gold Solo",
  playlist_solidgold_duos: "Solid Gold Duos",
  playlist_solidgold_trios: "Solid Gold Trios",
  playlist_solidgold_squads: "Solid Gold Squads",
  playlist_ww_solo: "Wild West Solo",
  playlist_ww_duo: "Wild West Duos",
  playlist_ww_squad: "Wild West Squads",
  playlist_score_solo: "Score Solo",
  playlist_score_duos: "Score Duos",
  playlist_score_squads: "Score Squads",
};

interface Server {
  Players: number;
  SessionId: string;
  Playlist: string;
  CapPlayers: number;
  Started: boolean;
  Region: string;
  Version: string;
}

export interface ServerUpdateNotification {
  action: string;
  sessionId: string;
  timestamp: number;
}

const getFriendlyPlaylistName = (rawPlaylistName: string): string => {
  return playlistNames[rawPlaylistName] || rawPlaylistName;
};

export default function Servers() {
  const { send, onMessage, isConnected } = useSocket();
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isSubscribedToUpdates, setIsSubscribedToUpdates] =
    useState<boolean>(false);
  const [realtimeEnabled, setRealtimeEnabled] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<
    ServerUpdateNotification[]
  >([]);
  const [updatedServers, setUpdatedServers] = useState<Set<string>>(new Set());

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRequestingRef = useRef<boolean>(false);
  const lastUpdateTimestamp = useRef<number>(0);

  useEffect(() => {
    if (updatedServers.size > 0) {
      const timer = setTimeout(() => {
        setUpdatedServers(new Set());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updatedServers]);

  const addNotification = useCallback(
    (action: ServerUpdateNotification["action"], sessionId: string) => {
      const notification: ServerUpdateNotification = {
        action,
        sessionId,
        timestamp: Date.now(),
      };

      setNotifications((prev) => [...prev, notification]);

      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.timestamp !== notification.timestamp)
        );
      }, 5000);
    },
    []
  );

  const normalizeServer = (server: any): Server => ({
    Players: Number(server.Players) || 0,
    SessionId: String(server.SessionId || server.sessionId || ""),
    Playlist: String(server.Playlist || server.playlist || ""),
    CapPlayers: Number(server.CapPlayers || server.capPlayers || 0),
    Started: Boolean(
      server.Started !== undefined ? server.Started : server.started
    ),
    Region: String(server.Region || server.region || ""),
    Version: String(
      server.Version || server.version || server.BuildUniqueId || "Unknown"
    ),
  });

  const handleServersData = useCallback((event: IncomingEvent) => {
    let normalizedServers: Server[] = [];

    if (event.payload && Array.isArray(event.payload)) {
      normalizedServers = event.payload.map(normalizeServer);
    } else if (
      event.payload &&
      typeof event.payload === "object" &&
      "data" in event.payload &&
      Array.isArray(event.payload.data)
    ) {
      normalizedServers = event.payload.data.map(normalizeServer);
    } else {
      setError("Invalid server data received");
      setIsLoading(false);
      setIsRefreshing(false);
      isRequestingRef.current = false;
      return;
    }

    setServers(normalizedServers);
    setIsLoading(false);
    setIsRefreshing(false);
    setError(null);
    setLastUpdated(new Date());
    isRequestingRef.current = false;
    lastUpdateTimestamp.current = Date.now();
  }, []);

  const handleServerUpdate = useCallback(
    (event: IncomingEvent) => {
      const updateTime = event.timestamp || Date.now();
      if (updateTime < lastUpdateTimestamp.current - 5000) {
        return;
      }

      let updatedServers: Server[] = [];

      if (event.payload && Array.isArray(event.payload)) {
        updatedServers = event.payload.map(normalizeServer);
      } else if (
        event.payload &&
        typeof event.payload === "object" &&
        "data" in event.payload &&
        Array.isArray(event.payload.data)
      ) {
        updatedServers = event.payload.data.map(normalizeServer);
      } else {
        return;
      }

      setServers(updatedServers);
      setLastUpdated(new Date());
      lastUpdateTimestamp.current = Date.now();

      if (event.sessionId) {
        setUpdatedServers((prev) => new Set([...prev, event.sessionId!]));
        addNotification(event.action || "updated", event.sessionId);
      } else if (event.action === "bulk_update") {
        const allSessionIds = updatedServers.map((s) => s.SessionId);
        setUpdatedServers(new Set(allSessionIds));
      }
    },
    [addNotification]
  );

  const handleSubscriptionResponse = useCallback((event: IncomingEvent) => {
    if (
      event.payload &&
      typeof event.payload === "object" &&
      "subscribed" in event.payload
    ) {
      const subscribed = event.payload.subscribed as boolean;
      setIsSubscribedToUpdates(subscribed);

      if (subscribed && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, []);

  const handleErrorResponse = useCallback((event: IncomingEvent) => {
    if (event.id && event.id.startsWith("servers_")) {
      const errorMessage = event.message || "Unknown error";
      setError(`Failed to load servers: ${errorMessage}`);
      setIsLoading(false);
      setIsRefreshing(false);
      isRequestingRef.current = false;
    }
  }, []);

  const subscribeToUpdates = useCallback(async () => {
    if (!isConnected() || !realtimeEnabled) return;

    try {
      await send({
        type: "subscribe_servers",
        timestamp: Date.now(),
        id: `subscribe_${Date.now()}`,
      });
    } catch { }
  }, [send, isConnected, realtimeEnabled]);

  const unsubscribeFromUpdates = useCallback(async () => {
    if (!isConnected()) return;

    try {
      await send({
        type: "unsubscribe_servers",
        timestamp: Date.now(),
        id: `unsubscribe_${Date.now()}`,
      });
      setIsSubscribedToUpdates(false);
    } catch { }
  }, [send, isConnected]);

  const requestServers = useCallback(
    async (silent = false) => {
      if (isRequestingRef.current || !isConnected()) {
        if (!isConnected()) setError("Not connected to server");
        return;
      }

      if (isSubscribedToUpdates && silent) return;

      try {
        isRequestingRef.current = true;

        if (!silent) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }

        setError(null);

        const requestId = `servers_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        await send({
          type: "request_servers",
          timestamp: Date.now(),
          id: requestId,
        });

        setTimeout(() => {
          if (isRequestingRef.current) {
            isRequestingRef.current = false;
            setIsRefreshing(false);
            if (!silent) setIsLoading(false);
          }
        }, 10000);
      } catch {
        setError("Failed to request server data");
        isRequestingRef.current = false;
        setIsRefreshing(false);
        if (!silent) setIsLoading(false);
      }
    },
    [send, isConnected, isSubscribedToUpdates]
  );

  const manualRefresh = useCallback(() => {
    requestServers(false);
  }, [requestServers]);

  useEffect(() => {
    const cleanupServers = onMessage("servers", handleServersData);
    const cleanupServerUpdate = onMessage("servers_update", handleServerUpdate);
    const cleanupSubscribed = onMessage(
      "servers_subscribed",
      handleSubscriptionResponse
    );
    const cleanupUnsubscribed = onMessage(
      "servers_unsubscribed",
      handleSubscriptionResponse
    );
    const cleanupError = onMessage("error", handleErrorResponse);

    return () => {
      cleanupServers();
      cleanupServerUpdate();
      cleanupSubscribed();
      cleanupUnsubscribed();
      cleanupError();
    };
  }, [
    onMessage,
    handleServersData,
    handleServerUpdate,
    handleSubscriptionResponse,
    handleErrorResponse,
  ]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isConnected()) {
      requestServers();

      if (realtimeEnabled) {
        subscribeToUpdates();
      } else {
        intervalRef.current = setInterval(() => {
          if (isConnected() && !isRequestingRef.current) {
            requestServers(true);
          }
        }, 15000);
      }
    } else {
      setError("Not connected to server");
      setIsSubscribedToUpdates(false);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isConnected, realtimeEnabled]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const regions: string[] = Array.from(
    new Set(servers.map((server) => server.Region))
  );
  const statuses: string[] = ["Waiting", "In Game"];

  const filteredServers: Server[] = servers.filter((server) => {
    const matchesRegion =
      selectedRegions.length === 0 || selectedRegions.includes(server.Region);
    const matchesStatus =
      selectedStatuses.length === 0 ||
      (selectedStatuses.includes("Waiting") && !server.Started) ||
      (selectedStatuses.includes("In Game") && server.Started);

    return matchesRegion && matchesStatus;
  });

  const hasActiveFilters: boolean =
    selectedRegions.length > 0 || selectedStatuses.length > 0;

  const clearFilters = (): void => {
    setSelectedRegions([]);
    setSelectedStatuses([]);
  };

  const toggleRegion = (region: string): void => {
    setSelectedRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region]
    );
  };

  const toggleStatus = (status: string): void => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const formatLastUpdated = (date: Date | null): string => {
    if (!date) return "Never";
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 10) return "Just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  const getNotificationIcon = (action: string) => {
    switch (action) {
      case "created":
        return "🆕";
      case "updated":
        return "🔄";
      case "deleted":
        return "❌";
      default:
        return "📡";
    }
  };

  const getNotificationMessage = (action: string, sessionId: string) => {
    const shortId = sessionId.substring(0, 8);
    switch (action) {
      case "created":
        return `New server available (${shortId})`;
      case "updated":
        return `Server updated (${shortId})`;
      case "deleted":
        return `Server closed (${shortId})`;
      default:
        return `Server activity (${shortId})`;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#101010] min-h-screen flex items-center justify-center select-none">
        <div className="flex flex-col items-center space-y-4 animate-fade-in">
          <div className="relative">
            <div className="w-12 h-12 border-3 border-[#333] rounded-full animate-spin border-t-white opacity-75"></div>
            <div className="absolute inset-0 w-12 h-12 border-2 border-white rounded-full opacity-20"></div>
          </div>
          <div className="text-white font-medium">Loading servers...</div>
        </div>
      </div>
    );
  }

  if (error && !isConnected()) {
    return (
      <div className="bg-[#101010] min-h-screen flex items-center justify-center select-none">
        <div className="flex flex-col items-center space-y-4 animate-fade-in text-center">
          <div className="text-red-400 font-medium">Connection Error</div>
          <div className="text-gray-400 text-sm max-w-md">
            Unable to connect to the server. Please check your connection and
            try again.
          </div>
          <button
            onClick={manualRefresh}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#101010] min-h-screen select-none">
      <style>{`
        .animate-slide-in-up {
          animation: slideInUp 0.5s ease-out;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scaleIn 0.2s ease-out;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }

        .server-card {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .server-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .server-card.updated {
          border-color: #10b981 !important;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.3) !important;
        }

        .filter-checkbox {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .filter-checkbox:hover {
          transform: scale(1.05);
        }

        .progress-bar {
          background: linear-gradient(90deg, #ffffff 0%, #e5e5e5 100%);
          transition: width 0.3s ease-out;
        }

        .refresh-button {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .refresh-button:hover {
          transform: scale(1.05);
        }

        .refresh-button:active {
          transform: scale(0.95);
        }

        .notification {
          transition: all 0.3s ease-out;
        }

        .notification:hover {
          transform: translateX(-5px);
        }

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.timestamp}
            className="bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 shadow-lg notification animate-slide-in-right"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">
                {getNotificationIcon(notification.action)}
              </span>
              <div className="text-sm text-white">
                {getNotificationMessage(
                  notification.action,
                  notification.sessionId
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="p-6 pb-0 animate-slide-in-up">
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col mb-1">
              <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text">
                Servers
              </h1>
              <p className="text-md font-semibold text-stone-400 flex items-center gap-2">
                Check out the latest games on{" "}
                <b className="text-white">Pulse.</b>
              </p>
              <div className="flex items-center gap-4 mt-2">
                <div className="text-xs text-gray-400">
                  Last updated: {formatLastUpdated(lastUpdated)}
                </div>
                {error && (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-red-400">{error}</p>
                    <button
                      onClick={manualRefresh}
                      className="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={manualRefresh}
                disabled={isRefreshing}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer shadow-lg refresh-button ${isRefreshing
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                title="Refresh servers"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span className="font-medium">
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </span>
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer shadow-lg hover:scale-105 active:scale-95 ${hasActiveFilters
                  ? "bg-white text-black shadow-white/20"
                  : "bg-[#1a1a1a] text-white hover:bg-[#1f1f1f] border border-[#333] hover:border-[#444]"
                  }`}
              >
                <Filter className="h-4 w-4" />
                <span className="font-medium">Filters</span>
                {hasActiveFilters && (
                  <span className="bg-black text-white text-xs px-2 py-1 rounded-full">
                    {selectedRegions.length + selectedStatuses.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${showFilters ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            <div className="bg-[#1a1a1a] rounded-xl p-6 mb-6 border border-[#333] shadow-xl animate-scale-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Regions
                  </h3>
                  <div className="space-y-3">
                    {regions.map((region, index) => (
                      <label
                        key={region}
                        className="flex items-center space-x-3 cursor-pointer group animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div
                          onClick={() => toggleRegion(region)}
                          className={`w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center filter-checkbox ${selectedRegions.includes(region)
                            ? "bg-white border-white shadow-lg"
                            : "border-gray-500 group-hover:border-gray-300 hover:bg-gray-800"
                            }`}
                        >
                          {selectedRegions.includes(region) && (
                            <Check className="h-3 w-3 text-black" />
                          )}
                        </div>
                        <span className="text-gray-300 group-hover:text-white transition-colors font-medium">
                          {region}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Status
                  </h3>
                  <div className="space-y-3">
                    {statuses.map((status, index) => (
                      <label
                        key={status}
                        className="flex items-center space-x-3 cursor-pointer group animate-fade-in"
                        style={{
                          animationDelay: `${(index + regions.length) * 100}ms`,
                        }}
                      >
                        <div
                          onClick={() => toggleStatus(status)}
                          className={`w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center filter-checkbox ${selectedStatuses.includes(status)
                            ? "bg-white border-white shadow-lg"
                            : "border-gray-500 group-hover:border-gray-300 hover:bg-gray-800"
                            }`}
                        >
                          {selectedStatuses.includes(status) && (
                            <Check className="h-3 w-3 text-black" />
                          )}
                        </div>
                        <span className="text-gray-300 group-hover:text-white transition-colors font-medium flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${status === "Waiting"
                              ? "bg-yellow-400"
                              : "bg-green-400"
                              }`}
                          />
                          {status}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <div
                  className="mt-6 pt-6 border-t border-[#333] animate-fade-in"
                  style={{ animationDelay: "300ms" }}
                >
                  <button
                    onClick={clearFilters}
                    className="text-gray-400 hover:text-white transition-colors font-medium cursor-pointer px-4 py-2 rounded-lg hover:bg-[#333] transition-all duration-200"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          {filteredServers.length === 0 ? (
            <div className="text-gray-400 text-center py-16 animate-fade-in">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <div className="text-lg font-medium">
                {servers.length === 0
                  ? "No servers available"
                  : "No servers match your filters"}
              </div>
              {servers.length === 0 && (
                <button
                  onClick={manualRefresh}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Refresh Servers
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredServers.map((server, index) => {
                const percentage = (server.Players / server.CapPlayers) * 100;
                const isUpdated = updatedServers.has(server.SessionId);
                return (
                  <div
                    key={`${server.SessionId}-${server.Players}-${server.Started}`}
                    className={`bg-[#1a1a1a] p-6 rounded-xl hover:bg-[#1f1f1f] transition-all duration-200 cursor-pointer border border-transparent hover:border-[#333] server-card shadow-lg animate-slide-in-up ${isUpdated ? "updated" : ""
                      }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="text-white font-bold mb-2 text-xl flex items-center gap-3">
                          {getFriendlyPlaylistName(server.Playlist)}
                          {isUpdated && (
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse-glow">
                              Updated
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400 space-y-2">
                          <div className="flex items-center gap-2">
                            <Globe className="h-3 w-3" />
                            {server.Region} •{" "}
                            {server.Started ? "INGAME" : "LOADING"}
                          </div>
                          <div className="font-mono text-xs text-gray-500 bg-[#0a0a0a] px-2 py-1 rounded">
                            {server.SessionId} || {server.Version}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-mono text-2xl font-bold flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {server.Players}
                          <span className="text-gray-500 text-lg">
                            /{server.CapPlayers}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-[#0a0a0a] h-1 rounded-full overflow-hidden">
                      <div
                        className="h-full progress-bar rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
