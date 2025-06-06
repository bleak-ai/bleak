import {useState, useEffect} from "react";

export function DeviceMockupFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  useEffect(() => {
    if (!isAutoplay) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, [isAutoplay]);

  const handleStepClick = (step: number) => {
    setIsAutoplay(false);
    setCurrentStep(step);
  };

  const screens = [
    {
      // Step 1: Customer reports internet issue
      content: (
        <div className="space-y-3 h-full">
          {/* Chat messages */}
          <div className="space-y-2">
            <div className="flex justify-end">
              <div
                className={`
                bg-primary text-primary-foreground px-3 py-2 rounded-lg max-w-xs transition-all duration-500
                ${
                  currentStep === 0
                    ? "opacity-100 translate-y-0"
                    : "opacity-60 scale-95"
                }
              `}
              >
                <div className="text-sm">
                  I have no internet connection, please help!
                </div>
              </div>
            </div>
          </div>
          {/* Typing indicator */}
          {currentStep === 0 && (
            <div className="flex">
              <div className="bg-muted px-3 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      // Step 2: Bleak AI responds with visual component generation
      content: (
        <div className="space-y-3 h-full">
          <div
            className={`
              flex transition-all duration-700
              ${
                currentStep === 1
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }
            `}
          >
            <div className="bg-card border border-border px-3 py-2 rounded-lg max-w-xs space-y-2 text-sm text-foreground">
              <p className="font-medium">🧠 Analyzing requirements...</p>
              <div className="text-xs text-muted-foreground">
                Identifying needed information components
              </div>
            </div>
          </div>

          {/* Visual Component Generation */}
          {currentStep === 1 && (
            <div className="space-y-3 mt-4">
              <div className="text-xs text-muted-foreground text-center">
                Generating dynamic components...
              </div>

              {/* Component Generation Animation */}
              <div className="space-y-2">
                {/* Customer ID Component */}
                <div>
                  <div className="flex items-center space-x-2 bg-muted border-2 border-dashed border-border rounded-lg p-2">
                    <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded text-xs font-medium">
                      📝
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-foreground">
                        Customer ID Input
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Auto-generated form field
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Router Status Component */}
                <div>
                  <div className="flex items-center space-x-2 bg-muted border-2 border-dashed border-border rounded-lg p-2">
                    <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded text-xs font-medium">
                      📡
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-foreground">
                        Router Status Selector
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Dynamic option component
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Address Component */}
                <div>
                  <div className="flex items-center space-x-2 bg-muted border-2 border-dashed border-border rounded-lg p-2">
                    <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded text-xs font-medium">
                      📍
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-foreground">
                        Address Lookup
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Smart address component
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Generation Complete Indicator */}
              <div>
                <div className="text-center mt-3">
                  <div className="inline-flex items-center space-x-2 bg-card border border-border rounded-full px-3 py-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="text-xs text-foreground font-medium">
                      Components ready for user input
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      // Step 3: Dynamic components appear and user interacts (Silent Edge theme)
      content: (
        <div className="space-y-2 h-full overflow-y-auto">
          {/* Dynamic Components with User Input */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              User fills automatically generated components
            </p>
            <div
              className={`
              bg-card border border-border rounded-lg p-3 transition-all duration-500
              ${
                currentStep === 2
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95"
              }
            `}
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="text-sm">📝</div>
                  <div className="text-xs font-medium text-foreground">
                    Customer ID
                  </div>
                </div>
                <div className="bg-input border border-border rounded p-2 text-xs">
                  <div className="flex items-center">
                    <span className="text-foreground font-medium">
                      CX1234567
                    </span>
                    {currentStep === 2 && (
                      <div className="w-0.5 h-3 bg-primary ml-1 animate-pulse"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`
              bg-card border border-border rounded-lg p-3 transition-all duration-500 delay-200
              ${
                currentStep === 2
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95"
              }
            `}
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="text-sm">📡</div>
                  <div className="text-xs font-medium text-foreground">
                    Router Status
                  </div>
                </div>
                <div className="space-y-1">
                  {[
                    "All lights on",
                    "No lights",
                    "Blinking red",
                    "Power light only"
                  ].map((status, i) => (
                    <div
                      key={status}
                      className={`
                        flex items-center px-2 py-1 rounded text-xs cursor-pointer transition-all duration-300
                        ${
                          i === 1
                            ? "bg-primary text-primary-foreground border border-border"
                            : "bg-input hover:bg-muted border border-border"
                        }
                      `}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          i === 1
                            ? "bg-primary-foreground"
                            : "bg-muted-foreground"
                        }`}
                      ></div>
                      <span
                        className={
                          i === 1
                            ? "text-primary-foreground"
                            : "text-foreground"
                        }
                      >
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              className={`
              bg-card border border-border rounded-lg p-3 transition-all duration-500 delay-400
              ${
                currentStep === 2
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95"
              }
            `}
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="text-sm">📍</div>
                  <div className="text-xs font-medium text-foreground">
                    Service Address
                  </div>
                </div>
                <div className="bg-input border border-border rounded p-2 text-xs">
                  <div className="flex items-center">
                    <span className="text-foreground font-medium">
                      123 Main Street, Tech City
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* User action indicators */}
            {currentStep === 2 && (
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-card border border-border rounded-full px-3 py-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="text-xs text-foreground font-medium">
                    User filling forms...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      // Step 4: Bleak AI generates complete answer (Silent Edge theme)
      content: (
        <div className="space-y-2 h-full">
          {/* Bleak AI Generated Solution */}
          <div
            className={`
            transition-all duration-700
            ${
              currentStep === 3
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }
          `}
          >
            <div className="bg-card border border-border rounded-lg p-3">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="text-sm">🧠</div>
                  <div className="text-xs font-medium text-foreground">
                    AI Generated Solution
                  </div>
                </div>

                <div className="bg-muted border border-border rounded p-3">
                  <div className="text-xs text-foreground leading-relaxed">
                    <strong className="text-primary">Issue Identified:</strong>{" "}
                    Router power failure at 123 Main Street for customer
                    CX1234567
                    <br />
                    <br />
                    <strong className="text-primary">
                      Recommended Solution:
                    </strong>
                    <br />• Power cycle the router (unplug for 30 seconds)
                    <br />• Check power adapter connection
                    <br />• Schedule technician visit if issue persists
                    <br />
                    <br />
                    <strong className="text-primary">Follow-up:</strong>{" "}
                    Automated dispatch system activated
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-2 pt-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="text-xs text-foreground font-medium">
                    Complete solution generated with all customer details
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-center">
        {/* Phone Mockup */}
        <div className="relative">
          {/* Phone Frame */}
          <div className="w-64 h-[400px] md:w-80 md:h-[650px] bg-card border-4 border-border rounded-[3rem] shadow-2xl relative overflow-hidden">
            {/* Phone Screen */}
            <div className="absolute inset-4 bg-background rounded-[2rem] overflow-hidden flex flex-col">
              {/* Status Bar */}
              <div className="h-6 bg-muted/50 flex items-center justify-between px-4 flex-shrink-0">
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                </div>
                <div className="text-xs text-foreground">12:34</div>
                <div className="flex items-center space-x-1">
                  <div className="text-xs text-foreground">100%</div>
                  <div className="w-4 h-2 border border-primary rounded-sm">
                    <div className="w-full h-full bg-primary rounded-sm"></div>
                  </div>
                </div>
              </div>

              {/* App Header */}
              <div className="h-12 bg-primary flex items-center justify-center flex-shrink-0">
                <div className="text-primary-foreground font-medium text-xs md:text-sm">
                  Example: Tech Support with Bleak
                </div>
              </div>

              {/* Content Area - Now flexible and scrollable */}
              <div className="flex-1 p-4 min-h-0">
                {screens[currentStep].content}
              </div>
            </div>

            {/* Phone Notch */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-card rounded-full"></div>
          </div>

          {/* Step Indicator - Now clickable */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-2">
              {[0, 1, 2, 3].map((step) => (
                <button
                  key={step}
                  onClick={() => handleStepClick(step)}
                  className={`
                    w-3 h-3 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer
                    ${
                      currentStep === step
                        ? "bg-primary scale-125"
                        : "bg-border hover:bg-muted-foreground"
                    }
                  `}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Step Labels with Bleak terminology - Now clickable */}
      <div className="mt-16 grid grid-cols-4 gap-4 text-center">
        {[
          {label: "Customer Issue", icon: "🌐"},
          {label: "Bleak Analyzes", icon: "🧠"},
          {label: "User Interaction", icon: "✍️"},
          {label: "AI Solution", icon: "⚡"}
        ].map((item, index) => (
          <button
            key={index}
            onClick={() => handleStepClick(index)}
            className={`
              transition-all duration-300 hover:scale-105 cursor-pointer p-2 rounded-lg
              ${
                currentStep === index
                  ? "text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="text-xs md:text-sm font-medium">{item.label}</div>
          </button>
        ))}
      </div>

      {/* Auto-play toggle */}
      <div className="mt-8 text-center">
        <button
          onClick={() => setIsAutoplay(!isAutoplay)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          {isAutoplay ? "⏸️ Pause auto-play" : "▶️ Resume auto-play"}
        </button>
      </div>
    </div>
  );
}
