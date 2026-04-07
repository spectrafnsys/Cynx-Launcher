;

import type React from "react";
import PackageCard from "./PackageCard";

interface Package {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
}

interface PackageListProps {
  packages: Package[];
  selectedPackage: string | null;
  onSelect: (id: string) => void;
}

const PackageList: React.FC<PackageListProps> = ({
  packages,
  selectedPackage,
  onSelect,
}) => (
  <div className="mb-12">
    <div className="flex items-baseline justify-between mb-4">
      <h2 className="text-2xl font-bold text-white tracking-tight">Donator Packages</h2>
      <p className="text-stone-500 text-sm">{packages.length} items available</p>
    </div>
    <div className="h-px w-full bg-gradient-to-r from-stone-500/50 via-stone-800 to-transparent mb-8" />
    <div className="space-y-4">
      {packages.map((pkg, index) => (
        <PackageCard
          key={pkg.id}
          pkg={pkg}
          index={index}
          selectedPackage={selectedPackage}
          onSelect={onSelect}
        />
      ))}
    </div>
  </div>
);

export default PackageList;
