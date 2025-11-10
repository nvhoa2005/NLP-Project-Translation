import { Languages } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="h-16 border-b flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Languages className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold font-display" data-testid="text-app-title">
          AI Translator
        </h1>
      </div>
      <ThemeToggle />
    </header>
  );
}
