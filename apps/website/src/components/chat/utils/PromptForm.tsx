import {useState, type FormEvent} from "react";
import {Loader} from "lucide-react";
import {Button} from "../../ui/button";
import {Textarea} from "../../ui/textarea";
import {Label} from "../../ui/label";

interface PromptFormProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export const PromptForm = ({onSubmit, isLoading}: PromptFormProps) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm text-gray-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-base font-medium">
            What would you like to know?
          </Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your question here..."
            rows={4}
            className="resize-none"
          />
        </div>
        <Button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="w-full"
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
