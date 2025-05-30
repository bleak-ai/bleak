import {useState} from "react";
import {Label} from "../../ui/label";
import {RadioGroup, RadioGroupItem} from "../../ui/radio-group";
import {Input} from "../../ui/input";
import type {BleakElementProps} from "@bleakai/core";

export const RadioQuestion = ({
  text,
  question,
  options = [],
  value,
  onChange,
  elementIndex,
  questionIndex
}: BleakElementProps & {question?: string; questionIndex?: number}) => {
  // Use text if available, otherwise fall back to question for backward compatibility
  const displayText = text || question;
  const displayIndex = elementIndex ?? questionIndex ?? 0;

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
        className="space-y-3"
      >
        {options.map((option: string, optIndex: number) => (
          <div
            key={optIndex}
            className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors"
          >
            <RadioGroupItem value={option} id={`${displayIndex}-${optIndex}`} />
            <Label
              htmlFor={`${displayIndex}-${optIndex}`}
              className="cursor-pointer text-sm flex-1 leading-relaxed"
            >
              {option}
            </Label>
          </div>
        ))}

        {/* Other option */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="other" id={`${displayIndex}-other`} />
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
