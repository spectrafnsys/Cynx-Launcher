"use client";

import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { type IncomingEvent, useSocket } from "../../lib/socket";
import { useGeneralStore } from "../../store/general";
import { Flame, Trophy } from "lucide-react";

interface LeaderboardEntry {
  Username: string;
  Hype: number;
}

export const LeaderboardPage: React.FC = () => {
  const { send, onMessage, isConnected } = useSocket();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [serverLastUpdated, setServerLastUpdated] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNoData, setHasNoData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { setLastLeaderboardUpdate } = useGeneralStore();

  const ITEMS_PER_PAGE = 25;
  const UPDATE_INTERVAL = 10 * 60 * 1000;

  const handleLeaderboardData = useCallback(
    (event: IncomingEvent) => {
      if (
        event.payload &&
        typeof event.payload === "object" &&
        "data" in event.payload
      ) {
        const response = event.payload;
        if (Array.isArray(response.data)) {
          setLeaderboardData(response.data);
          setServerLastUpdated(response.lastUpdated as number);
          setIsLoading(false);
          setError(null);
          setHasNoData(response.data.length === 0);
          setLastLeaderboardUpdate(Date.now());
        } else {
          setError("Invalid leaderboard data received");
          setIsLoading(false);
          setHasNoData(false);
        }
      } else if (event.payload && Array.isArray(event.payload)) {
        setLeaderboardData(event.payload);
        setServerLastUpdated(Date.now());
        setIsLoading(false);
        setError(null);
        setHasNoData(event.payload.length === 0);
        setLastLeaderboardUpdate(Date.now());
      } else {
        setError("Invalid leaderboard data received");
        setIsLoading(false);
        setHasNoData(false);
      }
    },
    [setLastLeaderboardUpdate]
  );

  const handleErrorResponse = useCallback((event: IncomingEvent) => {
    if (event.id && event.id.startsWith("leaderboard_")) {
      const errorMessage = event.message || "Unknown error";

      if (
        errorMessage.toLowerCase().includes("no leaderboard data") ||
        errorMessage.toLowerCase().includes("no stats found")
      ) {
        setLeaderboardData([]);
        setHasNoData(true);
        setError(null);
      } else {
        setError(`Failed to load leaderboard: ${errorMessage}`);
        setHasNoData(false);
      }

      setIsLoading(false);
    }
  }, []);

  const requestLeaderboard = useCallback(async () => {
    if (!isConnected()) {
      setError("Not connected to server");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      setHasNoData(false);
      await send({
        type: "request_leaderboard",
        timestamp: Date.now(),
        id: `leaderboard_${Date.now()}`,
      });
    } catch {
      setError("Failed to request leaderboard data");
      setIsLoading(false);
    }
  }, [send, isConnected]);

  useEffect(() => {
    const cleanupLeaderboard = onMessage("leaderboard", handleLeaderboardData);
    const cleanupError = onMessage("error", handleErrorResponse);

    return () => {
      cleanupLeaderboard();
      cleanupError();
    };
  }, [onMessage, handleLeaderboardData, handleErrorResponse]);

  useEffect(() => {
    if (isConnected()) {
      requestLeaderboard();
      const interval = setInterval(() => {
        if (isConnected()) {
          requestLeaderboard();
        }
      }, UPDATE_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [isConnected, requestLeaderboard, UPDATE_INTERVAL]);

  const displayData = leaderboardData
    .filter(
      (entry) =>
        entry.Username &&
        entry.Username.toLowerCase() !== "unknown" &&
        entry.Username.trim() !== ""
    )
    .map((entry, index) => ({
      id: index + 1,
      username: entry.Username,
      hype: entry.Hype || 0,
    }));

  const totalPages = Math.ceil(displayData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = displayData.slice(startIndex, endIndex);

  const formatHype = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "text-yellow-400";
      case 1:
        return "text-gray-300";
      case 2:
        return "text-amber-700";
      default:
        return "text-stone-400";
    }
  };

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <h3 className="text-xl font-semibold text-stone-300 mb-4">
        No leaderboard data found
      </h3>
      <button
        onClick={requestLeaderboard}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700 disabled:cursor-not-allowed enabled:cursor-pointer text-white rounded-lg transition-colors"
      >
        {isLoading ? "Refreshing..." : "Refresh"}
      </button>
    </motion.div>
  );

  return (
    <div className="p-4">
      <div className="flex flex-col justify-between items-start mb-6 w-full">
        <div className="w-full flex flex-row gap-2 items-center justify-between min-w-[200px]">
          <div className="flex-1 flex-col">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-semibold text-stone-100">
                Leaderboard
              </h2>
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              )}
            </div>
            <p className="text-md font-semibold text-stone-300 mb-2">
              Check out the best players of Pulse.
            </p>
            {serverLastUpdated && (
              <div className="flex items-center gap-4 text-xs">
                <span className="text-stone-500">
                  Last updated:{" "}
                  {new Date(serverLastUpdated).toLocaleTimeString()}
                </span>
                <span className="text-blue-400">Updated every 10 minutes</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 mt-2">
                <p className="text-sm text-red-400">{error}</p>
                <button
                  onClick={requestLeaderboard}
                  className="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
          <div className="flex justify-center items-center text-sm text-neutral-400 mt-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-stone-800/50 rounded-full border border-stone-700">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Hype Score</span>
            </div>
          </div>
        </div>
        <div className="border-b flex-row border-neutral-700 pb-2 w-full" />
      </div>

      {hasNoData && !isLoading && !error ? (
        <EmptyState />
      ) : (
        <>
          <div className="space-y-2">
            {paginatedData.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 + 0.6, duration: 0.4 }}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                className="bg-stone-900 rounded-lg p-2 pl-3 border border-neutral-800 hover:border-neutral-700 transition-all duration-200 hover:shadow-lg hover:shadow-black/10 transform-gpu"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span
                      className={`text-lg font-bold ${getRankColor(
                        startIndex + index
                      )}`}
                    >
                      #{startIndex + index + 1}
                    </span>
                    <span className="text-stone-300 font-bold">
                      {player.username}
                    </span>
                  </div>
                  <div className="flex text-sm text-right max-w-[200px] w-full justify-end">
                    <div className="text-right">
                      <div className="text-sm font-bold text-stone-300">
                        {formatHype(player.hype)}
                      </div>
                      <div className="text-xs text-stone-500 uppercase tracking-wider">
                        hype
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-stone-700 hover:bg-stone-600 disabled:bg-stone-800 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "bg-stone-700 hover:bg-stone-600 text-stone-300"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="text-stone-500 px-1">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-1 bg-stone-700 hover:bg-stone-600 text-stone-300 rounded text-sm transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-stone-700 hover:bg-stone-600 disabled:bg-stone-800 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
              >
                Next
              </button>
              <div className="ml-4 text-sm text-stone-400">
                Page {currentPage} of {totalPages} ({displayData.length}{" "}
                players)
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
