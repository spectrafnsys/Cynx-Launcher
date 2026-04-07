;

import type React from "react";
import { motion } from "framer-motion";

export const LibraryHeader: React.FC = () => {
  return (
    <motion.header
      className="relative mb-2 overflow-hidden py-1 px-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="absolute inset-0 pointer-events-none" />

      <div className="relative z-10">
        <h1 className="text-white text-3xl font-bold mb-1">Library</h1>
        <p className="text-gray-400 text-sm">
          Manage your installed builds and quickly access your builds. Launch,
          configure or remove builds with just a few clicks
        </p>
        <div className="w-full h-px bg-gray-700/50 mt-2" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.header>
  );
};
