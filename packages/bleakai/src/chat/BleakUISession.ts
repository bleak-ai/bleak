import type {BleakElement, InteractiveQuestion} from "./types";
import type {BleakElementConfig} from "../types/core";
import {createResolverFromConfig} from "../core/BleakResolver";
import {
  BleakCoreSession,
  type BleakCoreSessionConfig
} from "./BleakCoreSession";

export interface BleakUISessionConfig extends BleakCoreSessionConfig {
  elements?: BleakElementConfig;
}

/**
 * BleakUISession extends BleakCoreSession with UI component resolution
 * This class provides the getBleakComponents method for UI frameworks
 */
export class BleakUISession extends BleakCoreSession {
  private elementConfig?: BleakElementConfig;
  private resolver?: ReturnType<typeof createResolverFromConfig>;

  constructor(config: BleakUISessionConfig) {
    // Initialize parent with core config
    super(config);

    // Set up elements if provided
    if (config.elements) {
      this.elementConfig = config.elements;
      this.resolver = createResolverFromConfig(config.elements);
    }
  }

  /**
   * Convert Bleak questions into renderable components with proper props
   * This makes it easy to integrate with any UI framework
   */
  getBleakComponents(
    questions: InteractiveQuestion[],
    answers: Record<string, string> = {},
    onAnswerChange?: (question: string, value: string) => void
  ): Array<{
    question: InteractiveQuestion;
    Component: any;
    props: any;
    key: string;
  }> {
    if (!this.resolver) {
      throw new Error(
        "No components configured. Please provide an 'elements' configuration in the BleakUISession constructor."
      );
    }

    return questions.map((question, index) => {
      const resolution = this.resolver!.resolve(
        {
          type: question.type,
          text: question.question,
          options: question.options || null
        },
        answers[question.question] || "",
        onAnswerChange
          ? (value: string) => onAnswerChange(question.question, value)
          : () => {},
        index
      );
      const Component = this.elementConfig![resolution.componentKey].component;
      return {
        question,
        Component,
        props: resolution.props,
        key: `bleak-question-${index}-${question.question.replace(/\s+/g, "-")}`
      };
    });
  }

  /**
   * Override getBleakElements to provide element configuration to the API
   */
  protected getBleakElements(): BleakElement[] | undefined {
    return this.elementConfig
      ? Object.entries(this.elementConfig).map(([name, config]) => ({
          name,
          description: config.description
        }))
      : undefined;
  }
}
