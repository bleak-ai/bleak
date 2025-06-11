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
 * This class provides the resolveComponents method for UI frameworks
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
   * Resolve questions to components with static configuration
   * Returns components and their static props, leaving state management to the consumer
   *
   * @param questions - The questions to resolve
   * @returns Array of component configurations with static props
   */
  resolveComponents(questions: InteractiveQuestion[]): Array<{
    Component: any;
    staticProps: {
      text: string;
      options?: string[] | null;
      uniqueId: string;
      elementIndex: number;
    };
    question: InteractiveQuestion;
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
        "", // Empty value - state management is handled by consumer
        () => {}, // Empty onChange - state management is handled by consumer
        index
      );

      const Component = this.elementConfig![resolution.componentKey].component;

      // Extract only static props (no value or onChange)
      const staticProps = {
        text: resolution.props.text,
        options: resolution.props.options,
        uniqueId: resolution.props.uniqueId,
        elementIndex: resolution.props.elementIndex
      };

      return {
        Component,
        staticProps,
        question
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
