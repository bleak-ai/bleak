import {useState} from "react";
import {Button} from "../ui/button";
import {Input} from "../ui/input";
import {Label} from "../ui/label";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Sparkles,
  FileText,
  ShoppingBag,
  MapPin
} from "lucide-react";

interface ShowcaseExample {
  id: string;
  title: string;
  description: string;
  scenario: string;
  traditionalFlow: {
    aiQuestion: string;
    userTyping: string;
    problems: string[];
  };
  bleakFlow: {
    aiThinking: string;
    formComponents: React.ReactNode;
    benefits: string[];
  };
}

const examples: ShowcaseExample[] = [
  {
    id: "restaurant",
    title: "Restaurant Reservation",
    description: "AI needs booking details to make a reservation",
    scenario: "User: I want to book a table for dinner",
    traditionalFlow: {
      aiQuestion:
        "I can help you book a table. Can you please tell me: what date, what time, how many people, any dietary requirements, and your contact information?",
      userTyping:
        "Um, let me think... next Friday, around 7pm, for 4 people. My friend is vegetarian. My number is 555-0123 and email is john@email.com",
      problems: [
        "Easy to forget information",
        "Prone to errors and misunderstanding"
      ]
    },
    bleakFlow: {
      aiThinking:
        "I need structured booking information. Let me create the right form components.",
      formComponents: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Date</Label>
              <input
                type="date"
                className="w-full px-2 py-1 text-xs border rounded bg-background"
                defaultValue="2024-03-15"
              />
            </div>
            <div>
              <Label className="text-xs">Time</Label>
              <select className="w-full px-2 py-1 text-xs border rounded bg-background">
                <option>7:00 PM</option>
                <option>7:30 PM</option>
                <option>8:00 PM</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Party Size</Label>
              <select className="w-full px-2 py-1 text-xs border rounded bg-background">
                <option>4 people</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Phone</Label>
              <Input className="text-xs h-8" placeholder="555-0123" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Dietary Requirements</Label>
            <div className="flex gap-2 text-xs">
              <label className="flex items-center">
                <input type="checkbox" className="mr-1" checked readOnly />{" "}
                Vegetarian
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-1" /> Vegan
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-1" /> Gluten-free
              </label>
            </div>
          </div>
        </div>
      ),
      benefits: [
        "Clear, organized input fields",
        "Helps users add important information"
      ]
    }
  },
  {
    id: "product",
    title: "Product Configuration",
    description: "AI helps configure a laptop order",
    scenario: "User: I need to configure a laptop for my team",
    traditionalFlow: {
      aiQuestion:
        "I'll help you configure laptops. Please tell me: how many laptops, what specs (RAM, storage, processor), budget per unit, delivery timeline, and any special requirements?",
      userTyping:
        "We need 10 laptops, decent specs for development work, budget is around $1500 each, need them in 2 weeks, and they should have good keyboards",
      problems: [
        "Vague requirements like 'decent specs'",
        "Missing technical details",
        "Unclear delivery preferences",
        "AI must guess specifics"
      ]
    },
    bleakFlow: {
      aiThinking:
        "I need specific configuration details. Let me break this into clear options.",
      formComponents: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Quantity</Label>
              <Input className="text-xs h-8" defaultValue="10" />
            </div>
            <div>
              <Label className="text-xs">Budget per unit</Label>
              <input
                type="range"
                min="1000"
                max="2500"
                defaultValue="1500"
                className="w-full"
              />
              <div className="text-xs text-center">$1500</div>
            </div>
          </div>
          <div>
            <Label className="text-xs">RAM (Memory)</Label>
            <div className="flex gap-2">
              <button className="px-2 py-1 text-xs border rounded">8GB</button>
              <button className="px-2 py-1 text-xs border rounded bg-primary text-primary-foreground">
                16GB
              </button>
              <button className="px-2 py-1 text-xs border rounded">32GB</button>
            </div>
          </div>
          <div>
            <Label className="text-xs">Storage</Label>
            <div className="flex gap-2">
              <button className="px-2 py-1 text-xs border rounded">
                256GB SSD
              </button>
              <button className="px-2 py-1 text-xs border rounded bg-primary text-primary-foreground">
                512GB SSD
              </button>
              <button className="px-2 py-1 text-xs border rounded">
                1TB SSD
              </button>
            </div>
          </div>
          <div>
            <Label className="text-xs">Delivery</Label>
            <select className="w-full px-2 py-1 text-xs border rounded bg-background">
              <option>2 weeks (Standard)</option>
              <option>1 week (Rush +$50)</option>
              <option>3 days (Express +$150)</option>
            </select>
          </div>
        </div>
      ),
      benefits: [
        "Specific technical options",
        "Visual selection interface",
        "Budget constraints built-in",
        "Complete configuration captured"
      ]
    }
  },
  {
    id: "support",
    title: "Technical Support",
    description: "AI diagnoses a software issue",
    scenario: "User: My app keeps crashing, can you help?",
    traditionalFlow: {
      aiQuestion:
        "I can help troubleshoot. Please describe: what device you're using, when the crashes happen, what you were doing, any error messages, and what version of the app?",
      userTyping:
        "It's on my iPhone, happens sometimes when I open it, I think it's the latest version, no error messages just closes",
      problems: [
        "'Sometimes' is not specific",
        "Missing device details",
        "No reproduction steps",
        "Incomplete diagnostic info"
      ]
    },
    bleakFlow: {
      aiThinking:
        "I need systematic diagnostic information. Let me create a proper troubleshooting form.",
      formComponents: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Device</Label>
              <select className="w-full px-2 py-1 text-xs border rounded bg-background">
                <option>iPhone 14 Pro</option>
                <option>iPhone 13</option>
                <option>Android</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">App Version</Label>
              <Input
                className="text-xs h-8"
                placeholder="Auto-detected: v2.1.3"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">When does it crash?</Label>
            <div className="space-y-1 text-xs">
              <label className="flex items-center">
                <input type="checkbox" className="mr-1" checked readOnly /> On
                app startup
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-1" /> During specific
                features
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-1" /> After some time
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-1" /> Randomly
              </label>
            </div>
          </div>
          <div>
            <Label className="text-xs">Frequency</Label>
            <input
              type="range"
              min="1"
              max="10"
              defaultValue="6"
              className="w-full"
            />
            <div className="text-xs text-center">6/10 times</div>
          </div>
          <div>
            <Label className="text-xs">Last crash steps</Label>
            <textarea
              className="w-full px-2 py-1 text-xs border rounded bg-background h-16"
              placeholder="1. Opened app&#10;2. Tapped on profile&#10;3. App closed"
            ></textarea>
          </div>
        </div>
      ),
      benefits: [
        "Systematic diagnostic questions",
        "Precise frequency measurement",
        "Structured reproduction steps",
        "Complete technical context"
      ]
    }
  }
];

