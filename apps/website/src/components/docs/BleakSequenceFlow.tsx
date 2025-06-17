import React from "react";

const BleakSequenceFlow = () => (
  <div style={{margin: "20px 0"}}>
    <div
      style={{
        padding: "24px",
        border: "2px solid #e2e8f0",
        borderRadius: "12px",
        backgroundColor: "#f8fafc"
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontSize: "18px",
          fontWeight: "600",
          color: "#1e293b",
          marginBottom: "24px"
        }}
      >
        BleakAI Conversation Flow
      </div>

      {/* Step-by-step flow */}
      <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
        {/* Step 1 */}
        <div style={{display: "flex", alignItems: "center", gap: "16px"}}>
          <div
            style={{
              minWidth: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#3b82f6",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "600"
            }}
          >
            1
          </div>
          <div
            style={{
              flex: 1,
              padding: "16px",
              backgroundColor: "#dbeafe",
              borderRadius: "8px"
            }}
          >
            <div
              style={{fontWeight: "600", color: "#1e40af", marginBottom: "4px"}}
            >
              Setup & Configuration
            </div>
            <div style={{fontSize: "14px", color: "#374151"}}>
              Define your components → Create BleakSession → Configure API key
            </div>
          </div>
        </div>

        {/* Arrow down */}
        <div style={{textAlign: "center", color: "#6b7280", fontSize: "20px"}}>
          ↓
        </div>

        {/* Step 2 */}
        <div style={{display: "flex", alignItems: "center", gap: "16px"}}>
          <div
            style={{
              minWidth: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#22c55e",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "600"
            }}
          >
            2
          </div>
          <div
            style={{
              flex: 1,
              padding: "16px",
              backgroundColor: "#dcfce7",
              borderRadius: "8px"
            }}
          >
            <div
              style={{fontWeight: "600", color: "#15803d", marginBottom: "4px"}}
            >
              Start Conversation
            </div>
            <div style={{fontSize: "14px", color: "#374151"}}>
              <code
                style={{
                  backgroundColor: "#f3f4f6",
                  padding: "2px 6px",
                  borderRadius: "4px"
                }}
              >
                startBleakConversation(prompt)
              </code>{" "}
              → Backend generates questions
            </div>
          </div>
        </div>

        {/* Arrow down */}
        <div style={{textAlign: "center", color: "#6b7280", fontSize: "20px"}}>
          ↓
        </div>

        {/* Step 3 */}
        <div style={{display: "flex", alignItems: "center", gap: "16px"}}>
          <div
            style={{
              minWidth: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#8b5cf6",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "600"
            }}
          >
            3
          </div>
          <div
            style={{
              flex: 1,
              padding: "16px",
              backgroundColor: "#ede9fe",
              borderRadius: "8px"
            }}
          >
            <div
              style={{fontWeight: "600", color: "#7c3aed", marginBottom: "4px"}}
            >
              Resolve & Render
            </div>
            <div style={{fontSize: "14px", color: "#374151"}}>
              <code
                style={{
                  backgroundColor: "#f3f4f6",
                  padding: "2px 6px",
                  borderRadius: "4px"
                }}
              >
                resolveComponents(questions)
              </code>{" "}
              → Render your custom UI components
            </div>
          </div>
        </div>

        {/* Arrow down */}
        <div style={{textAlign: "center", color: "#6b7280", fontSize: "20px"}}>
          ↓
        </div>

        {/* Step 4 */}
        <div style={{display: "flex", alignItems: "center", gap: "16px"}}>
          <div
            style={{
              minWidth: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#f59e0b",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "600"
            }}
          >
            4
          </div>
          <div
            style={{
              flex: 1,
              padding: "16px",
              backgroundColor: "#fef3c7",
              borderRadius: "8px"
            }}
          >
            <div
              style={{fontWeight: "600", color: "#d97706", marginBottom: "4px"}}
            >
              User Interaction
            </div>
            <div style={{fontSize: "14px", color: "#374151"}}>
              User fills out the form → Collect answers → Decide next step
            </div>
          </div>
        </div>

        {/* Branching arrows */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "40px",
            margin: "8px 0"
          }}
        >
          <div
            style={{textAlign: "center", color: "#6b7280", fontSize: "16px"}}
          >
            ↙️ Need more questions?
          </div>
          <div
            style={{textAlign: "center", color: "#6b7280", fontSize: "16px"}}
          >
            ↘️ Ready to finish?
          </div>
        </div>

        {/* Step 5a & 5b */}
        <div style={{display: "flex", gap: "16px"}}>
          {/* Continue path */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <div
              style={{
                minWidth: "35px",
                height: "35px",
                borderRadius: "50%",
                backgroundColor: "#06b6d4",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
                fontSize: "14px"
              }}
            >
              5a
            </div>
            <div
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#cffafe",
                borderRadius: "6px"
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  color: "#0891b2",
                  marginBottom: "4px",
                  fontSize: "14px"
                }}
              >
                Continue
              </div>
              <div style={{fontSize: "12px", color: "#374151"}}>
                <code
                  style={{
                    backgroundColor: "#f3f4f6",
                    padding: "1px 4px",
                    borderRadius: "3px",
                    fontSize: "11px"
                  }}
                >
                  requestMoreBleakQuestions()
                </code>
              </div>
            </div>
          </div>

          {/* Finish path */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <div
              style={{
                minWidth: "35px",
                height: "35px",
                borderRadius: "50%",
                backgroundColor: "#ef4444",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
                fontSize: "14px"
              }}
            >
              5b
            </div>
            <div
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#fee2e2",
                borderRadius: "6px"
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  color: "#dc2626",
                  marginBottom: "4px",
                  fontSize: "14px"
                }}
              >
                Finish
              </div>
              <div style={{fontSize: "12px", color: "#374151"}}>
                <code
                  style={{
                    backgroundColor: "#f3f4f6",
                    padding: "1px 4px",
                    borderRadius: "3px",
                    fontSize: "11px"
                  }}
                >
                  finishBleakConversation()
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Final result */}
        <div
          style={{
            textAlign: "center",
            color: "#6b7280",
            fontSize: "20px",
            margin: "8px 0"
          }}
        >
          ↓
        </div>

        <div style={{display: "flex", alignItems: "center", gap: "16px"}}>
          <div
            style={{
              minWidth: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#16a34a",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "600"
            }}
          >
            ✓
          </div>
          <div
            style={{
              flex: 1,
              padding: "16px",
              backgroundColor: "#f0fdf4",
              borderRadius: "8px",
              border: "1px solid #22c55e"
            }}
          >
            <div
              style={{fontWeight: "600", color: "#15803d", marginBottom: "4px"}}
            >
              Final Result
            </div>
            <div style={{fontSize: "14px", color: "#374151"}}>
              Get intelligent, personalized answer based on user input
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default BleakSequenceFlow;
