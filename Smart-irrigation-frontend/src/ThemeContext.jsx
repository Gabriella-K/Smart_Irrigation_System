import React, { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const toggleTheme = () => setIsDark((p) => !p);
  const theme = isDark ? darkTheme : lightTheme;
  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// ── DARK THEME ─────────────────────────────────────────
export const darkTheme = {
  // Page backgrounds
  pageBg: "linear-gradient(145deg, #0a0a0a 0%, #111111 50%, #0d1a0d 100%)",
  headerBg: "rgba(10,10,10,0.85)",
  // Glass cards
  glassBg: "rgba(255,255,255,0.06)",
  glassBorder: "rgba(255,255,255,0.1)",
  glassInner: "rgba(255,255,255,0.04)",
  // Text
  textPrimary: "#ffffff",
  textSecondary: "rgba(255,255,255,0.6)",
  textMuted: "rgba(255,255,255,0.35)",
  textLabel: "rgba(255,255,255,0.4)",
  // Accents
  accent: "#2ecc71",
  accentDim: "rgba(46,204,113,0.15)",
  accentBorder: "rgba(46,204,113,0.3)",
  accentText: "#061a0e",
  // Inputs
  inputBg: "rgba(255,255,255,0.06)",
  inputBorder: "rgba(255,255,255,0.12)",
  // Blobs
  blob1: "radial-gradient(circle, rgba(46,204,113,0.08) 0%, transparent 70%)",
  blob2: "radial-gradient(circle, rgba(46,204,113,0.05) 0%, transparent 70%)",
  // Grid overlay
  gridLine: "rgba(255,255,255,0.025)",
  // Nav divider
  divider: "rgba(255,255,255,0.08)",
  // Scrollbar
  scrollbar: "#1a6b35",
  // Slider track
  sliderTrack: "rgba(255,255,255,0.1)",
};

// ── LIGHT THEME ────────────────────────────────────────
export const lightTheme = {
  // Page backgrounds
  pageBg: "linear-gradient(145deg, #f5f0e8 0%, #ede8dc 50%, #e8f0e8 100%)",
  headerBg: "rgba(245,240,232,0.92)",
  // Glass cards
  glassBg: "rgba(255,255,255,0.7)",
  glassBorder: "rgba(0,0,0,0.08)",
  glassInner: "rgba(255,255,255,0.5)",
  // Text
  textPrimary: "#1a1a1a",
  textSecondary: "rgba(0,0,0,0.6)",
  textMuted: "rgba(0,0,0,0.35)",
  textLabel: "rgba(0,0,0,0.45)",
  // Accents
  accent: "#1a7a3f",
  accentDim: "rgba(26,122,63,0.1)",
  accentBorder: "rgba(26,122,63,0.3)",
  accentText: "#ffffff",
  // Inputs
  inputBg: "rgba(255,255,255,0.8)",
  inputBorder: "rgba(0,0,0,0.12)",
  // Blobs
  blob1: "radial-gradient(circle, rgba(26,122,63,0.08) 0%, transparent 70%)",
  blob2: "radial-gradient(circle, rgba(26,122,63,0.05) 0%, transparent 70%)",
  // Grid overlay
  gridLine: "rgba(0,0,0,0.04)",
  // Nav divider
  divider: "rgba(0,0,0,0.08)",
  // Scrollbar
  scrollbar: "#1a7a3f",
  // Slider track
  sliderTrack: "rgba(0,0,0,0.1)",
};
