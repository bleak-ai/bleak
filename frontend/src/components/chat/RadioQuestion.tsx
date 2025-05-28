import {useState} from "react";
import {Label} from "../ui/label";
import {RadioGroup, RadioGroupItem} from "../ui/radio-group";
import {Input} from "../ui/input";

interface RadioQuestionProps {
  question: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  questionIndex: number;
}

export const RadioQuestion = ({
  question,
  options,
  value,
  onChange,
  questionIndex
}: RadioQuestionProps) => {
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
        {question}
      </Label>

      <RadioGroup
        value={isOtherSelected ? "other" : value}
        onValueChange={handleRadioChange}
        className="space-y-3"
      >
        {options.map((option, optIndex) => (
          <div
            key={optIndex}
            className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors"
          >
            <RadioGroupItem
              value={option}
              id={`${questionIndex}-${optIndex}`}
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
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="other" id={`${questionIndex}-other`} />
            {/* <Label
              htmlFor={`${questionIndex}-other`}
              className="cursor-pointer text-sm flex-1 leading-relaxed"
            >
              Other
            </Label> */}
            <Input
              value={otherValue}
              onChange={(e) => handleOtherTextChange(e.target.value)}
              placeholder="Other"
              className="resize-none"
            />
          </div>

          {/* {isOtherSelected && ( */}
          <div className="ml-8"></div>
          {/* )} */}
        </div>
      </RadioGroup>
    </div>
  );
};
