import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

export const ThemeToggle = () => {
  // Check for user's preferred color scheme or saved preference
  const getInitialTheme = () => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    // Check user preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    const htmlElement = document.documentElement;
    const bodyElement = document.body;

    if (isDark) {
      htmlElement.classList.add("dark");
      bodyElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      htmlElement.classList.remove("dark");
      bodyElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      if (!localStorage.getItem("theme")) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return (
    <div
      onClick={() => setIsDark(!isDark)}
      className="theme-toggle"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Icon icon="material-symbols:sunny-rounded" />
      ) : (
        <Icon icon="line-md:moon-simple-filled" />
      )}
    </div>
  );
};
