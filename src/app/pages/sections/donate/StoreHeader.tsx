;

import type React from "react";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

type StoreHeaderProps = {};

const StoreHeader: React.FC<StoreHeaderProps> = () => (
  <div className="relative overflow-hidden rounded-2xl bg-[#0a0a0a] border border-stone-800/50 mb-8">
    <div className="absolute inset-0 bg-gradient-to-br from-stone-800/10 via-transparent to-transparent pointer-events-none" />
    <div className="p-10 text-center">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-3 mb-5">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1.1, 1] }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="w-7 h-7 text-stone-400" />
          </motion.div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Pulse Store
          </h1>
        </div>
        <p className="text-stone-300 text-base max-w-2xl mx-auto leading-relaxed">
          Support Pulse's development and help us grow. Every contribution
          directly funds our infrastructure and brings new features to the community.
        </p>
      </motion.div>
    </div>
  </div>
);

export default StoreHeader;
