export interface BuildConfig {
  title: string;
  subtitle: string;
  version: string;
  status: string;
  size: string;
  releaseDate: string;
  image: string;
  description: string;
  highlights: Array<{
    color: string;
    glowColor: string;
    title: string;
    desc: string;
  }>;
  stats: Array<{
    value: string;
    label: string;
    color: string;
    bgColor: string;
  }>;
  gradientColors: string;
  hoverGradientColors: string;
  theme: {
    primary: string;
    secondary: string;
  };
}

export interface BuildData {
  id: string;
  title: string;
  subtitle: string;
  version: string;
  status: string;
  size: string;
}

export type LaunchStatus =
  | "idle"
  | "starting"
  | "loading"
  | "success"
  | "error";
