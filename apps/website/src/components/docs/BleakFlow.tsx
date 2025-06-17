import React from "react";

const BleakFlow = () => (
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

export default BleakFlow;
