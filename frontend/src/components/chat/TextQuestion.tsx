import {Label} from "../ui/label";
import {Textarea} from "../ui/textarea";

interface TextQuestionProps {
  question: string;
  value: string;
  onChange: (value: string) => void;
}

export const TextQuestion = ({
  question,
  value,
  onChange
}: TextQuestionProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium text-foreground">
        {question}
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
