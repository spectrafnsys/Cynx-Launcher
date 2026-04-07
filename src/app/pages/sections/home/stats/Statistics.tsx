import { motion } from "framer-motion";
import { Wrench } from "lucide-react";

export default function Statistics() {
  return (
    <div className="w-full max-w-sm sm:max-w-md">
      <motion.div
        className="bg-[#101010] rounded-lg h-[200px] border border-zinc-800/50 overflow-hidden relative select-none group"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.01, borderColor: "rgba(156, 163, 175, 0.3)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-black/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        <div className="flex items-center justify-center h-full relative z-10">
          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <Wrench className="w-6 h-6 text-zinc-400" />
            </motion.div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-white mb-1">
                In Development
              </h3>
              <p className="text-xs text-zinc-400">
                This feature is coming soon
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
