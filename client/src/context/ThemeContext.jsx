import {
  createContext,
  useEffect,
  useState,
} from "react";

export const ThemeContext =
  createContext();

function ThemeProvider({
  children,
}) {

  const [theme, setTheme] =
    useState(
      localStorage.getItem(
        "theme"
      ) || "dark"
    );


  // APPLY THEME
  useEffect(() => {

    document.documentElement.classList.remove(
      "light",
      "dark"
    );

    document.documentElement.classList.add(
      theme
    );

    localStorage.setItem(
      "theme",
      theme
    );

  }, [theme]);


  // TOGGLE
  const toggleTheme = () => {

    setTheme((prev) =>
      prev === "dark"
        ? "light"
        : "dark"
    );

  };


  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;