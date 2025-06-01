import {useState} from "react";
import {Label} from "../../ui/label";
import {RadioGroup, RadioGroupItem} from "../../ui/radio-group";
import {Input} from "../../ui/input";

// Completely framework-agnostic props interface
interface RadioQuestionProps {
  text?: string;
  question?: string; // For backward compatibility
  options?: string[];
  value: string;
  onChange: (value: string) => void;
  uniqueId?: string; // Provided by the resolver for unique IDs
  elementIndex?: number; // For fallback if uniqueId not available
  questionIndex?: number; // For backward compatibility
}

export const RadioQuestion = ({
  text,
  question,
  options = [],
  value,
  onChange,
  uniqueId,
  elementIndex,
  questionIndex
}: RadioQuestionProps) => {
  // Use text if available, otherwise fall back to question for backward compatibility
  const displayText = text || question;

  // Use uniqueId if available, otherwise fall back to elementIndex or questionIndex
  const baseId = uniqueId || `radio-${elementIndex ?? questionIndex ?? 0}`;

  const [otherValue, setOtherValue] = useState("");
  const isOtherSelected =
    value === "other" || (!options.includes(value) && value !== "");

  const handleRadioChange = (selectedValue: string) => {
    if (selectedValue === "other") {
      onChange(otherValue || "other");
    } else {
      onChange(selectedValue);
      setOtherValue("");
    }
  };

  const handleOtherTextChange = (text: string) => {
    setOtherValue(text);
    if (isOtherSelected) {
      onChange(text || "other");
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium text-foreground">
        {displayText}
      </Label>

      <RadioGroup
        value={isOtherSelected ? "other" : value}
        onValueChange={handleRadioChange}
        className="space-y-2"
      >
        {options.map((option: string, optIndex: number) => (
          <div
            key={optIndex}
            className="flex items-center space-x-3 p-3 rounded-lg border border-border bg-card hover:bg-accent hover:border-ring/50 transition-all duration-200 cursor-pointer"
          >
            <RadioGroupItem value={option} id={`${baseId}-${optIndex}`} />
            <Label
              htmlFor={`${baseId}-${optIndex}`}
              className="cursor-pointer text-sm flex-1 leading-relaxed text-foreground"
            >
              {option}
            </Label>
          </div>
        ))}

        {/* Other option */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border bg-card hover:bg-accent hover:border-ring/50 transition-all duration-200">
            <RadioGroupItem value="other" id={`${baseId}-other`} />
            <Input
              value={otherValue}
              onChange={(e) => handleOtherTextChange(e.target.value)}
              placeholder="Other"
              className="resize-none"
            />
          </div>

          <div className="ml-8"></div>
        </div>
      </RadioGroup>
    </div>
  );
};
