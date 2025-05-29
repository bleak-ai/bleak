import React, {createContext, useContext, ReactNode} from "react";
import {BleakRenderer} from "../core/BleakRenderer";
import {BleakRendererConfig, QuestionComponentProps} from "../types";
import {ComponentType} from "react";

interface BleakContextValue {
  renderer: BleakRenderer;
  registerComponent: (
    type: string,
    component: ComponentType<QuestionComponentProps>
  ) => void;
  isSupportedType: (type: string) => boolean;
  getSupportedTypes: () => string[];
  updateConfig: (newConfig: Partial<BleakRendererConfig>) => void;
}

const BleakContext = createContext<BleakContextValue | null>(null);

interface BleakProviderProps {
  config: BleakRendererConfig;
  children: ReactNode;
}

/**
 * Provider component that makes BleakRenderer available to child components
 */
export const BleakProvider: React.FC<BleakProviderProps> = ({
  config,
  children
}) => {
  console.log("BleakProvider", config);
  const [renderer] = React.useState(() => new BleakRenderer(config));

  const contextValue: BleakContextValue = {
    renderer,
    registerComponent: (
      type: string,
      component: ComponentType<QuestionComponentProps>
    ) => {
      renderer.registerComponent(type, component);
    },
    isSupportedType: (type: string) => renderer.isSupportedType(type),
    getSupportedTypes: () => renderer.getSupportedTypes(),
    updateConfig: (newConfig: Partial<BleakRendererConfig>) => {
      renderer.updateConfig(newConfig);
    }
  };

  return (
    <BleakContext.Provider value={contextValue}>
      {children}
    </BleakContext.Provider>
  );
};

/**
 * Hook to access the BleakRenderer from context
 */
export const useBleakContext = (): BleakContextValue => {
  const context = useContext(BleakContext);
  if (!context) {
    throw new Error("useBleakContext must be used within a BleakProvider");
  }
  return context;
};

/**
 * Enhanced DynamicQuestionRenderer that uses context
 */
export const ContextualDynamicQuestionRenderer: React.FC<{
  question: {type: string; question: string; options?: string[]};
  value: string;
  onChange: (value: string) => void;
  questionIndex?: number;
}> = ({question, value, onChange, questionIndex}) => {
  const {renderer} = useBleakContext();

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
