import {Button} from "../ui/button";
import {ArrowRight, Palette, Layers, Zap, Github} from "lucide-react";
import {CodeBlock} from "../ui/code-block";

export default function Landing() {
  return (
    <div className="bg-white text-neutral-900">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Brand */}
          <div className="mb-12">
            <div className="flex items-center justify-center">
              <h1 className="text-7xl sm:text-8xl md:text-9xl font-light tracking-tight mb-4">
                Bleak
              </h1>
              <div className={`ml-4 duration-700 ease-out `}>
                <div className="w-16 h-16 sm:w-32 sm:h-32">
                  <img src="/bleaktree.png" alt="" className="w-full h-full" />
                </div>
              </div>
            </div>
            <div className="w-24 h-0.5 bg-neutral-900 mx-auto"></div>
          </div>

          {/* Core Message */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light leading-relaxed mb-8 text-neutral-700 max-w-4xl mx-auto">
            Transform conversational AI by generating{" "}
            <span className="text-neutral-900 font-medium">
              structured UI components
            </span>{" "}
            instead of plain text responses
          </h2>

          <p className="text-lg text-neutral-600 mb-16 max-w-2xl mx-auto leading-relaxed">
            Bridge the gap between natural language processing and structured
            data collection using your existing design systems and component
            libraries.
          </p>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <Button
              size="lg"
              className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4 text-base font-medium"
              onClick={() => (window.location.hash = "chat")}
            >
              Try the Demo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-neutral-300 text-neutral-900 hover:bg-neutral-50 px-8 py-4 text-base font-medium"
              onClick={() =>
                window.open("https://github.com/bleak-ai/bleak", "_blank")
              }
            >
              <Github className="w-4 h-4 mr-2" />
              View on GitHub
            </Button>
          </div>

          {/* Concept Preview */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-8">
              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
                    Traditional Chatbots
                  </h3>
                  <div className="bg-white rounded border p-4">
                    <p className="text-sm text-neutral-600">
                      "What's your experience level with programming? Please
                      choose from: Beginner, Intermediate, Advanced, Expert"
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
                    BleakAI Response
                  </h3>

                  <div className="bg-white rounded border p-4">
                    <label className="text-sm font-medium text-neutral-700 mb-2 block">
                      What's your experience level?
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="experience"
                          className="mr-2"
                        />
                        <span className="text-sm">Beginner</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="experience"
                          className="mr-2"
                          defaultChecked
                        />
                        <span className="text-sm">Intermediate</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="experience"
                          className="mr-2"
                        />
                        <span className="text-sm">Advanced</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 mt-4">
                    Here the AI model though the predefined radio component was
                    the more suited to formulate the question.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Philosophy */}
      <section className="py-32 px-6 bg-neutral-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-light mb-8 tracking-tight">
            Bring Your Own Components
          </h2>
          <p className="text-xl text-neutral-600 mb-16 leading-relaxed">
            BleakAI doesn't impose a specific UI framework or component library.
            We provide the intelligence layer while you maintain complete
            control over how components look and behave in your applications.
          </p>

          <div className="grid md:grid-cols-3 gap-12 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-4">Your Design System</h3>
              <p className="text-neutral-600 leading-relaxed">
                Use your existing custom components, design tokens, and styling
                approach. BleakAI adapts to your established design language and
                patterns.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-4">Framework Agnostic</h3>
              <p className="text-neutral-600 leading-relaxed">
                Works seamlessly with React, Vue, Angular, or any custom
                implementation. Pure logic, no framework dependencies.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-4">Simple Integration</h3>
              <p className="text-neutral-600 leading-relaxed">
                Map BleakAI element types to your components with a simple
                configuration object. No refactoring required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Component Mapping Examples */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-light mb-8 tracking-tight">
              Use Your Existing Components
            </h2>
            <p className="text-xl text-neutral-600 leading-relaxed">
              BleakAI provides the intelligence, you provide the presentation.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="text-left">
              <h3 className="text-2xl font-medium mb-6">
                Simple Configuration
              </h3>
              <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-6">
                <div className="overflow-x-auto">
                  <CodeBlock language="typescript">
                    {`// Map to your existing components
const config = {
  text: {
    component: YourTextInput, 
    description: "Use this Text Input  for free-form text input"
  },
  radio: {
    component: YourRadioGroup, 
    description: "Use this Radio Group  for single-choice elements with 2-5 predefined options"
  },
  slider: {
    component: YourSlider, 
    description: "Use this Slider  for numeric input, ratings, scales, or range selections"
  }
};

// Create resolver
const {resolve} = createResolverFromConfig(config);

// Use it
const {Component, props} = resolve(element, value, onChange);`}
                  </CodeBlock>
                </div>
              </div>
            </div>

            <div className="text-left">
              <h3 className="text-2xl font-medium mb-6">Your Components</h3>
              <div className="space-y-6">
                <div className="border border-neutral-200 rounded-lg p-6">
                  <h4 className="font-medium mb-2">Custom Design System</h4>
                  <p className="text-neutral-600 text-sm">
                    Your own TextInput, RadioGroup, Slider, Select components
                    with your styling
                  </p>
                </div>
                <div className="border border-neutral-200 rounded-lg p-6">
                  <h4 className="font-medium mb-2">Existing UI Library</h4>
                  <p className="text-neutral-600 text-sm">
                    Material-UI, Ant Design, Chakra UI, or any component library
                    you already use
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 px-6 bg-neutral-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-light mb-8 tracking-tight">
            Ready to Transform Your Conversations?
          </h2>
          <p className="text-xl text-neutral-600 mb-12 leading-relaxed">
            Start building intelligent interfaces with your existing components.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4 text-base font-medium"
              onClick={() => (window.location.hash = "chat")}
            >
              Experience It Live
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-neutral-300 text-neutral-900 hover:bg-neutral-50 px-8 py-4 text-base font-medium"
            >
              Read Documentation
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
