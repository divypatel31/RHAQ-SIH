// asha-app/src/config.js

export const API_BASE_URL =
  "https://http://10.25.111.11:5000/api";

export const BHASHINI_USER_ID =
  process.env.EXPO_PUBLIC_BHASHINI_USER_ID || "";

export const BHASHINI_API_KEY =
  process.env.EXPO_PUBLIC_BHASHINI_API_KEY || "";

export const BHASHINI_PIPELINE_ID =
  process.env.EXPO_PUBLIC_BHASHINI_PIPELINE_ID || "64392f96daac500b55c543cd";

export const COLORS = {
  primary: "#0F6E56",
  primaryDark: "#0B4F3E",
  amber: "#B45309",
  amberBg: "#FEF3C7",
  red: "#B91C1C",
  redBg: "#FEE2E2",
  green: "#15803D",
  greenBg: "#DCFCE7",
  text: "#1F2937",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  background: "#F9FAFB",
  white: "#FFFFFF",
};