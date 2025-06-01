import {Button} from "../ui/button";
import {ArrowRight, Palette, Layers, Zap, Github} from "lucide-react";
import {CodeBlock} from "../ui/code-block";
import {BleakShowcase} from "../demo/BleakShowcase";

export default function Landing() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Brand */}
          <div className="mb-12">
            <div className="flex items-center justify-center">
              <h1 className="text-7xl sm:text-8xl md:text-9xl font-light tracking-tight mb-4 text-foreground">
                Bleak
              </h1>
              <div className={`ml-4 duration-700 ease-out `}>
                <div className="w-16 h-16 sm:w-32 sm:h-32">
                  <img
                    src="/bleaktreewhite.png"
                    alt=""
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Core Message */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light leading-relaxed mb-8 text-muted-foreground max-w-4xl mx-auto">
            Stop making users type everything.{" "}
            <span className="text-foreground font-medium">
              Generate smart forms
            </span>{" "}
            when AI needs more information.
          </h2>

          <p className="text-lg text-muted-foreground mb-16 max-w-2xl mx-auto leading-relaxed">
            Turn "please tell me about..." into date pickers, sliders, and
            dropdowns. Get structured data instead of messy text.
          </p>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <Button
              size="lg"
              className="px-8 py-4 text-base font-medium"
              onClick={() => (window.location.hash = "chat")}
            >
              See It Work
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 text-base font-medium"
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
            <div className="bg-card rounded-lg border border-border p-8">
              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Normal AI
                  </h3>
                  <div className="bg-background rounded border border-border p-4">
                    <p className="text-sm text-muted-foreground">
                      "What's your experience level? Type: beginner,
                      intermediate, or advanced"
                    </p>
                    <input
                      type="text"
                      className="w-full mt-2 px-2 py-1 text-xs border rounded bg-muted/30"
                      placeholder="User types: intermediate i guess"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    BleakAI
                  </h3>

                  <div className="bg-background rounded border border-border p-4">
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      What's your experience level?
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="experience"
                          className="mr-2 accent-primary"
                        />
                        <span className="text-sm text-foreground">
                          Beginner
                        </span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="experience"
                          className="mr-2 accent-primary"
                          defaultChecked
                        />
                        <span className="text-sm text-foreground">
                          Intermediate
                        </span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="experience"
                          className="mr-2 accent-primary"
                        />
                        <span className="text-sm text-foreground">
                          Advanced
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Perfect data, no parsing needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Showcase Section */}
      <section className="py-32 px-6">
        <BleakShowcase />
      </section>

      {/* Core Philosophy */}
      <section className="py-32 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-light mb-8 tracking-tight text-foreground">
            Works With Your Components
          </h2>
          <p className="text-xl text-muted-foreground mb-16 leading-relaxed">
            BleakAI doesn't come with UI components. It generates the logic to
            use yours. Keep your design system, add smart form generation.
          </p>

          <div className="grid md:grid-cols-3 gap-12 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Palette className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-4 text-foreground">
                Your Style
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Use your existing buttons, inputs, and dropdowns. BleakAI
                decides which ones to use when.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Layers className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-4 text-foreground">
                Any Stack
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                React, Vue, Svelte, vanilla JS. BleakAI generates component
                trees, you render them however you want.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-4 text-foreground">
                5-Minute Setup
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Map your components to form types. Start generating forms
                immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Component Mapping Examples */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-light mb-8 tracking-tight text-foreground">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Tell BleakAI about your components. It picks the right ones for
              each situation.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="text-left">
              <h3 className="text-2xl font-medium mb-6 text-foreground">
                Component Mapping
              </h3>
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="overflow-x-auto">
                  <CodeBlock language="typescript">
                    {`// Tell BleakAI about your components
const config = {
  text: {
    component: YourTextInput,
    description: "For text input and messages"
  },
  select: {
    component: YourDropdown,
    description: "For choosing from 2-10 options"
  },
  date: {
    component: YourDatePicker,
    description: "For dates and times"
  },
  slider: {
    component: YourSlider,
    description: "For numbers and ranges"
  }
};

// AI picks the right component for each question
const form = generateForm(userMessage, config);`}
                  </CodeBlock>
                </div>
              </div>
            </div>

            <div className="text-left">
              <h3 className="text-2xl font-medium mb-6 text-foreground">
                Real Examples
              </h3>
              <div className="space-y-6">
                <div className="border border-border rounded-lg p-6 bg-card">
                  <h4 className="font-medium mb-2 text-foreground">
                    "When do you want to meet?"
                  </h4>
                  <p className="text-muted-foreground text-sm">→ Date picker</p>
                </div>
                <div className="border border-border rounded-lg p-6 bg-card">
                  <h4 className="font-medium mb-2 text-foreground">
                    "How important is this to you?"
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    → Slider from 1-10
                  </p>
                </div>
                <div className="border border-border rounded-lg p-6 bg-card">
                  <h4 className="font-medium mb-2 text-foreground">
                    "Which features do you need?"
                  </h4>
                  <p className="text-muted-foreground text-sm">→ Checkboxes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-light mb-8 tracking-tight text-foreground">
            Stop Parsing Messy Text
          </h2>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            Get clean, structured data from the start. Build better AI
            experiences.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              className="px-8 py-4 text-base font-medium"
              onClick={() => (window.location.hash = "chat")}
            >
              Try BleakAI Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 text-base font-medium"
            >
              Read the Guide
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
