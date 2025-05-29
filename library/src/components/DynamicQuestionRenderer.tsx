import React from "react";
import {BleakRenderer} from "../core/BleakRenderer";
import {DynamicQuestionRendererProps} from "../types";

/**
 * React component for rendering dynamic questions
 * This component uses the BleakRenderer core logic
 */
export const DynamicQuestionRenderer: React.FC<
  DynamicQuestionRendererProps
> = ({question, value, onChange, questionIndex, config}) => {
  // Use a global renderer instance or create one if config is provided
  if (!config) {
    throw new Error(
      "DynamicQuestionRenderer requires a config object. Use useBleakRenderer hook or pass config directly."
    );
  }

  // Create a temporary renderer with the provided config
  const renderer = new BleakRenderer({
    components: {},
    ...config
  });

  try {
    const {Component, props} = renderer.getComponent(
      question,
      value,
      onChange,
      questionIndex
    );

    return <Component {...props} />;
  } catch (error) {
    console.error("Error rendering question:", error);

    // Return a simple error display if something goes wrong
    return (
      <div
        style={{
          padding: "16px",
          border: "1px solid #ff6b6b",
          borderRadius: "4px",
          color: "#ff6b6b"
        }}
      >
        <strong>Error:</strong>{" "}
        {error instanceof Error ? error.message : "Unknown error occurred"}
      </div>
    );
  }
};
