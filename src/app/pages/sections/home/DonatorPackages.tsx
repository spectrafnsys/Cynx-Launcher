import { useState, useEffect } from "react";
import { Gift, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DonatorPackages() {
  const [currentPackage, setCurrentPackage] = useState(0);

  const packages = [
    {
      id: "crystal-donator",
      name: "Crystal Donator",
      price: "$30,oo USD",
      image: "/full-locker.avif",
      description: "Package info on the store page.",
    },
    {
      id: "og-donator",
      name: "Full Locker",
      price: "$40.00 USD",
      image: "/og-donator.avif",
      description: "Package info on the store page.",
    },
    {
      id: "pulse-donator",
      name: "Pulse Bundles",
      price: "Choose a Bundles",
      image: "/pulse-donator.avif",
      description: "Package info on the store page.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPackage((prev) => (prev + 1) % packages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [packages.length]);

  const pkg = packages[currentPackage];

  return (
    <div className="w-72 z-20 pb-2 pt-2">
      <motion.div
        className="relative group rounded-xl overflow-hidden galaxy-surface border border-pulse-purple/30 hover:border-pulse-purple/50 backdrop-blur-md"
        initial={{
          y: 50,
          opacity: 0,
          scale: 0.9,
        }}
        animate={{
          y: 0,
          opacity: 1,
          scale: 1,
          transition: {
            duration: 0.5,
            ease: "easeInOut",
          },
        }}
        whileHover={{
          scale: 1.02,
          boxShadow: "0 25px 50px -12px rgba(146, 148, 255, 0.25)",
          transition: {
            duration: 0.3,
            ease: "easeOut",
          },
        }}
      >
        <div className="relative h-32 overflow-hidden bg-gradient-to-br from-pulse-purple/20 to-black/40">
          <AnimatePresence mode="wait">
            <motion.div
              key={pkg.id}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.1, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <motion.img
                src={pkg.image || "/placeholder.svg"}
                alt={pkg.name}
                className="w-full h-full object-cover object-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          <motion.div
            className="absolute top-3 right-3"
            initial={{ opacity: 0.6 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="w-4 h-4 text-pulse-purple/90" />
            </motion.div>
          </motion.div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-6 h-6 rounded-full bg-gradient-to-br from-pulse-purple to-pulse-purple/80 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Gift className="w-3 h-3 text-pulse-purple/80" />
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.h3
                key={`title-${pkg.id}`}
                className="font-semibold galaxy-text-primary text-sm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {pkg.name}
              </motion.h3>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${pkg.id}`}
              className="galaxy-text-secondary text-xs leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            >
              {pkg.description}
            </motion.p>
          </AnimatePresence>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <AnimatePresence mode="wait">
                <motion.p
                  key={`price-${pkg.id}`}
                  className="text-lg font-bold bg-gradient-to-r from-pulse-purple to-pulse-purple bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                >
                  {pkg.price}
                </motion.p>
              </AnimatePresence>

              <div className="flex gap-1.5">
                {packages.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-2 h-2 rounded-full cursor-pointer ${index === currentPackage
                      ? "bg-pulse-purple shadow-md shadow-pulse-purple/60"
                      : "bg-pulse-purple/50 hover:bg-pulse-purple/70"
                      }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                      scale: index === currentPackage ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setCurrentPackage(index)}
                  />
                ))}
              </div>
            </div>

            <motion.button
              className="group/btn relative cursor-pointer overflow-hidden px-4 py-2 bg-gradient-to-r from-pulse-purple to-pulse-purple/80 hover:from-pulse-purple/90 hover:to-pulse-purple text-white font-medium rounded-lg text-xs shadow-lg shadow-pulse-purple/40"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(146, 148, 255, 0.5)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="absolute inset-0 bg-white/10"
                initial={{ x: "-100%", skewX: 12 }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
              />
              <span className="relative z-10">Purchase</span>
            </motion.button>
          </div>
        </div>

        <motion.div
          className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-pulse-purple/20 to-transparent rounded-bl-xl"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
      </motion.div>
    </div>
  );
}
