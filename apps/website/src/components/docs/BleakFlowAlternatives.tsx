import React from "react";

// Option 1: Horizontal Flow (current one)
export const BleakFlowHorizontal = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "20px",
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      margin: "20px 0"
    }}
  >
    {/* Frontend */}
    <div
      style={{
        flex: 1,
        textAlign: "center",
        padding: "15px",
        backgroundColor: "#f0f8ff",
        borderRadius: "6px"
      }}
    >
      <div style={{fontWeight: "bold", marginBottom: "8px"}}>
        1. Your Frontend
      </div>
      <div style={{fontSize: "12px", color: "#666"}}>
        Custom React/Vue/Angular app with your UI components
      </div>
    </div>

    <div style={{fontSize: "20px", color: "#666"}}>→</div>

    {/* NPM Library */}
    <div
      style={{
        flex: 1,
        textAlign: "center",
        padding: "15px",
        backgroundColor: "#f0fff0",
        borderRadius: "6px"
      }}
    >
      <div style={{fontWeight: "bold", marginBottom: "8px"}}>
        2. bleakai Library
      </div>
      <div style={{fontSize: "12px", color: "#666", marginBottom: "8px"}}>
        Open source npm package
      </div>
      <div style={{fontSize: "11px", color: "#888"}}>
        • startConversation()
        <br />
        • continueConversation()
        <br />
        • finishConversation()
        <br />• resolveComponents()
      </div>
    </div>

    <div style={{fontSize: "20px", color: "#666"}}>→</div>

    {/* Backend */}
    <div
      style={{
        flex: 1,
        textAlign: "center",
        padding: "15px",
        backgroundColor: "#fff0f0",
        borderRadius: "6px"
      }}
    >
      <div style={{fontWeight: "bold", marginBottom: "8px"}}>
        3. BleakAI Backend
      </div>
      <div style={{fontSize: "12px", color: "#666"}}>
        Private service that generates intelligent questions & answers
      </div>
    </div>
  </div>
);

// Option 2: Vertical Stack
export const BleakFlowVertical = () => (
  <div
    style={{
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      margin: "20px 0"
    }}
  >
    {/* Frontend */}
    <div
      style={{
        padding: "15px",
        backgroundColor: "#f0f8ff",
        borderRadius: "6px",
        marginBottom: "15px"
      }}
    >
      <div style={{fontWeight: "bold", marginBottom: "8px"}}>
        🖥️ 1. Your Frontend
      </div>
      <div style={{fontSize: "14px", color: "#666"}}>
        Custom React/Vue/Angular app with your UI components
      </div>
    </div>

    <div
      style={{
        textAlign: "center",
        margin: "10px 0",
        fontSize: "20px",
        color: "#666"
      }}
    >
      ↓
    </div>

    {/* NPM Library */}
    <div
      style={{
        padding: "15px",
        backgroundColor: "#f0fff0",
        borderRadius: "6px",
        marginBottom: "15px"
      }}
    >
      <div style={{fontWeight: "bold", marginBottom: "8px"}}>
        📦 2. bleakai Library (Open Source)
      </div>
      <div style={{fontSize: "14px", color: "#666", marginBottom: "8px"}}>
        npm install bleakai
      </div>
      <div style={{fontSize: "12px", color: "#888"}}>
        Methods: startConversation(), continueConversation(),
        finishConversation(), resolveComponents()
      </div>
    </div>

    <div
      style={{
        textAlign: "center",
        margin: "10px 0",
        fontSize: "20px",
        color: "#666"
      }}
    >
      ↓
    </div>

    {/* Backend */}
    <div
      style={{padding: "15px", backgroundColor: "#fff0f0", borderRadius: "6px"}}
    >
      <div style={{fontWeight: "bold", marginBottom: "8px"}}>
        🧠 3. BleakAI Backend (Private)
      </div>
      <div style={{fontSize: "14px", color: "#666"}}>
        AI service that generates intelligent questions and final answers
      </div>
    </div>
  </div>
);

