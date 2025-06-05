// Default components for BleakAI
// These provide immediate functionality without requiring custom component setup

import type {ComponentProps} from "../types/components";

/**
 * Simple text input component that can be used directly
 */
export function BleakText({question, value = "", onChange}: ComponentProps) {
  const element = document.createElement("div");
  element.innerHTML = `
    <div style="margin-bottom: 16px;">
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">${question}</label>
      <input 
        type="text" 
        value="${value}" 
        placeholder="${question}"
        style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
      />
    </div>
  `;

  const input = element.querySelector("input") as HTMLInputElement;
  input.addEventListener("input", (e) => {
    onChange((e.target as HTMLInputElement).value);
  });

  return element;
}

/**
 * Simple radio group component that can be used directly
 */
export function BleakRadio({
  question,
  value = "",
  onChange,
  options = []
}: ComponentProps) {
  const element = document.createElement("div");
  element.style.marginBottom = "16px";

  const label = document.createElement("label");
  label.textContent = question;
  label.style.display = "block";
  label.style.marginBottom = "8px";
  label.style.fontWeight = "bold";
  element.appendChild(label);

  options.forEach((option, index) => {
    const optionDiv = document.createElement("div");
    optionDiv.style.marginBottom = "4px";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = question.replace(/\s+/g, "_");
    input.value = option;
    input.checked = value === option;
    input.style.marginRight = "8px";

    const span = document.createElement("span");
    span.textContent = option;

    input.addEventListener("change", () => {
      if (input.checked) {
        onChange(option);
      }
    });

    optionDiv.appendChild(input);
    optionDiv.appendChild(span);
    element.appendChild(optionDiv);
  });

  return element;
}

/**
 * Default component mapping using the built-in components
 * Use this as a starting point or reference for your own mapping
 */
export const defaultComponents = {
  text: {
    component: BleakText,
    description:
      "Use text for open-ended elements requiring free-form text input. Best for: names, descriptions, explanations, specific details, custom responses (e.g., 'What is your company name?', 'Describe your requirements', 'Any additional comments?'). Never provide options array."
  },
  radio: {
    component: BleakRadio,
    description:
      "Use radio for single-choice elements with 2-5 predefined options. Best for: yes/no elements, multiple choice with exclusive selection, categorical choices (e.g., 'What is your experience level?', 'Which option do you prefer?', 'Are you satisfied?'). Always provide options array."
  }
};

// Keep the old export for backward compatibility
/**
 * @deprecated Use `defaultComponents` instead
 */
export const DEFAULT_BLEAK_ELEMENTS = defaultComponents;
