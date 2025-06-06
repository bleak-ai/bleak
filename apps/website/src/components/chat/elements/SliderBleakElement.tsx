import {Label} from "../../ui/label";
import {logSliderConfig, logUserAnswer} from "../../../utils/logger";
import {useEffect, useRef} from "react";
import type {BleakChoiceProps} from "bleakai";

export const SliderBleakElement = ({
  text,
  options,
  value,
  onChange
}: BleakChoiceProps) => {
  const hasLoggedConfig = useRef(false);
  const lastLoggedValue = useRef<string>("");

  // Parse options to get min, max, and step values
  // Options format: ["1", "10"] or ["0", "100", "5"] (min, max, step)
  const min = options && options.length > 0 ? parseInt(options[0]) || 1 : 1;
  const max = options && options.length > 1 ? parseInt(options[1]) || 10 : 10;
  const step = options && options.length > 2 ? parseInt(options[2]) || 1 : 1;

  // Ensure min < max
  const actualMin = Math.min(min, max);
  const actualMax = Math.max(min, max);

  // Parse current value, ensure it's within bounds
  let numericValue = value ? parseInt(value) : actualMin;
  if (isNaN(numericValue)) {
    numericValue = actualMin;
  }
  numericValue = Math.max(actualMin, Math.min(actualMax, numericValue));

  // Log slider configuration only once on mount
  useEffect(() => {
    if (!hasLoggedConfig.current) {
      logSliderConfig(actualMin, actualMax, step, numericValue);
      hasLoggedConfig.current = true;
    }
  }, [actualMin, actualMax, step, numericValue]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Only log significant changes (not every small movement)
    if (
      newValue !== lastLoggedValue.current &&
      Math.abs(parseInt(newValue) - parseInt(lastLoggedValue.current || "0")) >=
        step
    ) {
      logUserAnswer(text, newValue, "slider");
      lastLoggedValue.current = newValue;
    }
  };

  // Initialize with min value if no value is set
  if (!value || value === "") {
    onChange(actualMin.toString());
  }

  // Calculate progress percentage for the slider
  const progressPercentage =
    ((numericValue - actualMin) / (actualMax - actualMin)) * 100;

  return (
    <div className="space-y-4 p-4 rounded-lg border border-border bg-card">
      <Label className="text-base font-medium text-foreground">{text}</Label>

      <div className="space-y-4">
        <div className="px-3">
          <input
            type="range"
            min={actualMin}
            max={actualMax}
            step={step}
            value={numericValue}
            onChange={handleSliderChange}
            className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer 
                       [&::-webkit-slider-thumb]:appearance-none 
                       [&::-webkit-slider-thumb]:h-6 
                       [&::-webkit-slider-thumb]:w-6 
                       [&::-webkit-slider-thumb]:rounded-full 
                       [&::-webkit-slider-thumb]:bg-primary
                       [&::-webkit-slider-thumb]:shadow-lg
                       [&::-webkit-slider-thumb]:hover:scale-110
                       [&::-webkit-slider-thumb]:transition-transform
                       focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${progressPercentage}%, hsl(var(--border)) ${progressPercentage}%, hsl(var(--border)) 100%)`
            }}
          />
        </div>

        <div className="flex justify-between text-sm text-muted-foreground px-3">
          <span className="font-medium">{actualMin}</span>
          <span className="font-bold text-lg text-foreground bg-primary text-primary-foreground px-3 py-1 rounded-md shadow-sm">
            {numericValue}
          </span>
          <span className="font-medium">{actualMax}</span>
        </div>

        {/* Show step info if it's not 1 */}
        {step !== 1 && (
          <div className="text-xs text-muted-foreground text-center">
            Step: {step}
          </div>
        )}
      </div>
    </div>
  );
};
