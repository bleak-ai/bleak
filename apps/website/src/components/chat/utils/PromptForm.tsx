import {useState, useEffect, type FormEvent} from "react";
import {Loader} from "lucide-react";
import {Button} from "../../ui/button";
import {Textarea} from "../../ui/textarea";

interface PromptFormProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  prefilledPrompt?: string;
}

export const PromptForm = ({
  onSubmit,
  isLoading,
  prefilledPrompt = ""
}: PromptFormProps) => {
  const [prompt, setPrompt] = useState(prefilledPrompt);

  // Update prompt when prefilledPrompt changes
  useEffect(() => {
    if (prefilledPrompt && prefilledPrompt !== prompt) {
      setPrompt(prefilledPrompt);
    }
  }, [prefilledPrompt]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-light mb-2 text-foreground">
          What would you like to know?
        </h2>
        <p className="text-muted-foreground">
          Ask a question and I'll generate interactive components to gather more
          details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your question here..."
          rows={4}
          className="resize-none"
        />
        <Button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="w-full py-3 text-base font-medium"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            "Ask Question"
          )}
        </Button>
      </form>
    </div>
  );
};
