import { TranslationPanel } from "../TranslationPanel";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";

export default function TranslationPanelExample() {
  const [sourceText, setSourceText] = useState("Hello world");
  const [targetText] = useState("Xin chào thế giới");

  return (
    <>
      <div className="p-4 space-y-4">
        <TranslationPanel
          value={sourceText}
          onChange={setSourceText}
          placeholder="Enter text to translate..."
          isSource={true}
          onClear={() => setSourceText("")}
        />
        <TranslationPanel
          value={targetText}
          placeholder="Translation will appear here"
          isSource={false}
        />
      </div>
      <Toaster />
    </>
  );
}
