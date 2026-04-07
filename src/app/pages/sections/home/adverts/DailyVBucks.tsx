;

import type React from "react";
import { motion } from "framer-motion";

const DailyVBucksAdvert: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative h-[257px] bg-gradient-to-r from-pulse-purple via-pulse-purple to-pulse-purple/80 border border-pulse-purple/30 rounded-2xl overflow-hidden shadow-xl w-full flex flex-col md:flex-row items-center"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.1)_0%,transparent_100%)] animate-[pulsebg_8s_linear_infinite] z-0" />

      <div className="relative z-10 md:w-1/2 w-full h-full overflow-hidden flex items-center justify-center bg-black/10">
        <img
          src="/vbucks.png"
          alt="V-Bucks"
          className="object-contain h-32 md:h-40 drop-shadow-lg"
        />
      </div>

      <div className="relative z-10 md:w-1/2 w-full px-4 md:px-6 flex flex-col justify-center text-center md:text-left gap-2">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-md">
          DAILY V-BUCKS
        </h2>
        <p className="text-white/90 text-sm md:text-lg font-medium">
          Claim your free V-Bucks today before time runs out!
        </p>
        <button className="cursor-pointer mt-2 md:mt-4 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white font-semibold py-2 px-4 md:px-6 rounded-xl border border-white/30 backdrop-blur-md transition-all duration-200 shadow-lg text-sm md:text-base">
          CLAIM NOW
        </button>
      </div>
    </motion.div>
  );
};

export default DailyVBucksAdvert;
