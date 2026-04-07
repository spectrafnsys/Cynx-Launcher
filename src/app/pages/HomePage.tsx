import { useState, useEffect } from "react";
import ErrorManager from "../components/managers/ErrorManager";
import { NewsCard } from "./sections/home/news/NewsCard";
import SmallShop from "./sections/home/shop/SmallShop";
import Statistics from "./sections/home/stats/Statistics";

export default function HomePage({ setView }: { setView: any }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timeout);
  }, []);
  return (
    <ErrorManager>
      <div className="flex gap-4 p-4 min-h-screen">
        <div className="flex-1 space-y-4">
          <NewsCard setView={() => setView("library")} isLoaded={visible} />
          <div className="flex gap-4">
            <SmallShop className="" />
            <Statistics />
          </div>
        </div>
      </div>
    </ErrorManager>
  );
}
