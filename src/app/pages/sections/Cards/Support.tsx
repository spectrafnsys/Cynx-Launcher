import React from "react";
import { HelpingHand } from "lucide-react";

const SupportPulseCard: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-pulse-purple/90 via-pulse-purple to-pulse-purple/80 py-4 px-4 w-70 rounded-2xl flex items-center gap-4 border border-pulse-purple/50 transition-transform duration-300 group hover:scale-105 text-white shadow-lg shadow-pulse-purple/20">
      <HelpingHand size={56} />

      <div className="flex flex-col justify-center gap-1">
        <h2 className="text-xl font-bold leading-snug">
          SUPPORT PULSE
        </h2>
        <p className="text-base font-medium leading-snug">
          Help fund Pulse's servers for special perks.
        </p>
      </div>
    </div>
  );
};

export default SupportPulseCard;
