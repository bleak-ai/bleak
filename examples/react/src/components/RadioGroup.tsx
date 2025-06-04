import React from "react";

interface RadioGroupProps {
  text: string;
  options?: string[] | null;
  value?: string | string[];
  onChange: (value: string) => void;
  required?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  text,
  options,
  value,
  onChange,
  required = false
}) => {
  const selectedValue = typeof value === "string" ? value : "";

  const handleChange = (option: string) => {
    onChange(option);
  };

  if (!options || options.length === 0) {
    return (
      <div className="space-y-3">
        <label className="label">
          <span className="label-text text-lg font-semibold">
            {text}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
        <div className="alert alert-warning">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span>No options available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="label">
        <span className="label-text text-lg font-semibold">
          {text}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="form-control">
            <label className="label cursor-pointer justify-start space-x-3 p-3 rounded-lg border border-base-300 hover:border-primary hover:bg-base-200 transition-all">
              <input
                type="radio"
                name={`radio-${text}-${index}`}
                className="radio radio-primary"
                checked={selectedValue === option}
                onChange={() => handleChange(option)}
              />
              <span className="label-text text-base">{option}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
