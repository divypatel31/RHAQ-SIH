// Point this at your deployed backend, or your machine's LAN IP when
// testing on a physical device via Expo Go (localhost won't resolve
// from a phone on the same network — use e.g. http://192.168.1.5:5000/api).
export const API_BASE_URL = "http://localhost:5000/api";

// Bhashini (bhashini.gov.in) credentials for voice read-aloud (see
// src/services/bhashiniService.js). Register at
// https://bhashini.gov.in/ulca/user/register to get these — they are
// free but require signup. Leave blank to disable the read-aloud
// feature gracefully (ReadAloudButton shows a helpful message instead
// of crashing when these are empty).
export const BHASHINI_USER_ID = "";
export const BHASHINI_API_KEY = "";
// Public pipeline ID commonly used for the standard ASR/NMT/TTS pipeline
// as of this writing — Bhashini may rotate this; check their docs if
// pipeline requests start failing with a "pipeline not found" error.
export const BHASHINI_PIPELINE_ID = "64392f96daac500b55c543cd";

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
