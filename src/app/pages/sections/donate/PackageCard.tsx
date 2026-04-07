import { useState } from "react";
import { open } from "@tauri-apps/plugin-shell";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Zap, Star } from "lucide-react";
import { sleep } from "../../../../lib/sleep";
import { Package } from "../../../types/pages";
interface PackageCardProps {
  pkg: Package;
  index: number;
  selectedPackage: string | null;
  onSelect: (id: string) => void;
}

const storeUrls: Record<string, string> = {
    "og-donator": "https://discord.gg/SJ8DrmTS4c",
    "pulse-donator": "https://discord.gg/SJ8DrmTS4c",
    "full-locker": "https://discord.gg/SJ8DrmTS4c",
};

const PackageCard: React.FC<PackageCardProps> = ({
  pkg,
  index,
  selectedPackage,
  onSelect,
}) => {
  const [redirecting, setRedirecting] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handlePurchase = async () => {
    const url = storeUrls[pkg.id];
    if (url) {
      setRedirecting(true);
      await open(url);
      await sleep(500);
      setRedirecting(false);
    } else {
      console.warn("No store URL defined for package:", pkg.id);
    }
  };

  return (
    <motion.div
      className="group relative"
      initial={{ y: 20, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <motion.div
        className={`relative flex items-center p-4 rounded-xl border transition-all duration-300 cursor-pointer ${selectedPackage === pkg.id
          ? "border-stone-500 bg-[#1a1a1a] shadow-lg shadow-stone-900/50"
          : "border-stone-800/50 bg-[#111111] hover:bg-[#151515] hover:border-stone-700"
          }`}
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={() => onSelect(pkg.id)}
      >
        {selectedPackage === pkg.id && (
          <motion.div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden" style={{ willChange: "transform" }}>
            <div className="absolute inset-0 bg-stone-400/5" />
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ scale: 0, rotate: 0 }}
                animate={{
                  scale: [1, 0.5, 1],
                  rotate: [0, 180, 360],
                  x: Math.random() * 200 - 100,
                  y: Math.random() * 100 - 50,
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${30 + Math.random() * 40}%`,
                  top: `${30 + Math.random() * 40}%`,
                }}
              >
                <Sparkles className="w-5 h-5 text-stone-300/40" />
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-stone-900 border border-stone-800 mr-4 shadow-inner">
          <motion.img
            src={pkg.image}
            alt={pkg.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="flex-1 relative">
          <div className="flex items-center gap-2 mb-0.5">
            <motion.h3
              className="font-bold text-white text-base tracking-tight"
              animate={hovered ? { x: 2 } : { x: 0 }}
            >
              {pkg.name}
            </motion.h3>
            {selectedPackage === pkg.id && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{
                  duration: 0.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 2,
                }}
              >
                <Star className="w-4 h-4 text-stone-400 fill-current" />
              </motion.span>
            )}
          </div>
          <motion.p
            className="text-stone-400 text-sm max-w-[280px] leading-snug"
            animate={hovered ? { x: 1 } : { x: 0 }}
          >
            {pkg.description}
          </motion.p>
        </div>

        <div className="flex flex-col items-end gap-2 relative mr-1">
          <motion.p
            className="text-lg font-black text-white"
            animate={hovered ? { scale: 1.05 } : { scale: 1 }}
          >
            {pkg.price}
          </motion.p>

          <motion.button
            className={`relative cursor-pointer px-5 py-2 rounded-lg font-bold text-xs border flex items-center gap-2 transition-all duration-300 disabled:opacity-50 ${selectedPackage === pkg.id
              ? "bg-stone-200 text-black border-white hover:bg-white"
              : "bg-stone-800 text-stone-100 border-stone-700 hover:bg-stone-700 hover:border-stone-600 shadow-lg shadow-black/20"
              }`}
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255,255,255,0.05)" }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              handlePurchase();
            }}
            disabled={redirecting}
          >
            {redirecting ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                Wait...
              </>
            ) : (
              <>
                <Zap className={`w-4 h-4 ${selectedPackage === pkg.id ? "fill-current" : ""}`} />
                Get Now
              </>
            )}
          </motion.button>
        </div>

        {selectedPackage === pkg.id && (
          <motion.div
            className="absolute top-4 right-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <motion.div
              className="relative w-3 h-3 bg-stone-400 rounded-full border border-stone-500"
              animate={{
                boxShadow: [
                  "0 0 8px rgba(120, 113, 108, 0.6)",
                  "0 0 16px rgba(120, 113, 108, 0.8)",
                  "0 0 8px rgba(120, 113, 108, 0.6)",
                ],
              }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              className="absolute inset-0 bg-stone-400 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PackageCard;
