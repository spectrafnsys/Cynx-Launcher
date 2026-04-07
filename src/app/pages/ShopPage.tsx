import { useEffect, useState, useCallback } from "react";
import { useSocket } from "../../lib/socket";

interface ShopItem {
  id: string;
  price: number;
}

interface ItemDetails {
  name: string;
  rarity: { value: string };
  type: { value: string };
  description?: string;
  series?: { value: string };
}

interface ShopData {
  daily: ShopItem[];
  featured: ShopItem[];
}

type StorefrontPayload = {
  Daily: { Id: string; Price: number }[];
  Featured: { Id: string; Price: number }[];
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

export function ShopView() {
  const [data, setData] = useState<ShopData>({ daily: [], featured: [] });
  const [itemDetails, setItemDetails] = useState<{
    [key: string]: ItemDetails;
  }>({});
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const { send, onMessage, state } = useSocket();

  const fetchShopData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const unsubscribe = onMessage("storefront", async (event) => {
        try {
          const payload = event.payload as StorefrontPayload;
          if (!payload) {
            return;
          }

          const { Daily, Featured } = payload;

          const dailyItems = (Daily || []).map((item) => ({
            id: item.Id,
            price: item.Price,
          }));
          const featuredItems = (Featured || []).map((item) => ({
            id: item.Id,
            price: item.Price,
          }));

          setData({ daily: dailyItems, featured: featuredItems });
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error("Failed to handle storefront data:", err);
          setError("Failed to load shop items");
          setLoading(false);
        }
      });

      await send({
        type: "request_storefront",
        timestamp: Date.now(),
      });

      return unsubscribe;
    } catch (err) {
      console.error("Failed to fetch shop data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load shop service"
      );
      setLoading(false);
      throw err;
    }
  }, [send, onMessage]);

  const fetchItemDetails = useCallback(
    async (itemId: string) => {
      const id = itemId.split(":")[1];
      if (itemDetails[id] && itemDetails[id].name !== "Unknown Item") return;

      try {
        const response = await fetch(
          `https://fortnite-api.com/v2/cosmetics/br/${id}`,
          { signal: AbortSignal.timeout(5000) }
        );
        const itemData: CosmeticData = await response.json();
        setItemDetails((prev) => ({
          ...prev,
          [id]: {
            name: itemData.data.name,
            rarity: { value: itemData.data.rarity.value },
            type: { value: itemData.data.type.displayValue },
            description: itemData.data.description,
          },
        }));
      } catch (error) {
        console.error(`Error fetching details for ${id}:`, error);
        setItemDetails((prev) => ({
          ...prev,
          [id]: {
            name: "Unknown Item",
            rarity: { value: "unknown" },
            type: { value: "outfit" },
          },
        }));
      }
    },
    [itemDetails]
  );

  useEffect(() => {
    if (state === "connected") {
      fetchShopData().catch(() => { });
    }
  }, [state, fetchShopData]);

  useEffect(() => {
    if (error && state === "connected") {
      const timer = setTimeout(() => {
        setRetryCount((prev) => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, state]);

  useEffect(() => {
    if (retryCount > 0) {
      fetchShopData().catch(() => { });
    }
  }, [retryCount, fetchShopData]);

  useEffect(() => {
    if (state !== "connected") return;

    const refreshInterval = setInterval(async () => {
      try {
        await send({
          type: "request_storefront",
          timestamp: Date.now(),
        });
      } catch (err) {
        console.error("Failed to refresh shop data:", err);
      }
    }, 300000);

    return () => clearInterval(refreshInterval);
  }, [state, send]);

  useEffect(() => {
    const allItems = [...(data.featured || []), ...(data.daily || [])];
    allItems.forEach((item) => {
      const id = item.id.split(":")[1];
      if (!itemDetails[id] || itemDetails[id].name === "Unknown Item") {
        fetchItemDetails(item.id);
      }
    });
  }, [data, fetchItemDetails, itemDetails]);

  const handleImageError = useCallback((id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  }, []);

  const getRarityConfig = useCallback((rarity: string) => {
    const rarityConfigs: {
      [key: string]: {
        borderColor: string;
        shadowColor: string;
        glowColor: string;
      };
    } = {
      common: {
        borderColor: "#64748b",
        shadowColor: "rgba(100, 116, 139, 0.4)",
        glowColor: "rgba(100, 116, 139, 0.6)",
      },
      uncommon: {
        borderColor: "#10B981",
        shadowColor: "rgba(16, 185, 129, 0.5)",
        glowColor: "rgba(16, 185, 129, 0.8)",
      },
      rare: {
        borderColor: "#3B82F6",
        shadowColor: "rgba(59, 130, 246, 0.5)",
        glowColor: "rgba(59, 130, 246, 0.8)",
      },
      epic: {
        borderColor: "#8B5CF6",
        shadowColor: "rgba(139, 92, 246, 0.6)",
        glowColor: "rgba(139, 92, 246, 0.9)",
      },
      legendary: {
        borderColor: "#F59E0B",
        shadowColor: "rgba(245, 158, 11, 0.7)",
        glowColor: "rgba(245, 158, 11, 1)",
      },
      "icon series": {
        borderColor: "#06B6D4",
        shadowColor: "rgba(6, 182, 212, 0.6)",
        glowColor: "rgba(6, 182, 212, 0.9)",
      },
      "gaming legends": {
        borderColor: "#EC4899",
        shadowColor: "rgba(236, 72, 153, 0.6)",
        glowColor: "rgba(236, 72, 153, 0.9)",
      },
    };
    return rarityConfigs[rarity?.toLowerCase()] || rarityConfigs.common;
  }, []);

  const getItemType = useCallback((type: string) => {
    const typeMap: { [key: string]: string } = {
      outfit: "Outfit",
      backpack: "Back Bling",
      pickaxe: "Pickaxe",
      glider: "Glider",
      wrap: "Wrap",
      emote: "Emote",
      dance: "Emote",
      expression: "Emote",
      music: "Music",
      loading: "Loading Screen",
      spray: "Spray",
      banner: "Banner",
      toy: "Toy",
      pet: "Pet",
      contrail: "Contrail",
      bundle: "Bundle",
    };
    return typeMap[type?.toLowerCase()] || type;
  }, []);

  const renderShopItem = useCallback(
    (item: ShopItem, index: number, isDaily: boolean = false) => {
      const id = item.id.split(":")[1];
      const details = itemDetails[id];

      if (!details || imageErrors[id]) return null;

      const icon = `https://fortnite-api.com/images/cosmetics/br/${id}/icon.png`;
      const price = item.price ?? 0;
      const rarity = details.rarity?.value || "common";
      const rarityConfig = getRarityConfig(rarity);
      const itemType = getItemType(details.type?.value || "");

      return (
        <div
          key={item.id}
          className="relative group cursor-pointer"
          style={{
            width: "100%",
            animation: `fadeInUp ${0.4 + index * 0.08}s ease-out`,
          }}
        >
          <div
            className="bg-stone-900 border-2 border-neutral-800 rounded-lg shadow-lg h-full relative transition-all duration-200 hover:border-opacity-100 hover:shadow-2xl hover:-translate-y-1"
            style={{
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = rarityConfig.borderColor;
              e.currentTarget.style.boxShadow = `0 12px 32px ${rarityConfig.shadowColor}, 0 0 0 1px ${rarityConfig.borderColor}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#262626";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.3)";
            }}
          >
            <div
              className={`relative ${isDaily ? "h-[140px]" : "h-35"
                } bg-gradient-to-b from-stone-800/20 to-stone-900/40 rounded-t-lg`}
            >
              <div className="flex relative items-center justify-center h-full w-full transition-transform duration-200">
                <img
                  src={icon}
                  alt={details.name}
                  className="max-w-full relative max-h-full object-cover"
                  onError={() => handleImageError(id)}
                />
              </div>
            </div>
            <div className="p-3 bg-neutral-900 relative border-t-2 rounded-b-lg border-neutral-800">
              <h3 className="font-semibold text-neutral-100 relative text-sm mb-1 truncate">
                {details.name}
              </h3>
              <div className="flex relative items-center justify-between gap-2 mb-2">
                <span className="text-neutral-400 relative text-xs uppercase font-medium">
                  {itemType}
                </span>
                <span
                  className="text-xs relative font-bold px-2 py-1 rounded max-w-[100px] truncate"
                  title={rarity.toUpperCase()}
                  style={{
                    color: rarityConfig.borderColor,
                    backgroundColor: rarityConfig.shadowColor,
                    display: "inline-block",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {rarity.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center relative justify-start gap-1 mt-2">
                <img
                  src="https://image.fnbr.co/price/icon_vbucks_50x.png"
                  height={16}
                  width={16}
                  className="h-4 w-4"
                  alt="vbucks"
                />
                <span className="font-bold text-sm text-neutral-100">
                  {price === 0 ? "FREE" : price.toLocaleString()}
                </span>
              </div>
            </div>

            <div
              className="absolute inset-0 pointer-events-none rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-200"
              style={{
                background: `linear-gradient(135deg, ${rarityConfig.shadowColor} 0%, transparent 50%, ${rarityConfig.shadowColor} 100%)`,
              }}
            />
          </div>
        </div>
      );
    },
    [itemDetails, imageErrors, getRarityConfig, getItemType, handleImageError]
  );

  const validFeatured = (data.featured || []).filter(
    (item) =>
      itemDetails[item.id.split(":")[1]] && !imageErrors[item.id.split(":")[1]]
  );

  const validDaily = (data.daily || []).filter(
    (item) =>
      itemDetails[item.id.split(":")[1]] && !imageErrors[item.id.split(":")[1]]
  );

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-400 mx-auto mb-4"></div>
          <p className="text-neutral-300">Loading shop data...</p>
          <p className="text-neutral-500 text-sm mt-2">
            Status: {state}
            {state === "connecting" && (
              <span className="ml-2">Connecting...</span>
            )}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg font-medium mb-2">
            {state === "connected" ? "Loading Error" : "Connection Error"}
          </div>
          <div className="text-neutral-400 text-sm mb-2">{error}</div>
          <div className="text-neutral-500 text-xs">
            Status: {state}
            {state === "connected" && <span className="ml-2">Retrying...</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 md:p-6 text-neutral-100 overflow-auto">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.4);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.6);
        }
      `}</style>

      <div className="h-full flex flex-col gap-4 relative">
        <div>
          <h2 className="text-3xl text-white font-bold uppercase tracking-wide">
            ITEM SHOP
          </h2>
          <p>
            View the cosmetics inside of the item shop without having to launch
            Pulse.
          </p>
          <div className="border-2 border-stone-900 w-full rounded-full mt-2" />
        </div>
        {validFeatured.length > 0 && (
          <div className="flex-1 relative">
            <div className="flex items-center gap-3 mb-4 relative">
              <div
                className="w-1 h-8 rounded-full shadow-lg"
                style={{
                  background: "linear-gradient(to bottom, #1e2e1e, #1a2a1a)",
                }}
              />
              <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-neutral-100">
                Featured
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-2">
              {validFeatured.map((item, index) => renderShopItem(item, index))}
            </div>
          </div>
        )}

        {validDaily.length > 0 && (
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-1 h-8 rounded-full shadow-lg"
                style={{
                  background: "linear-gradient(to bottom, #1e1e1e, #1a1a1a)",
                }}
              />
              <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-neutral-100">
                Daily
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-2 px-1 pb-4">
              {validDaily.map((item, index) =>
                renderShopItem(item, index, true)
              )}
            </div>
          </div>
        )}

        {validFeatured.length === 0 && validDaily.length === 0 && !loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-neutral-400 text-lg">No items available</p>
              <p className="text-neutral-500 text-sm mt-2">
                The shop might be updating or there was an error loading items.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
