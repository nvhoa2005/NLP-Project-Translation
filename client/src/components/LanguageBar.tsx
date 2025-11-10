import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "./LanguageSelector";
import { useState } from "react";

interface LanguageBarProps {
  sourceLang: string;
  targetLang: string;
  onSourceChange: (lang: string) => void;
  onTargetChange: (lang: string) => void;
  onSwap: () => void;
}

export function LanguageBar({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  onSwap,
}: LanguageBarProps) {
  const [isRotating, setIsRotating] = useState(false);

  const handleSwap = () => {
    setIsRotating(true);
    onSwap();
    setTimeout(() => setIsRotating(false), 200);
  };

  return (
    <div className="flex items-center gap-2 md:gap-4">
      <LanguageSelector
        value={sourceLang}
        onChange={onSourceChange}
        label="Source language"
        testId="select-source-language"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSwap}
        className={`flex-shrink-0 transition-transform duration-200 ${
          isRotating ? "rotate-180" : ""
        }`}
        data-testid="button-swap-languages"
        aria-label="Swap languages"
      >
        <ArrowLeftRight className="h-5 w-5" />
      </Button>
      <LanguageSelector
        value={targetLang}
        onChange={onTargetChange}
        label="Target language"
        testId="select-target-language"
      />
    </div>
  );
}
