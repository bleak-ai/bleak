import React from "react";

const BleakArchitectureFlow = () => (
  <div style={{margin: "20px 0"}}>
    {/* Architecture Overview */}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
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
          color: "#1e293b"
        }}
      >
        BleakAI Architecture Flow
      </div>

      {/* Three main components */}
      <div style={{display: "flex", gap: "16px", alignItems: "stretch"}}>
        {/* 1. Frontend */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            backgroundColor: "#dbeafe",
            borderRadius: "8px",
            border: "1px solid #3b82f6"
          }}
        >
          <div
            style={{
              fontWeight: "600",
              fontSize: "16px",
              color: "#1e40af",
              marginBottom: "12px"
            }}
          >
            1. Your Frontend
          </div>
          <div
            style={{fontSize: "14px", color: "#374151", marginBottom: "12px"}}
          >
            Custom React/Vue/Angular application with your own UI components
          </div>
          <div style={{fontSize: "12px", color: "#6b7280"}}>
            • Your custom design
            <br />
            • Your components
            <br />• Your user experience
          </div>
        </div>

        {/* 2. NPM Library */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            backgroundColor: "#dcfce7",
            borderRadius: "8px",
            border: "1px solid #22c55e"
          }}
        >
          <div
            style={{
              fontWeight: "600",
              fontSize: "16px",
              color: "#15803d",
              marginBottom: "12px"
            }}
          >
            2. bleakai Library
          </div>
          <div
            style={{fontSize: "14px", color: "#374151", marginBottom: "12px"}}
          >
            Open source npm package that connects your frontend to BleakAI
          </div>
          <div style={{fontSize: "12px", color: "#6b7280"}}>
            • API communication
            <br />
            • Component resolution
            <br />• Session management
          </div>
        </div>

        {/* 3. Backend */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            backgroundColor: "#fef3c7",
            borderRadius: "8px",
            border: "1px solid #f59e0b"
          }}
        >
          <div
            style={{
              fontWeight: "600",
              fontSize: "16px",
              color: "#d97706",
              marginBottom: "12px"
            }}
          >
            3. BleakAI Backend
          </div>
          <div
            style={{fontSize: "14px", color: "#374151", marginBottom: "12px"}}
          >
            Private AI service that generates intelligent questions and answers
          </div>
          <div style={{fontSize: "12px", color: "#6b7280"}}>
            • Question generation
            <br />
            • Answer processing
            <br />• AI intelligence
          </div>
        </div>
      </div>

      {/* Flow arrows and process */}
      <div style={{marginTop: "20px"}}>
        <div
          style={{
            textAlign: "center",
            fontSize: "16px",
            fontWeight: "600",
            color: "#1e293b",
            marginBottom: "16px"
          }}
        >
          Communication Flow
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              padding: "8px 16px",
              backgroundColor: "#3b82f6",
              color: "white",
              borderRadius: "6px",
              fontSize: "14px"
            }}
          >
            2a. API Calls
          </div>
          <div style={{fontSize: "16px", color: "#6b7280"}}>→</div>
          <div
            style={{
              padding: "8px 16px",
              backgroundColor: "#22c55e",
              color: "white",
              borderRadius: "6px",
              fontSize: "14px"
            }}
          >
            start() / continue() / finish()
          </div>
          <div style={{fontSize: "16px", color: "#6b7280"}}>→</div>
          <div
            style={{
              padding: "8px 16px",
              backgroundColor: "#f59e0b",
              color: "white",
              borderRadius: "6px",
              fontSize: "14px"
            }}
          >
            AI Processing
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            justifyContent: "center",
            marginTop: "12px"
          }}
        >
          <div
            style={{
              padding: "8px 16px",
              backgroundColor: "#8b5cf6",
              color: "white",
              borderRadius: "6px",
              fontSize: "14px"
            }}
          >
            2b. Component Resolution
          </div>
          <div style={{fontSize: "16px", color: "#6b7280"}}>→</div>
          <div
            style={{
              padding: "8px 16px",
              backgroundColor: "#ef4444",
              color: "white",
              borderRadius: "6px",
              fontSize: "14px"
            }}
          >
            resolveComponents()
          </div>
          <div style={{fontSize: "16px", color: "#6b7280"}}>→</div>
          <div
            style={{
              padding: "8px 16px",
              backgroundColor: "#6366f1",
              color: "white",
              borderRadius: "6px",
              fontSize: "14px"
            }}
          >
            Render Questions
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default BleakArchitectureFlow;
