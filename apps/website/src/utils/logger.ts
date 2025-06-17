import type {BleakQuestion, AnsweredQuestion} from "bleakai";

// Enhanced logging utility for frontend debugging
class FrontendLogger {
  private isDevelopment = process.env.NODE_ENV === "development";

  // Color styles for console output
  private styles = {
    section:
      "background: #2563eb; color: white; padding: 2px 8px; border-radius: 3px; font-weight: bold;",
    success:
      "background: #16a34a; color: white; padding: 2px 8px; border-radius: 3px;",
    warning:
      "background: #ea580c; color: white; padding: 2px 8px; border-radius: 3px;",
    error:
      "background: #dc2626; color: white; padding: 2px 8px; border-radius: 3px;",
    info: "background: #0891b2; color: white; padding: 2px 8px; border-radius: 3px;",
    component:
      "background: #7c3aed; color: white; padding: 2px 8px; border-radius: 3px;",
    api: "background: #059669; color: white; padding: 2px 8px; border-radius: 3px;"
  };

  private log(level: keyof typeof this.styles, message: string, data?: any) {
    if (!this.isDevelopment) return;

    console.log(`%c${message}`, this.styles[level]);
    if (data) {
      console.log(data);
    }
  }

  section(title: string) {
    if (!this.isDevelopment) return;
    console.log(`%c🔧 ${title.toUpperCase()}`, this.styles.section);
  }

  success(message: string, data?: any) {
    this.log("success", `✅ ${message}`, data);
  }

  warning(message: string, data?: any) {
    this.log("warning", `⚠️ ${message}`, data);
  }

  error(message: string, data?: any) {
    this.log("error", `❌ ${message}`, data);
  }

  info(message: string, data?: any) {
    this.log("info", `ℹ️ ${message}`, data);
  }

  component(message: string, data?: any) {
    this.log("component", `🎨 ${message}`, data);
  }

  api(message: string, data?: any) {
    this.log("api", `🌐 ${message}`, data);
  }

  // Specific logging methods for common scenarios

  logQuestionMapping(questions: BleakQuestion[]) {
    this.section("Question Mapping");

    const summary = questions.map(
      (q, i) => `${i + 1}. ${q.type}: ${q.question.substring(0, 50)}...`
    );
    console.log(summary.join("\n"));
  }

  logComponentRender(
    questionType: string,
    componentName: string,
    _questionIndex: number
  ) {
    // Only log fallbacks and errors, not every render
    if (componentName === "TextQuestion" && questionType !== "text") {
      this.warning(`Fallback: ${questionType} → ${componentName}`);
    }
  }

  logComponentFallback(
    questionType: string,
    fallbackComponent: string,
    _reason: string
  ) {
    this.warning(`Component Fallback: ${questionType} → ${fallbackComponent}`);
  }

  logUserAnswer(_question: string, answer: string, questionType: string) {
    // Only log significant answers, not every keystroke
    if (answer && answer.length > 0) {
      this.info(
        `Answer: ${questionType} = "${answer.substring(0, 30)}${
          answer.length > 30 ? "..." : ""
        }"`
      );
    }
  }

  logApiCall(endpoint: string, _payload: any, response?: any) {
    const endpointName = endpoint.split("/").pop() || endpoint;
    this.api(`${endpointName.toUpperCase()}`);

    if (response?.questions) {
      console.log(`📥 Got ${response.questions.length} questions`);
    } else if (response?.answer) {
      console.log(`📥 Got answer (${response.answer.length} chars)`);
    }
  }

  logSessionFlow(step: string, details: any) {
    this.section(step);

    // Only log essential details
    if (details.questions_count) {
      console.log(`Questions: ${details.questions_count}`);
    }
    if (details.thread_id) {
      console.log(`Thread: ${details.thread_id.substring(0, 8)}...`);
    }
  }

  logAnsweredQuestions(answeredQuestions: AnsweredQuestion[]) {
    this.success(`Answered ${answeredQuestions.length} questions`);
  }

  logComponentRegistry(registry: Record<string, any>) {
    this.info(`Component Registry: ${Object.keys(registry).length} types`);
  }

  logSliderConfig(
    min: number,
    max: number,
    step: number,
    _questionIndex: number
  ) {
    // Only log once when component mounts, not on every change
    if (min === min) {
      this.component(`Slider: ${min}-${max} (step: ${step})`);
    }
  }

  logMultiSelectState(selectedOptions: string[], totalOptions: number) {
    // Only log when selection changes significantly
    if (selectedOptions.length > 0) {
      this.component(
        `MultiSelect: ${selectedOptions.length}/${totalOptions} selected`
      );
    }
  }

  // Performance logging
  logPerformance(operation: string, startTime: number) {
    if (!this.isDevelopment) return;

    const duration = performance.now() - startTime;
    if (duration > 100) {
      // Only log slow operations
      this.warning(`Slow: ${operation} took ${duration.toFixed(0)}ms`);
    }
  }

  // Error logging with context
  logErrorWithContext(error: Error, context: Record<string, any>) {
    this.error(`Error: ${error.message}`);
    console.log("Context:", context);
  }

  logCustomTypeMatch(
    questionType: string,
    mappedType: string,
    _reason: string
  ) {
    this.info(`Type mapping: ${questionType} → ${mappedType}`);
  }
}

// Global logger instance
export const frontendLogger = new FrontendLogger();

// Convenience functions
export const logQuestionMapping = (questions: BleakQuestion[]) =>
  frontendLogger.logQuestionMapping(questions);

export const logComponentRender = (
  questionType: string,
  componentName: string,
  _questionIndex: number
) =>
  frontendLogger.logComponentRender(
    questionType,
    componentName,
    _questionIndex
  );

export const logComponentFallback = (
  questionType: string,
  fallbackComponent: string,
  _reason: string
) =>
  frontendLogger.logComponentFallback(questionType, fallbackComponent, _reason);

export const logUserAnswer = (
  question: string,
  answer: string,
  questionType: string
) => frontendLogger.logUserAnswer(question, answer, questionType);

export const logApiCall = (endpoint: string, payload: any, response?: any) =>
  frontendLogger.logApiCall(endpoint, payload, response);

export const logSessionFlow = (step: string, details: any) =>
  frontendLogger.logSessionFlow(step, details);

export const logAnsweredQuestions = (answeredQuestions: AnsweredQuestion[]) =>
  frontendLogger.logAnsweredQuestions(answeredQuestions);

export const logComponentRegistry = (registry: Record<string, any>) =>
  frontendLogger.logComponentRegistry(registry);

export const logSliderConfig = (
  min: number,
  max: number,
  step: number,
  currentValue: number
) => frontendLogger.logSliderConfig(min, max, step, currentValue);

export const logMultiSelectState = (
  selectedOptions: string[],
  totalOptions: number
) => frontendLogger.logMultiSelectState(selectedOptions, totalOptions);

export const logPerformance = (operation: string, startTime: number) =>
  frontendLogger.logPerformance(operation, startTime);

export const logErrorWithContext = (
  error: Error,
  context: Record<string, any>
) => frontendLogger.logErrorWithContext(error, context);
