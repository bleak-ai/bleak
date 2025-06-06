<template>
  <div class="bleak-app">
    <header>
      <h1>AI Assistant - Vue Example</h1>
      <p>Get personalized help with step-by-step guidance</p>
    </header>

    <main>
      <!-- Debug Info -->
      <div v-if="debugMode" class="debug-info">
        <h3>Debug Info:</h3>
        <p>API Key: {{ apiKey ? "Set" : "Not set" }}</p>
        <p>Questions count: {{ questions?.length || 0 }}</p>
        <p>Answers count: {{ Object.keys(answers).length }}</p>
        <p>Session initialized: {{ !!bleak }}</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-message">
        <strong>Something went wrong:</strong>
        <p>{{ error.message }}</p>
        <button @click="dismissError">Try Again</button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading">
        <div class="spinner">Processing your request...</div>
      </div>

      <!-- Initial State: Prompt Input -->
      <div
        v-if="!questions && !finalAnswer && !isLoading"
        class="prompt-section"
      >
        <textarea
          v-model="prompt"
          rows="4"
          placeholder="What would you like help with today? Try: 'Help me plan a vacation' or 'I need to buy a laptop'"
          :disabled="isLoading"
        />
        <button
          @click="handleStartConversation"
          :disabled="isLoading || !prompt.trim()"
        >
          {{ isLoading ? "Getting started..." : "Get Started" }}
        </button>
        <button @click="toggleDebug" style="margin-left: 10px">
          {{ debugMode ? "Hide Debug" : "Show Debug" }}
        </button>
      </div>

      <!-- Questions State -->
      <div v-if="questions && !isLoading" class="questions-section">
        <h2>Help me understand better</h2>
        <p>
          Please answer these questions so I can provide the best assistance:
        </p>

        <div class="questions-list">
          <div v-if="questions.length === 0" class="no-questions">
            No questions generated. This might be because the prompt was too
            simple.
          </div>
          <component
            v-for="resolved in resolvedComponents"
            :key="resolved.key"
            :is="resolved.component"
            v-bind="resolved.props"
          />
        </div>

        <div class="action-buttons" v-if="questions.length > 0">
          <button
            @click="handleSubmitAnswers"
            :disabled="!allQuestionsAnswered || isLoading"
          >
            {{ isLoading ? "Processing..." : "Get My Answer" }}
          </button>
          <button
            @click="handleRequestMoreQuestions"
            :disabled="!allQuestionsAnswered || isLoading"
          >
            {{ isLoading ? "Processing..." : "I need to provide more details" }}
          </button>
        </div>
      </div>

      <!-- Final Answer State -->
      <div v-if="finalAnswer && !isLoading" class="answer-section">
        <h2>Here's your answer:</h2>
        <div class="answer-content">{{ finalAnswer }}</div>
        <button @click="resetAll">Ask Another Question</button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from "vue";
import {
  BleakSession,
  type InteractiveQuestion,
  type BleakInputProps,
  type BleakChoiceProps
} from "bleakai";

// Vue Component Definitions for BleakAI
const TextInput = {
  props: ["text", "value", "onChange"],
  template: `
    <div class="question-group">
      <label class="question-label">{{ text }}</label>
      <input
        type="text"
        :value="value || ''"
        @input="onChange($event.target.value)"
        :placeholder="'Enter ' + text.toLowerCase()"
        class="text-input"
      />
    </div>
  `
};

const RadioGroup = {
  props: ["text", "options", "value", "onChange"],
  template: `
    <div class="question-group">
      <label class="question-label">{{ text }}</label>
      <div class="radio-options">
        <label v-for="(option, i) in options" :key="i" class="radio-option">
          <input
            type="radio"
            :name="text.replace(/\\s+/g, '_')"
            :checked="value === option"
            @change="onChange(option)"
          />
          <span>{{ option }}</span>
        </label>
      </div>
    </div>
  `
};

const MultiSelect = {
  props: ["text", "options", "value", "onChange"],
  setup(props: any) {
    const selected = computed(() => {
      if (Array.isArray(props.value)) {
        return props.value;
      }
      return props.value ? props.value.split(", ").filter(Boolean) : [];
    });

    const toggleOption = (option: string) => {
      const newSelected = selected.value.includes(option)
        ? selected.value.filter((v: string) => v !== option)
        : [...selected.value, option];
      props.onChange(newSelected.join(", "));
    };

    return {selected, toggleOption};
  },
  template: `
    <div class="question-group">
      <label class="question-label">{{ text }}</label>
      <div class="checkbox-options">
        <label v-for="(option, i) in options" :key="i" class="checkbox-option">
          <input
            type="checkbox"
            :checked="selected.includes(option)"
            @change="toggleOption(option)"
          />
          <span>{{ option }}</span>
        </label>
      </div>
    </div>
  `
};

// Element Configuration
const elementConfig = {
  text: {
    component: TextInput,
    description: "Free-form text input for detailed responses"
  },
  radio: {
    component: RadioGroup,
    description: "Single choice selection from predefined options"
  },
  multi_select: {
    component: MultiSelect,
    description: "Multiple choice selection from available options"
  }
};

// State Management
const prompt = ref("");
const questions = ref<InteractiveQuestion[] | null>(null);
const answers = ref<Record<string, string>>({});
const finalAnswer = ref<string | null>(null);
const isLoading = ref(false);
const error = ref<Error | null>(null);
const debugMode = ref(false);
const apiKey = ref<string>("");

