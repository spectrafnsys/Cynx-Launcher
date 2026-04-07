import type React from "react";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../../../../../lib/socket";

interface Classes {
  className: string;
}

type ShopEntry = {
  id: string;
  price: number;
  section?: string;
};

type CosmeticData = {
  status: number;
  data: {
    id: string;
    name: string;
    description: string;
    type: { displayValue: string };
    rarity: { value: string; displayValue: string };
    images: { icon: string };
  };
};

type ShopItem = Omit<ShopEntry, "id"> &
  CosmeticData["data"] & {
    price: number;
    section?: string;
  };

type StorefrontPayload = {
  Daily: { Id: string; Price: number }[];
  Featured: { Id: string; Price: number }[];
};

const cleanDescription = (description: string): string => {
  const reactiveIndex = description.toLowerCase().indexOf("reactive:");
  return reactiveIndex !== -1
    ? description.substring(0, reactiveIndex).trim()
    : description;
};

const CACHE_KEY = "ihatelife";
const CACHE_EXPIRY = 5 * 60 * 1000;

const SimpleShop: React.FC<Classes> = ({ className }) => {
  const [items, setItems] = useState<ShopItem[]>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            return data;
          }
        } catch (e) {
          console.warn("Failed to parse cache", e);
        }
      }
    }
    return [];
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(items.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [dataRequested, setDataRequested] = useState(false);

  const { send, onMessage, state } = useSocket();
  const isConnected = state === "connected";
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const currentItem = useMemo(
    () => items[currentIndex] || null,
    [items, currentIndex]
  );

  const fetchCosmeticDetails = useCallback(
    async (entry: { Id: string; Price: number; section?: string }) => {
      try {
        const id = entry.Id.split(":")[1];
        const response = await fetch(
          `https://fortnite-api.com/v2/cosmetics/br/${id}`
        );

        if (!response.ok) throw new Error(`API response: ${response.status}`);

        const res: CosmeticData = await response.json();
        return {
          ...res.data,
          price: entry.Price,
          section: entry.section,
        } as ShopItem;
      } catch (err) {
        console.error(`Failed to fetch cosmetic data for ${entry.Id}:`, err);
        return null;
      }
    },
    []
  );

  const handleStorefrontData = useCallback(
    async (payload: StorefrontPayload) => {
      if (!mountedRef.current) return;

      try {
        if (!payload) {
          setError("No storefront data received");
          setIsLoading(false);
          return;
        }

        const { Daily = [], Featured = [] } = payload;
        const allItems = [
          ...Featured.map((item) => ({ ...item, section: "Featured" })),
          ...Daily.map((item) => ({ ...item, section: "Daily" })),
        ].slice(0, 6);

        if (allItems.length === 0) {
          setError("No shop items available");
          setIsLoading(false);
          return;
        }

        const detailedItems = (
          await Promise.all(allItems.map(fetchCosmeticDetails))
        ).filter(Boolean) as ShopItem[];

        if (!mountedRef.current) return;

        if (detailedItems.length > 0) {
          setItems(detailedItems);
          setIsLoading(false);
          setError(null);

          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({
                data: detailedItems,
                timestamp: Date.now(),
              })
            );
          } catch (e) {
            console.warn("Failed to cache shop data:", e);
          }
        } else {
          setError("No valid shop items found");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to process storefront data:", err);
        if (mountedRef.current) {
          setError("Failed to process shop items");
          setIsLoading(false);
        }
      }
    },
    [fetchCosmeticDetails]
  );

  const requestShopData = useCallback(async () => {
    if (!isConnected || dataRequested) return;

    try {
      setDataRequested(true);
      await send({
        type: "request_storefront",
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error("Failed to request shop data:", err);
      setDataRequested(false);
      if (mountedRef.current) {
        setError("Failed to request shop data");
        setIsLoading(false);
      }
    }
  }, [isConnected, dataRequested, send]);

  useEffect(() => {
    const unsubscribe = onMessage("storefront", (event) => {
      if (event.payload) {
        handleStorefrontData(event.payload as StorefrontPayload);
      }
    });

    return unsubscribe;
  }, [onMessage, handleStorefrontData]);

  useEffect(() => {
    if (isConnected && items.length === 0 && !dataRequested) {
      setIsLoading(true);
      setError(null);
      requestShopData();
    }
  }, [isConnected, items.length, dataRequested, requestShopData]);

  useEffect(() => {
    if (items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [items.length]);

  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setDataRequested(false);
      if (mountedRef.current) {
        send({
          type: "request_storefront",
          timestamp: Date.now(),
        }).catch((err) => {
          console.error("Periodic shop refresh failed:", err);
        });
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [isConnected, send]);

  if (error) {
    return (
      <div className={`${className} w-full max-w-sm sm:max-w-md lg:max-w-lg`}>
        <motion.div
          className="bg-[#101010] rounded-xl h-[200px] border border-red-800/50 overflow-hidden relative group select-none flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center p-4">
            <div className="text-red-400 text-sm font-medium mb-2">
              {isConnected ? "Loading Error" : "Connecting..."}
            </div>
            <div className="text-gray-400 text-xs">{error}</div>
            <div className="text-gray-500 text-xs mt-2">Status: {state}</div>
            {isConnected && (
              <button
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  setDataRequested(false);
                  requestShopData();
                }}
                className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded cursor-pointer transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${className} w-full max-w-sm sm:max-w-md lg:max-w-lg`}>
        <motion.div
          className="bg-[#101010] rounded-xl h-[200px] border border-gray-800/50 overflow-hidden relative group select-none"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-black/20" />

          <div className="p-3 border-b border-gray-800/50 bg-gradient-to-r from-black/20 to-transparent">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm font-semibold tracking-wider">
                ITEM SHOP
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500 animate-pulse" : "bg-yellow-500"
                  }`}
                />
                <span className="text-xs text-gray-400">
                  {isConnected ? "Connected" : "Connecting..."}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 flex items-center justify-center h-full">
            <div className="text-center">
              <motion.div
                className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full mx-auto mb-3"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <div className="text-white text-sm font-medium mb-1">
                Loading Shop...
              </div>
              <div className="text-gray-400 text-xs">
                {isConnected
                  ? "Fetching latest items"
                  : "Waiting for connection"}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentItem) return null;

  return (
    <div className={`${className} w-full max-w-sm sm:max-w-md lg:max-w-lg`}>
      <motion.div
        className="bg-[#101010] rounded-xl h-[200px] border border-gray-800/50 overflow-hidden relative group select-none"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-black/20" />

        <div className="p-3 border-b border-gray-800/50 bg-gradient-to-r from-black/20 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-white text-sm font-semibold tracking-wider">
              ITEM SHOP
            </span>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {items.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full ${
                      index === currentIndex ? "bg-white" : "bg-gray-600"
                    }`}
                    animate={{
                      scale: index === currentIndex ? 1.3 : 1,
                      opacity: index === currentIndex ? 1 : 0.6,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            className="p-3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="flex gap-3">
              <motion.div
                className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={currentItem.images?.icon || "/icon.png"}
                  alt={currentItem.name}
                  className="w-full h-full object-contain z-10 drop-shadow-lg"
                  draggable={false}
                  loading="lazy"
                />
              </motion.div>

              <div className="flex-1">
                <h3 className="text-white font-bold text-base sm:text-lg mb-1 tracking-tight line-clamp-1">
                  {currentItem.name}
                </h3>
                <p className="text-gray-300 text-xs mb-2 line-clamp-2 leading-tight">
                  {cleanDescription(currentItem.description)}
                </p>

                <div className="flex gap-1.5 flex-wrap mb-3">
                  <span className="bg-stone-800/60 border border-neutral-700/50 rounded-md px-2 py-0.5 text-xs text-gray-300 font-medium">
                    {currentItem.type?.displayValue || "Unknown"}
                  </span>
                  <span className="bg-stone-800/60 border border-neutral-700/50 rounded-md px-2 py-0.5 text-xs text-gray-300 font-medium">
                    {currentItem.section}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-stone-900/60 rounded-lg px-3 py-2 border border-neutral-800/50">
                  <img
                    src="https://image.fnbr.co/price/icon_vbucks_50x.png"
                    alt="V-bucks"
                    className="w-4 h-4"
                    draggable={false}
                    loading="lazy"
                  />
                  <span className="text-white text-sm font-bold">
                    {currentItem.price?.toLocaleString() || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SimpleShop;
