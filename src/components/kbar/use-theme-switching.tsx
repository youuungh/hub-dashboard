import { useRegisterActions } from "kbar";
import { useTheme } from "next-themes";

const useThemeSwitching = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const themeAction = [
    {
      id: "toggleTheme",
      name: "테마 전환",
      shortcut: ["t", "t"],
      section: "Theme",
      perform: toggleTheme,
    },
    {
      id: "setLightTheme",
      name: "라이트 모드",
      section: "Theme",
      perform: () => setTheme("light"),
    },
    {
      id: "setDarkTheme",
      name: "다크 모드",
      section: "Theme",
      perform: () => setTheme("dark"),
    },
  ];

  useRegisterActions(themeAction, [theme]);
};

export default useThemeSwitching;
