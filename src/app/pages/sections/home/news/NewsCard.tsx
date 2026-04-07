import { useState, useEffect } from "react";
import { Card } from "../../../../components/ui/Card";
import { Play } from "lucide-react";

type NewsItem = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  backgroundImage: string;
  buttonText: string;
};

type NewsCardProps = {
  isLoaded: boolean;
  setView: (target: any) => void;
};

const newsItems: NewsItem[] = [
  {
    id: "outoftime",
    title: "The Last Reality",
    subtitle: "Chapter 2 Season 7",
    description:
      "Enjoy Playing Project Pulse Chapter 2 Season 7 with so much features added!. ",
    backgroundImage: "/marvel.png",
    buttonText: "Play Now",
  },
  {
    id: "resistance",
    title: "Play Arena in Pulse",
    subtitle: "Chapter 2 Season 7",
    description:
      "Play arena in Pulse and prove to others what you are capable of.",
    backgroundImage:
      "https://raw.githubusercontent.com/CynxDEV-OGFN/pulse-things/refs/heads/main/arena.png",
    buttonText: "Play Now",
  },
];

export function NewsCard({ isLoaded, setView }: NewsCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const currentNews = newsItems[currentIndex];
  const hasMultipleItems = newsItems.length > 1;

  useEffect(() => {
    if (!hasMultipleItems || isPaused) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % newsItems.length);
        setIsTransitioning(false);
      }, 400);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, hasMultipleItems]);

  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageLoaded(true);
    img.src = currentNews.backgroundImage;
  }, [currentNews.backgroundImage]);

  const handleDotClick = (index: number) => {
    if (index === currentIndex || !hasMultipleItems) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <section className="news-section relative">
      <Card
        className={`bg-[#1a1a1a] border-gray-800/60 overflow-hidden group 
        transition-all duration-500 shadow-xl hover:shadow-2xl 
        relative border rounded-xl hover:border-gray-700/80
        transform ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative h-96 overflow-hidden">
          <div
            className={`absolute inset-0 transition-all duration-500 ${isTransitioning || !imageLoaded ? "opacity-0" : "opacity-100"
              }`}
          >
            <img
              src={currentNews.backgroundImage || "/placeholder.svg"}
              alt={currentNews.title}
              className="w-full h-full object-cover object-center"
              style={{
                filter: "brightness(0.8) contrast(1.05)",
              }}
            />
          </div>

          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#101010]">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/20 to-transparent animate-pulse" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
            <div
              className={`transition-all duration-500 ${isTransitioning
                ? "opacity-0 translate-y-2"
                : "opacity-100 translate-y-0"
                }`}
            >
              <div className="max-w-lg">
                <h2 className="text-3xl font-black mb-2 text-white tracking-wide">
                  {currentNews.title}
                </h2>
                <h3 className="text-lg text-gray-300 font-bold mb-3">
                  {currentNews.subtitle}
                </h3>
                <p className="text-gray-200 mb-6 text-sm leading-relaxed max-w-md">
                  {currentNews.description}
                </p>

                <div className="flex items-center gap-4 relative">
                  <button
                    onClick={setView}
                    className="cursor-pointer bg-white text-black hover:bg-gray-100 
                    font-semibold px-6 py-3 rounded-lg transition-all duration-200 
                    flex items-center gap-2 shadow-md hover:scale-105 text-base"
                  >
                    <Play className="h-4 w-4" />
                    <span>{currentNews.buttonText}</span>
                  </button>

                  {hasMultipleItems && (
                    <div className="flex gap-1.5">
                      {newsItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleDotClick(index)}
                          className={`cursor-pointer transition-all duration-200 rounded-full ${index === currentIndex
                            ? "w-6 h-2 bg-white"
                            : "w-2 h-2 bg-white/40 hover:bg-white/70"
                            }`}
                          title={item.title}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
