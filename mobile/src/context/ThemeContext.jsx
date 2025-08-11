import { useState, useMemo, useCallback, useEffect } from "react";
import { Colors } from "../constants/Colors";
import { useColorScheme } from "react-native";
import { ThemeContext } from "./ThemeContextInstance";

export const ThemeProvider = ({ children }) => {
  const deviceColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(deviceColorScheme === "dark");

  // Keep theme in sync with device color scheme changes
  useEffect(() => {
    const next = deviceColorScheme === "dark";
    setIsDarkMode((prev) => (prev === next ? prev : next));
  }, [deviceColorScheme]);

  const theme = useMemo(
    () => (isDarkMode ? Colors.dark : Colors.light),
    [isDarkMode],
  );

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const setTheme = useCallback((darkMode) => {
    setIsDarkMode((prev) => (prev === darkMode ? prev : darkMode));
  }, []);

  const value = useMemo(
    () => ({ isDarkMode, theme, toggleTheme, setTheme }),
    [isDarkMode, theme, toggleTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
