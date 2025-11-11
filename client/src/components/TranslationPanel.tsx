import { X, Copy, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface TranslationPanelProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder: string;
  isSource: boolean;
  onClear?: () => void;
  onSpeak?: () => void;
  onTranslate?: () => void;
  maxLength?: number;
}

export function TranslationPanel({
  value,
  onChange,
  placeholder,
  isSource,
  onClear,
  onSpeak,
  onTranslate,
  maxLength = 5000,
}: TranslationPanelProps) {
  const { toast } = useToast();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isSource && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (onTranslate && value.trim()) {
        onTranslate();
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        description: "Copied to clipboard!",
        duration: 2000,
      });
    } catch (err) {
      toast({
        description: "Failed to copy",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window && value) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(value);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      if (onSpeak) onSpeak();
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 md:p-6 border rounded-lg bg-card">
      <Textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-48 max-h-96 resize-y text-base leading-relaxed focus-visible:ring-2"
        readOnly={!isSource}
        maxLength={maxLength}
        data-testid={isSource ? "textarea-source" : "textarea-target"}
      />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isSource ? (
            <>
              {value && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClear}
                    data-testid="button-clear"
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Clear</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSpeak}
                    disabled={isSpeaking}
                    data-testid="button-speak-source"
                    className="gap-2"
                  >
                    {isSpeaking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Listen</span>
                  </Button>
                </>
              )}
              <span className="text-xs text-muted-foreground hidden md:inline">
                Enter to translate, Enter+Shift for new line
              </span>
            </>
          ) : (
            value && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  data-testid="button-copy"
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  <span className="hidden sm:inline">Copy</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSpeak}
                  disabled={isSpeaking}
                  data-testid="button-speak"
                  className="gap-2"
                >
                  {isSpeaking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Listen</span>
                </Button>
              </>
            )
          )}
        </div>
        
        {isSource && (
          <span className="text-xs text-muted-foreground" data-testid="text-char-count">
            {value.length} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
