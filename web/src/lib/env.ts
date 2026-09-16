export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

if (typeof window === "undefined" && !API_URL) {
  console.warn("NEXT_PUBLIC_API_URL not set, defaulting to http://localhost:8080");
}
