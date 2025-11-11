import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TranslateButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}

export function TranslateButton({ onClick, disabled, loading }: TranslateButtonProps) {
  return (
    <div className="flex justify-center -my-6 relative z-10">
      <Button
        onClick={onClick}
        disabled={disabled || loading}
        className="px-8 py-3 rounded-full text-sm font-medium shadow-lg"
        data-testid="button-translate"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Translating...
          </>
        ) : (
          <>
            Translate
            <ArrowRight className="h-5 w-5 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}
