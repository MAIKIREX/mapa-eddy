"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"),
  );

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <Button type="button" variant="outline" onClick={toggleTheme} className="gap-2">
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      {isDark ? "Modo claro" : "Modo oscuro"}
    </Button>
  );
}
