import React from "react";

interface TextInputProps {
  text: string;
  options?: string[] | null;
  value?: string | string[];
  onChange: (value: string) => void;
  required?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  text,
  value,
  onChange,
  required = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-3">
      <label className="label">
        <span className="label-text text-lg font-semibold">
          {text}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>
      <input
        type="text"
        value={typeof value === "string" ? value : ""}
        onChange={handleChange}
        className="input input-bordered input-primary w-full text-base"
        placeholder="Enter your answer..."
        required={required}
      />
    </div>
  );
};
