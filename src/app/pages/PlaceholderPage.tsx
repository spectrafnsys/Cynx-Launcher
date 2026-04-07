import {
  Library,
  Clock,
  Code2,
  Palette,
  Settings,
  Wrench,
  Zap,
  type LucideIcon,
  Download,
  ShoppingCart,
} from "lucide-react";

interface PlaceholderPageProps {
  readonly title: string;
}

type PageType =
  | "library"
  | "themes"
  | "settings"
  | "tournament"
  | "hotfixes"
  | "downloads"
  | "shop";

const PAGE_ICON_MAP: Record<PageType, LucideIcon> = {
  library: Library,
  themes: Palette,
  settings: Settings,
  tournament: Wrench,
  hotfixes: Zap,
  downloads: Download,
  shop: ShoppingCart,
} as const;

const getPageIcon = (title: string): LucideIcon => {
  return PAGE_ICON_MAP[title as PageType] ?? Code2;
};

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  const IconComponent = getPageIcon(title);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <div className="text-center space-y-6 max-w-md">
        <div className="relative">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-stone-900/40 via-stone-800/30 to-stone-900/40 border border-stone-700/40 flex items-center justify-center shadow-2xl shadow-stone-900/30">
            <IconComponent className="w-10 h-10 text-stone-300" />
          </div>
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-2xl bg-stone-600/20 blur-xl" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-stone-300 capitalize tracking-wide">
            {title}
          </h2>
          <div className="flex items-center justify-center gap-2 text-sm text-stone-300">
            <Clock className="w-4 h-4" />
            <span>Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
