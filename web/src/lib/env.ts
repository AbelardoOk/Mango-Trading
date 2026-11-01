export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
export const TIKTOK_CLIENT_KEY = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY || "";

if (typeof window === "undefined" && !API_URL) {
  console.warn("NEXT_PUBLIC_API_URL not set, defaulting to http://localhost:8080");
}
