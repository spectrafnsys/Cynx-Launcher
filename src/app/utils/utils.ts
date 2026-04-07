import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function addOrUpdateQueryParam(
  url: string,
  key: string,
  value: string
): string {
  const urlObj = new URL(url);
  urlObj.searchParams.set(key, value);

  const urlString = urlObj.toString();

  return urlString.replace(/\/\?/, "?");
}

export function cleanWsUrl(url: string): string {
  return url.replace(/\/\?/, "?");
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
