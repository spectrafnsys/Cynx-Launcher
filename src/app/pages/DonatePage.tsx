import { useState } from "react";
import StoreHeader from "./sections/donate/StoreHeader";
import PackageList from "./sections/donate/PackageList";

interface Package {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
}

export default function DonatorPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const packages: Package[] = [
    {
      id: "og-donator",
          name: "Full Locker with Customs!",
          price: "$40.00",
      image: "/pulse_withcustoms.png",
      description:
        "Unlock everything Pulse has to offer with complete feature access.(Witch Customs)",
    },
    {
      id: "full-locker",
      name: "Full Locker",
      price: "$25.00",
        image: "/Full_locker.png",
      description:
        "Unlock everything Pulse has to offer with complete feature access.(No Customs)",
    },
    {
      id: "pulse-donator",
        name: "Pulse Bundles",
        price: "Choose a Bundles",
        image: "/bundles-pulse.png",
      description: "Choose the best bundle for you!",
    },
  ];

  return (
    <div className="flex-1 p-4 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <StoreHeader />
        <PackageList
          packages={packages}
          selectedPackage={selectedPackage}
          onSelect={setSelectedPackage}
        />
      </div>
    </div>
  );
}
