"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";
import { setTheme } from "../actions";

type Theme = "dark" | "light" | "system";

export function ThemeToggle({ initialTheme }: { initialTheme: Theme }) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const isInitialMount = useRef(true);

  // Sync with server-provided theme on mount/navigation
  useEffect(() => {
    if (initialTheme && initialTheme !== theme) {
      setThemeState(initialTheme);
    }
  }, [initialTheme]);

  // Update DOM when theme changes
  useEffect(() => {
    const root = document.documentElement;
    const shouldBeDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (shouldBeDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Set data attribute for consistency
    root.setAttribute("data-theme", theme);

    // Persist to cookie and server (only if not initial mount)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Persist to cookie
    const cookieString = `theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
    document.cookie = cookieString;

    // Persist to server via server action
    setTheme(theme).catch((error) => {
      console.error("Failed to set theme:", error);
    });
  }, [theme]);

  // Listen for system theme changes when theme is "system"
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const root = document.documentElement;
      if (mediaQuery.matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const toggleTheme = () => {
    // Cycle through: system -> light -> dark -> system
    if (theme === "system") {
      setThemeState("light");
    } else if (theme === "light") {
      setThemeState("dark");
    } else {
      setThemeState("system");
    }
  };

  const getIcon = () => {
    // Icon represents the NEXT state in the cycle: system -> light -> dark -> system
    if (theme === "dark") {
      return <Sun className="h-4 w-4" />;
    } else if (theme === "light") {
      return <Moon className="h-4 w-4" />;
    } else {
      return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9"
      aria-label="Toggle theme"
    >
      {getIcon()}
    </Button>
  );
}