// BleakSession instance
let bleak: BleakSession;

onMounted(() => {
  // Get API key from environment
  apiKey.value = import.meta.env.VITE_BLEAK_API_KEY || "your-api-key";

  console.log("Initializing BleakSession...");
  console.log("API Key:", apiKey.value ? "Set" : "Not set");

  bleak = new BleakSession({
    apiKey: apiKey.value,
    baseUrl:
      import.meta.env.VITE_BLEAK_API_URL || "http://localhost:8008/bleak",
    timeout: 30000,
    elements: elementConfig
  });

  console.log("BleakSession initialized:", !!bleak);
});

// Computed Properties
const allQuestionsAnswered = computed(() => {
  return (
    questions.value?.every((q) => answers.value[q.question]?.trim()) || false
  );
});

const resolvedComponents = computed(() => {
  if (!questions.value || !bleak) {
    console.log("No questions or bleak session:", {
      questions: questions.value,
      bleak: !!bleak
    });
    return [];
  }

  console.log("Resolving components for questions:", questions.value);

  try {
    const components = bleak
      .getBleakComponents(questions.value, answers.value, handleAnswerChange)
      .map(({Component, props, key}) => ({
        component: Component,
        props,
        key
      }));

    console.log("Resolved components:", components);
    return components;
  } catch (err) {
    console.error("Error resolving components:", err);
    return [];
  }
});

// Event Handlers
const handleStartConversation = async () => {
  if (!prompt.value.trim()) return;

  console.log("Starting conversation with prompt:", prompt.value);

  isLoading.value = true;
  error.value = null;
  resetState();

  try {
    const result = await bleak.startBleakConversation(prompt.value);
    console.log("Conversation result:", result);

    if (result.questions && result.questions.length > 0) {
      console.log("Setting questions:", result.questions);
      questions.value = result.questions;
    } else if (result.answer) {
      console.log("Got direct answer:", result.answer);
      finalAnswer.value = result.answer;
    } else {
      console.log("No questions or answer in result");
    }
  } catch (err) {
    console.error("Error starting conversation:", err);
    error.value = err as Error;
  } finally {
    isLoading.value = false;
  }
};

const handleSubmitAnswers = async () => {
  if (!questions.value) return;

  console.log("Submitting answers:", answers.value);

  isLoading.value = true;
  error.value = null;

  try {
    const result = await bleak.finishBleakConversation(answers.value);
    console.log("Final answer:", result);
    finalAnswer.value = result;
    questions.value = null;
  } catch (err) {
    console.error("Error submitting answers:", err);
    error.value = err as Error;
  } finally {
    isLoading.value = false;
  }
};

const handleRequestMoreQuestions = async () => {
  if (!questions.value) return;

  console.log("Requesting more questions with answers:", answers.value);

  isLoading.value = true;
  error.value = null;

  try {
    const result = await bleak.requestMoreBleakQuestions(answers.value);
    console.log("More questions result:", result);

    if (result.questions) {
      questions.value = result.questions;
    } else if (result.isComplete) {
      const finalResult = await bleak.finishBleakConversation(answers.value);
      finalAnswer.value = finalResult;
      questions.value = null;
    }
  } catch (err) {
    console.error("Error requesting more questions:", err);
    error.value = err as Error;
  } finally {
    isLoading.value = false;
  }
};

const handleAnswerChange = (question: string, value: string) => {
  console.log("Answer changed:", {question, value});
  answers.value = {...answers.value, [question]: value};
};

const resetState = () => {
  questions.value = null;
  answers.value = {};
  finalAnswer.value = null;
};

const resetAll = () => {
  if (bleak) {
    bleak.resetBleakSession();
  }
  resetState();
  error.value = null;
  isLoading.value = false;
  prompt.value = "";
};

const dismissError = () => {
  error.value = null;
  isLoading.value = false;
};

const toggleDebug = () => {
  debugMode.value = !debugMode.value;
};
</script>

<style scoped>
/* Basic styles for the example */
.bleak-app {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

header {
  text-align: center;
  margin-bottom: 2rem;
}

.debug-info {
  padding: 1rem;
  background-color: #f0f8ff;
  border: 1px solid #b3d9ff;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.error-message {
  padding: 1rem;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  margin-bottom: 1rem;
  color: #c33;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.spinner {
  font-size: 1.1rem;
}

.prompt-section textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
  resize: vertical;
  box-sizing: border-box;
}

.prompt-section button,
.action-buttons button,
.answer-section button {
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
}

.prompt-section button:disabled,
.action-buttons button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.questions-section {
  margin: 2rem 0;
}

.questions-list {
  margin: 2rem 0;
}

.no-questions {
  padding: 1rem;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  color: #856404;
}

.question-group {
  margin-bottom: 1.5rem;
}

.question-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.text-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.radio-options,
.checkbox-options {
  margin-top: 0.5rem;
}

.radio-option,
.checkbox-option {
  display: block;
  margin: 0.5rem 0;
  font-weight: normal;
  cursor: pointer;
}

.radio-option input,
.checkbox-option input {
  margin-right: 0.5rem;
}

.action-buttons {
  margin-top: 2rem;
}

.answer-section {
  margin: 2rem 0;
}

.answer-content {
  padding: 1.5rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  margin: 1rem 0;
  white-space: pre-wrap;
  line-height: 1.6;
}
</style>
