import {useState} from "react";
import {Label} from "../../ui/label";
import {RadioGroup, RadioGroupItem} from "../../ui/radio-group";
import {Input} from "../../ui/input";
import type {BleakElementProps} from "@bleakai/core";

export const RadioBleakElement = ({
  text,
  options = [],
  value,
  onChange,
  elementIndex
}: BleakElementProps) => {
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
      <Label className="text-base font-medium text-foreground">{text}</Label>

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
            <RadioGroupItem value={option} id={`${elementIndex}-${optIndex}`} />
            <Label
              htmlFor={`${elementIndex}-${optIndex}`}
              className="cursor-pointer text-sm flex-1 leading-relaxed"
            >
              {option}
            </Label>
          </div>
        ))}

        {/* Other option */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="other" id={`${elementIndex}-other`} />
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
