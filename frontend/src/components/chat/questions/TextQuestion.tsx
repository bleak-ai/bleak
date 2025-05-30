import {Label} from "../../ui/label";
import {Textarea} from "../../ui/textarea";
import type {QuestionProps} from "@bleakai/core";

export const TextQuestion = ({question, value, onChange}: QuestionProps) => {
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
