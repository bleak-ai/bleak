import React from "react";

/**
 * Simple question configuration interface
 * Define your question types once, use directly everywhere
 */
export interface QuestionConfig {
  [questionType: string]: {
    component: React.ComponentType<any>;
    description: string;
  };
}

/**
 * Helper type to extract question type names from config
 */
export type QuestionTypeFromConfig<T extends QuestionConfig> = keyof T;

/**
 * Helper to get component registry from config
 * No conversion needed - just access .component from each entry
 */
export type ComponentRegistry<T extends QuestionConfig> = {
  [K in keyof T]: T[K]["component"];
};

/**
 * Helper to get element definitions from config
 * No conversion needed - just access .description from each entry
 */
export type ElementDefinitions<T extends QuestionConfig> = {
  [K in keyof T]: {
    name: K;
    description: T[K]["description"];
  };
}[keyof T][];
