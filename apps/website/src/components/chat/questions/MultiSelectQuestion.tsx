import {useState, useEffect, useRef} from "react";
import {Label} from "../../ui/label";
import {Input} from "../../ui/input";
import {logMultiSelectState, logUserAnswer} from "../../../utils/logger";

// Completely framework-agnostic props interface
interface MultiSelectQuestionProps {
  text?: string;
  question?: string; // For backward compatibility
  options?: string[];
  value: string;
  onChange: (value: string) => void;
  uniqueId?: string; // Provided by the resolver for unique IDs
  elementIndex?: number; // For fallback if uniqueId not available
  questionIndex?: number; // For backward compatibility
}

export const MultiSelectQuestion = ({
  text,
  question,
  options = [],
  value,
  onChange,
  uniqueId,
  elementIndex,
  questionIndex = 0
}: MultiSelectQuestionProps) => {
  // Use text if available, otherwise fall back to question for backward compatibility
  const displayText = text || question || "";

  // Use uniqueId if available, otherwise fall back to elementIndex or questionIndex
  const baseId =
    uniqueId || `multiselect-${elementIndex ?? questionIndex ?? 0}`;

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
      logUserAnswer(displayText, newSelected.join(", "), "multiselect");
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
      logUserAnswer(displayText, filteredSelected.join(", "), "multiselect");
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium text-foreground">
        {displayText}
      </Label>

      <div className="space-y-2">
        {options.map((option, optIndex) => (
          <div
            key={optIndex}
            className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors"
          >
            <input
              type="checkbox"
              id={`${baseId}-${optIndex}`}
              checked={selectedOptions.includes(option)}
              onChange={() => handleOptionToggle(option)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <Label
              htmlFor={`${baseId}-${optIndex}`}
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
            id={`${baseId}-other`}
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