export const BleakShowcase = () => {
  const [currentExample, setCurrentExample] = useState(0);

  const example = examples[currentExample];

  const nextExample = () => {
    setCurrentExample((prev) => (prev + 1) % examples.length);
  };

  const prevExample = () => {
    setCurrentExample((prev) => (prev - 1 + examples.length) % examples.length);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl sm:text-5xl font-light mb-8 tracking-tight text-foreground">
          Stop Making Users Type Everything
        </h2>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto">
          When AI needs information, give users smart forms instead of text
          boxes. See how the same conversation becomes easier with the right
          components.
        </p>
      </div>

      {/* Example Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={prevExample}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex items-center gap-4">
          {examples.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentExample(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentExample ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={nextExample}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Current Example */}
      <div className="">
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-medium text-foreground">
              {example.title}
            </h3>
            <p className="text-muted-foreground">{example.description}</p>
          </div>
        </div>

        {/* Scenario */}
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-3 text-foreground">Scenario</h4>
          <div className="bg-background border border-border rounded-lg p-4">
            <p className="text-foreground font-medium">{example.scenario}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Traditional Approach */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h4 className="text-lg font-medium text-foreground">
                Without BleakAI
              </h4>
            </div>

            <div className="space-y-4">
              <div className="bg-background border border-border rounded-lg p-4">
                <p className="text-sm font-medium text-foreground mb-2">
                  🤖 AI asks everything at once:
                </p>
                <p className="text-sm text-muted-foreground">
                  {example.traditionalFlow.aiQuestion}
                </p>
              </div>

              <div className="bg-background border border-border rounded-lg p-4">
                <p className="text-sm font-medium text-foreground mb-2">
                  👤 User types manually:
                </p>
                <div className="bg-muted/30 p-3 rounded border-l-2 border-muted">
                  <p className="text-sm text-muted-foreground italic">
                    "{example.traditionalFlow.userTyping}"
                  </p>
                </div>
              </div>

              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm font-medium text-destructive mb-2">
                  Problems:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {example.traditionalFlow.problems.map((problem, index) => (
                    <li key={index}>❌ {problem}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* BleakAI Approach */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h4 className="text-lg font-medium text-foreground">
                With BleakAI
              </h4>
            </div>

            <div className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-primary font-medium mb-2">
                  🤖 AI generates smart form:
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  {example.bleakFlow.aiThinking}
                </p>
              </div>

              <div className="bg-background border border-border rounded-lg p-4">
                <p className="text-sm font-medium text-foreground mb-3">
                  ✨ Interactive Components:
                </p>
                {example.bleakFlow.formComponents}
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm font-medium text-primary mb-2">
                  Benefits:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {example.bleakFlow.benefits.map((benefit, index) => (
                    <li key={index}>✅ {benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
