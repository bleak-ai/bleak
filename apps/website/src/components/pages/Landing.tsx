import {Button} from "../ui/button";
import {ArrowRight, Github} from "lucide-react";
import {CodeBlock} from "../ui/code-block";
import {BleakShowcase} from "../demo/BleakShowcase";
import {DeviceMockupFlow} from "../flow";

export default function Landing() {
  return (
    <div className="bg-background text-foreground mt-16">
      {/* Hero Section - Silent Edge: Confident, minimal, purposeful */}
      <section className="min-h-screen flex items-center justify-center">
        <div className="container-max text-center">
          {/* Brand - Large, confident typography */}
          <div className="mb-16">
            <div className="flex items-center justify-center">
              <h1 className="text-7xl sm:text-8xl md:text-9xl font-light tracking-tight mb-4 text-foreground">
                Bleak
              </h1>
              <div className="ml-8 duration-700 ease-out">
                <div className="w-20 h-20 sm:w-32 sm:h-32">
                  <img
                    src="/bleaktreewhite.png"
                    alt=""
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Core Message - Clear hierarchy */}
          <div className="content-max space-y-8 mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light leading-relaxed text-muted-foreground">
              Stop making users type everything.{" "}
              <span className="text-foreground font-medium">
                Generate smart forms
              </span>{" "}
              when AI needs more information.
            </h2>

            <p className="text-lg text-muted-foreground text-max leading-relaxed">
              Turn "please tell me about..." into date pickers, sliders, and
              dropdowns. Get structured data instead of messy text.
            </p>
          </div>

          {/* Primary Actions - Confident placement */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-24">
            <Button
              size="lg"
              className="px-8 py-4 text-base font-medium interactive-scale"
              onClick={() => (window.location.href = "/chat")}
            >
              See It Work
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 text-base font-medium interactive-scale"
              onClick={() =>
                window.open("https://github.com/bleak-ai/bleak", "_blank")
              }
            >
              <Github className="w-4 h-4 mr-2" />
              View on GitHub
            </Button>
          </div>

          {/* Concept Preview - Clean comparison */}
          <div className="content-max">
            <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 text-left">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Normal AI
                  </h3>
                  <div className="bg-background rounded border border-border p-6 space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      "What's your experience level? Type: beginner,
                      intermediate, or advanced"
                    </p>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm border rounded bg-muted/30 text-muted-foreground"
                      placeholder="User types: intermediate i guess"
                      readOnly
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    BleakAI
                  </h3>
                  <div className="bg-background rounded border border-border p-6 space-y-4">
                    <label className="text-sm font-medium text-foreground block">
                      What's your experience level?
                    </label>
                    <div className="space-y-3">
                      {["Beginner", "Intermediate", "Advanced"].map(
                        (level, idx) => (
                          <div key={level} className="flex items-center">
                            <input
                              type="radio"
                              name="experience"
                              className="mr-3 accent-primary"
                              defaultChecked={idx === 1}
                              readOnly
                            />
                            <span className="text-sm text-foreground">
                              {level}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Perfect data, no parsing needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Visual Flow Section */}
      <section className="py-32 px-4 lg:px-16 bg-muted/20">
        <div className="container-max space-y-16">
          <div className="text-center space-y-6">
            <h2 className="font-light tracking-tight text-foreground">
              What is Bleak AI?
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed text-max">
              It helps you convert a normal AI helper into a smart form
              generator.
            </p>
          </div>

          {/* Flow Type Selector */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-lg border border-border bg-card p-1">
              <DeviceMockupFlow />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Showcase Section */}
      <section className="py-32 px-4 lg:px-16">
        <BleakShowcase />
      </section>

      {/* Core Philosophy - Generous spacing, clear hierarchy */}
      <section className="section-padding bg-muted/20">
        <div className="content-max text-center space-y-16">
          <div className="space-y-6">
            <h2 className="font-light tracking-tight text-foreground">
              Works With Your Components
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed text-max">
              BleakAI doesn't come with UI components. It generates the logic to
              use yours. Keep your design system, add smart form generation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            {[
              {
                title: "Your Style",
                description:
                  "Use your existing buttons, inputs, and dropdowns. BleakAI decides which ones to use when."
              },
              {
                title: "Any Stack",
                description:
                  "React, Vue, Svelte, vanilla JS. BleakAI generates component trees, you render them however you want."
              },
              {
                title: "5-Minute Setup",
                description:
                  "Map your components to form types. Start generating forms immediately."
              }
            ].map((feature) => (
              <div key={feature.title} className="text-center space-y-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                  <div className="w-8 h-8 bg-primary-foreground rounded-full" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Component Mapping Examples - Clear code example */}
      <section className="py-32 px-4 lg:px-16">
        <div className="container-max space-y-16">
          <div className="text-center space-y-6">
            <h2 className="font-light tracking-tight text-foreground">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed text-max">
              Tell BleakAI about your components. It picks the right ones for
              each situation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            <div className="space-y-6">
              <h3 className="text-2xl font-medium text-foreground">
                Component Mapping
              </h3>
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <CodeBlock language="typescript">
                    {`// Map your components to form types
const config = {
  text: {
    component: YourTextInput,
    description: "For text and messages"
  },
  select: {
    component: YourDropdown,
    description: "For 2-10 options"
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

// AI picks the right component
const form = generateForm(message, config);`}
                  </CodeBlock>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-medium text-foreground">
                Real Examples
              </h3>
              <div className="space-y-4">
                {[
                  {
                    question: "When do you want to meet?",
                    answer: "Date picker"
                  },
                  {
                    question: "How important is this to you?",
                    answer: "Slider from 1-10"
                  },
                  {
                    question: "Which features do you need?",
                    answer: "Checkboxes"
                  }
                ].map((example) => (
                  <div
                    key={example.question}
                    className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-2"
                  >
                    <h4 className="font-medium text-foreground">
                      "{example.question}"
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      → {example.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Strong, confident close */}
      <section className="py-32 px-4 lg:px-16 bg-muted/20">
        <div className="content-max text-center space-y-12">
          <div className="space-y-6">
            <h2 className="font-light tracking-tight text-foreground">
              Stop Parsing Messy Text
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed text-max">
              Get clean, structured data from the start. Build better AI
              experiences.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="px-8 py-4 text-base font-medium interactive-scale"
              onClick={() => (window.location.href = "/chat")}
            >
              Try BleakAI Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 text-base font-medium interactive-scale"
            >
              Read the Guide
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
