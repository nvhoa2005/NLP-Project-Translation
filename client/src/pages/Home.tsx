import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { LanguageBar } from "@/components/LanguageBar";
import { TranslationPanel } from "@/components/TranslationPanel";
import { TranslateButton } from "@/components/TranslateButton";

export default function Home() {
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("vi");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const savedSourceLang = localStorage.getItem("sourceLang");
    const savedTargetLang = localStorage.getItem("targetLang");
    
    if (savedSourceLang) setSourceLang(savedSourceLang);
    if (savedTargetLang) setTargetLang(savedTargetLang);
  }, []);

  useEffect(() => {
    localStorage.setItem("sourceLang", sourceLang);
  }, [sourceLang]);

  useEffect(() => {
    localStorage.setItem("targetLang", targetLang);
  }, [targetLang]);

  const handleSwap = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    
    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  const handleTranslateChatGPT = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLang,
          targetLang,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      setTranslatedText(data.translatedText);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateHF = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);

    try {
      const response = await fetch('/api/hf-translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLang,
          targetLang,
        }),
      });

      if (!response.ok) throw new Error('Translation failed');

      const data = await response.json();
      setTranslatedText(data.translation || ''); // 🤖 Hugging Face trả về "translation"
    } catch (error) {
      console.error('Translation error (Hugging Face):', error);
      setTranslatedText('⚠️ Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleClear = () => {
    setSourceText("");
    setTranslatedText("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-6">
        <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-6">
          <LanguageBar
            sourceLang={sourceLang}
            targetLang={targetLang}
            onSourceChange={setSourceLang}
            onTargetChange={setTargetLang}
            onSwap={handleSwap}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TranslationPanel
              value={sourceText}
              onChange={setSourceText}
              placeholder="Enter text to translate..."
              isSource={true}
              onClear={handleClear}
              onTranslate={handleTranslateHF}
            />
            
            <TranslationPanel
              value={translatedText}
              placeholder="Translation will appear here"
              isSource={false}
            />
          </div>

          <TranslateButton
            onClick={handleTranslateHF}
            disabled={!sourceText.trim()}
            loading={isTranslating}
          />
        </div>
      </main>
    </div>
  );
}
