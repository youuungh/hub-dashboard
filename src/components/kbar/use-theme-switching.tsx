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
      section: "테마",
      icon: "laptop",
      perform: toggleTheme,
    },
    {
      id: "setLightTheme",
      name: "라이트 모드",
      section: "테마",
      icon: "sun",
      perform: () => setTheme("light"),
    },
    {
      id: "setDarkTheme",
      name: "다크 모드",
      section: "테마",
      icon: "moon",
      perform: () => setTheme("dark"),
    },
  ];

  useRegisterActions(themeAction, [theme]);
};

export default useThemeSwitching;
