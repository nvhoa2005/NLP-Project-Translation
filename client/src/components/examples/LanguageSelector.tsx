import { LanguageSelector } from "../LanguageSelector";
import { useState } from "react";

export default function LanguageSelectorExample() {
  const [language, setLanguage] = useState("en");

  return (
    <div className="p-4">
      <LanguageSelector
        value={language}
        onChange={setLanguage}
        label="Source Language"
        testId="select-source-language"
      />
    </div>
  );
}
