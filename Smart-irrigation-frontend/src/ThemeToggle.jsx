import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeContext";

export default function ThemeToggle() {
  const { isDark, toggleTheme, theme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        background: theme.glassBg,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: `1px solid ${theme.glassBorder}`,
        borderRadius: 50,
        padding: "7px 14px",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      {isDark ? (
        <>
          <Sun size={14} color="#f59e0b" />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              color: theme.textSecondary,
            }}
          >
            Light
          </span>
        </>
      ) : (
        <>
          <Moon size={14} color="#6366f1" />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              color: theme.textSecondary,
            }}
          >
            Dark
          </span>
        </>
      )}
    </button>
  );
}
