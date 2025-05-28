import {useState, useEffect, useRef} from "react";
import {Label} from "../ui/label";
import {Input} from "../ui/input";
import {logMultiSelectState, logUserAnswer} from "../../utils/logger";

interface MultiSelectQuestionProps {
  question: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  questionIndex: number;
}

export const MultiSelectQuestion = ({
  question,
  options,
  value,
  onChange,
  questionIndex
}: MultiSelectQuestionProps) => {
  const [otherValue, setOtherValue] = useState("");
  const lastLoggedValue = useRef<string>("");

  // Parse the current value as a JSON array, fallback to comma-separated for backward compatibility
  const parseSelectedOptions = (value: string): string[] => {
    if (!value) return [];

    // Try to parse as JSON array first
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed;
    }

    return [];
  };

  const selectedOptions = parseSelectedOptions(value);

  // Log multiselect state changes only when selection actually changes
  useEffect(() => {
    if (value !== lastLoggedValue.current && selectedOptions.length > 0) {
      logMultiSelectState(selectedOptions, options.length);
      lastLoggedValue.current = value;
    }
  }, [selectedOptions, options.length, value]);

  const handleOptionToggle = (option: string) => {
    const isSelected = selectedOptions.includes(option);
    let newSelected: string[];
    if (isSelected) {
      newSelected = selectedOptions.filter((item) => item !== option);
    } else {
      newSelected = [...selectedOptions, option];
    }

    const newValue = JSON.stringify(newSelected);
    onChange(newValue);

    // Log user interaction only for significant changes
    if (newValue !== value) {
      logUserAnswer(question, newSelected.join(", "), "multiselect");
    }
  };

  const handleOtherChange = (text: string) => {
    setOtherValue(text);

    // Remove any existing "other" values and add the new one
    const filteredSelected = selectedOptions.filter(
      (item) => options.includes(item) // Only keep predefined options
    );

    if (text.trim()) {
      filteredSelected.push(text.trim());
    }

    const newValue = JSON.stringify(filteredSelected);
    onChange(newValue);

    // Log user interaction only when text is meaningful
    if (text.trim() && newValue !== value) {
      logUserAnswer(question, filteredSelected.join(", "), "multiselect");
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium text-foreground">
        {question}
      </Label>

      <div className="space-y-2">
        {options.map((option, optIndex) => (
          <div
            key={optIndex}
            className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors"
          >
            <input
              type="checkbox"
              id={`${questionIndex}-${optIndex}`}
              checked={selectedOptions.includes(option)}
              onChange={() => handleOptionToggle(option)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <Label
              htmlFor={`${questionIndex}-${optIndex}`}
              className="cursor-pointer text-sm flex-1 leading-relaxed"
            >
              {option}
            </Label>
          </div>
        ))}

        {/* Other option */}
        <div className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
          <input
            type="checkbox"
            id={`${questionIndex}-other`}
            checked={otherValue.trim() !== ""}
            onChange={() => {}} // Controlled by text input
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <Input
            value={otherValue}
            onChange={(e) => handleOtherChange(e.target.value)}
            placeholder="Other (specify)"
            className="flex-1"
          />
        </div>
      </div>

      {selectedOptions.length > 0 && (
        <div className="mt-3 p-2 bg-muted/30 rounded text-sm">
          <strong>Selected:</strong> {selectedOptions.join(", ")}
        </div>
      )}
    </div>
  );
};
