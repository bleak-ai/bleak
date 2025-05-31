import {Label} from "../../ui/label";
import {Textarea} from "../../ui/textarea";

// Completely framework-agnostic props interface
interface TextQuestionProps {
  text?: string;
  question?: string; // For backward compatibility
  value: string;
  onChange: (value: string) => void;
}

export const TextQuestion = ({
  text,
  question,
  value,
  onChange
}: TextQuestionProps) => {
  // Use text if available, otherwise fall back to question for backward compatibility
  const displayText = text || question;

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium text-foreground">
        {displayText}
      </Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer here..."
        rows={3}
        className="resize-none"
      />
    </div>
  );
};
