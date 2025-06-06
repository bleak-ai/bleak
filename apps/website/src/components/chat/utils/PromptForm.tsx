import {useEffect, useState, type FormEvent} from "react";
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
  const [prompt, setPrompt] = useState(prefilledPrompt || "");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("prompt", prompt);
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
    }
  };

  useEffect(() => {
    if (prefilledPrompt) {
      setPrompt(prefilledPrompt);
    }
  }, [prefilledPrompt]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-light mb-2">
          What would you like to know?
        </h2>
        <p className="text-gray-600">
          Ask a question and I'll create interactive components for you.
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
          className="w-full"
        >
          {isLoading ? "Processing..." : "Ask Question"}
        </Button>
      </form>
    </div>
  );
};
