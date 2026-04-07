import { ApiConfig } from "../../../app/types/client";

export const getBaseURL = (): string => {
  return import.meta.env.VITE_API_BASE_URL || "http://26.157.83.30:3013/h/d/v1";
};

export const DEFAULT_CONFIG: Required<ApiConfig> = {
  baseURL: getBaseURL(),
  apiKey:
    import.meta.env.VITE_CRYSTAL_API_KEY ||
    "a9f3e5c2-38b4-4d0f-9a7e-84ec4bdb9b35",
  timeout: 5000,
  retries: 3,
  retryDelay: 1000,
};

export const API_ENDPOINTS = {
  DISCORD_CALLBACK: "/discord/callback",
  AUTH_EXCHANGE_CREATE: "/auth/exchange/create",
} as const;

export const getWebSocketURL = (): string => {
  return import.meta.env.VITE_WS_URL || "ws://26.157.83.30:3013";
};
