import {Label} from "../../ui/label";
import {logSliderConfig, logUserAnswer} from "../../../utils/logger";
import {useEffect, useRef} from "react";
import type {BleakElementProps} from "@bleakai/core";

export const SliderBleakElement = ({
  text,
  options,
  value,
  onChange
}: BleakElementProps) => {
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

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium text-foreground">{text}</Label>

      <div className="space-y-3">
        <div className="px-3">
          <input
            type="range"
            min={actualMin}
            max={actualMax}
            step={step}
            value={numericValue}
            onChange={handleSliderChange}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer 
                       slider::-webkit-slider-thumb:appearance-none 
                       slider::-webkit-slider-thumb:h-5 
                       slider::-webkit-slider-thumb:w-5 
                       slider::-webkit-slider-thumb:rounded-full 
                       slider::-webkit-slider-thumb:bg-blue-500
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                ((numericValue - actualMin) / (actualMax - actualMin)) * 100
              }%, #e5e7eb ${
                ((numericValue - actualMin) / (actualMax - actualMin)) * 100
              }%, #e5e7eb 100%)`
            }}
          />
        </div>

        <div className="flex justify-between text-sm text-muted-foreground px-3">
          <span>{actualMin}</span>
          <span className="font-medium text-foreground px-2 py-1 rounded">
            {numericValue}
          </span>
          <span>{actualMax}</span>
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
