import { TranslateButton } from "../TranslateButton";
import { useState } from "react";

export default function TranslateButtonExample() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="p-8">
      <TranslateButton
        onClick={handleClick}
        disabled={false}
        loading={loading}
      />
    </div>
  );
}