// Option 3: Card Layout with Process Flow
export const BleakFlowCards = () => (
  <div style={{margin: "20px 0"}}>
    {/* Architecture Cards */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        marginBottom: "30px"
      }}
    >
      <div
        style={{
          padding: "20px",
          border: "2px solid #4285f4",
          borderRadius: "8px",
          backgroundColor: "#f8f9ff"
        }}
      >
        <div style={{fontSize: "24px", marginBottom: "10px"}}>🖥️</div>
        <div
          style={{fontWeight: "bold", fontSize: "16px", marginBottom: "8px"}}
        >
          Your Frontend
        </div>
        <div style={{fontSize: "14px", color: "#666", lineHeight: "1.4"}}>
          Custom application built with your favorite framework. Contains your
          UI components and design system.
        </div>
      </div>

      <div
        style={{
          padding: "20px",
          border: "2px solid #0f9d58",
          borderRadius: "8px",
          backgroundColor: "#f8fff8"
        }}
      >
        <div style={{fontSize: "24px", marginBottom: "10px"}}>📦</div>
        <div
          style={{fontWeight: "bold", fontSize: "16px", marginBottom: "8px"}}
        >
          bleakai Library
        </div>
        <div style={{fontSize: "14px", color: "#666", lineHeight: "1.4"}}>
          Open source npm package that bridges your frontend with the AI
          backend. Handles API calls and component resolution.
        </div>
      </div>

      <div
        style={{
          padding: "20px",
          border: "2px solid #ea4335",
          borderRadius: "8px",
          backgroundColor: "#fff8f8"
        }}
      >
        <div style={{fontSize: "24px", marginBottom: "10px"}}>🧠</div>
        <div
          style={{fontWeight: "bold", fontSize: "16px", marginBottom: "8px"}}
        >
          BleakAI Backend
        </div>
        <div style={{fontSize: "14px", color: "#666", lineHeight: "1.4"}}>
          Private AI service that analyzes prompts and generates intelligent
          questions and personalized answers.
        </div>
      </div>
    </div>

    {/* Process Flow */}
    <div
      style={{padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "8px"}}
    >
      <div
        style={{fontWeight: "bold", marginBottom: "15px", textAlign: "center"}}
      >
        How It Works
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px"
        }}
      >
        <div style={{textAlign: "center", flex: 1, minWidth: "120px"}}>
          <div style={{fontSize: "18px", marginBottom: "5px"}}>1️⃣</div>
          <div style={{fontSize: "12px"}}>User enters prompt</div>
        </div>
        <div style={{fontSize: "16px", color: "#666"}}>→</div>
        <div style={{textAlign: "center", flex: 1, minWidth: "120px"}}>
          <div style={{fontSize: "18px", marginBottom: "5px"}}>2️⃣</div>
          <div style={{fontSize: "12px"}}>AI generates questions</div>
        </div>
        <div style={{fontSize: "16px", color: "#666"}}>→</div>
        <div style={{textAlign: "center", flex: 1, minWidth: "120px"}}>
          <div style={{fontSize: "18px", marginBottom: "5px"}}>3️⃣</div>
          <div style={{fontSize: "12px"}}>Your components render</div>
        </div>
        <div style={{fontSize: "16px", color: "#666"}}>→</div>
        <div style={{textAlign: "center", flex: 1, minWidth: "120px"}}>
          <div style={{fontSize: "18px", marginBottom: "5px"}}>4️⃣</div>
          <div style={{fontSize: "12px"}}>Get final answer</div>
        </div>
      </div>
    </div>
  </div>
);

// Option 4: Simple Diagram
export const BleakFlowSimple = () => (
  <div
    style={{
      textAlign: "center",
      padding: "30px",
      border: "2px dashed #ccc",
      borderRadius: "12px",
      margin: "20px 0",
      backgroundColor: "#fafafa"
    }}
  >
    <div style={{fontSize: "18px", fontWeight: "bold", marginBottom: "20px"}}>
      BleakAI Architecture
    </div>

    <div
      style={{
        display: "inline-block",
        textAlign: "left",
        fontSize: "14px",
        lineHeight: "2"
      }}
    >
      <div>
        🖥️ <strong>Your Frontend</strong> ← Your components & design
      </div>
      <div style={{margin: "5px 0", paddingLeft: "10px"}}>↕️</div>
      <div>
        📦 <strong>bleakai Library</strong> ← Open source npm package
      </div>
      <div style={{margin: "5px 0", paddingLeft: "10px"}}>↕️</div>
      <div>
        🧠 <strong>BleakAI Backend</strong> ← Private AI service
      </div>
    </div>

    <div style={{marginTop: "20px", fontSize: "12px", color: "#666"}}>
      Your frontend → bleakai library → BleakAI backend → intelligent questions
      → your components
    </div>
  </div>
);
