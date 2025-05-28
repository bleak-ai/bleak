import {Label} from "../ui/label";

interface SliderQuestionProps {
  question: string;
  options?: string[];
  value: string;
  onChange: (value: string) => void;
  questionIndex: number;
}

export const SliderQuestion = ({
  question,
  options,
  value,
  onChange,
  questionIndex
}: SliderQuestionProps) => {
  // Parse options to get min, max, and step values
  // Options format: ["1", "10"] or ["0", "100", "5"] (min, max, step)
  const min = options && options.length > 0 ? parseInt(options[0]) : 1;
  const max = options && options.length > 1 ? parseInt(options[1]) : 10;
  const step = options && options.length > 2 ? parseInt(options[2]) : 1;

  const numericValue = value ? parseInt(value) : min;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium text-foreground">
        {question}
      </Label>

      <div className="space-y-3">
        <div className="px-3">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={numericValue}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        <div className="flex justify-between text-sm text-muted-foreground px-3">
          <span>{min}</span>
          <span className="font-medium text-foreground">
            Current: {numericValue}
          </span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
};
