import { LanguageBar } from "../LanguageBar";
import { useState } from "react";

export default function LanguageBarExample() {
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("vi");

  const handleSwap = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  return (
    <div className="p-4">
      <LanguageBar
        sourceLang={sourceLang}
        targetLang={targetLang}
        onSourceChange={setSourceLang}
        onTargetChange={setTargetLang}
        onSwap={handleSwap}
      />
    </div>
  );
}
