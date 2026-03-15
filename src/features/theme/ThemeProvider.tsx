import { useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { ThemeContext, type ThemeMode } from "@/features/theme/theme-context";

const THEME_STORAGE_KEY = "radical-panel-theme";

function getSystemMode() {
  if (typeof window === "undefined") {
    return "light" as const;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === "light" ||
    storedTheme === "dark" ||
    storedTheme === "system"
    ? storedTheme
    : "system";
}

function applyTheme(mode: ThemeMode) {
  const resolvedMode = mode === "system" ? getSystemMode() : mode;
  const root = document.documentElement;
  root.classList.toggle("dark", resolvedMode === "dark");
  root.style.colorScheme = resolvedMode;
  return resolvedMode;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredTheme());
  const [resolvedMode, setResolvedMode] = useState<"light" | "dark">(() =>
    mode === "system" ? getSystemMode() : mode,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function syncTheme(nextMode: ThemeMode) {
      const nextResolvedMode = applyTheme(nextMode);
      setResolvedMode(nextResolvedMode);
    }

    syncTheme(mode);
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);

    function handleSystemChange() {
      if (mode === "system") {
        syncTheme("system");
      }
    }

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => {
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      resolvedMode,
      setMode: setModeState,
    }),
    [mode, resolvedMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
