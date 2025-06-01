import "./App.css";
import "./styles/animations.css";
import {useState, useEffect} from "react";
import {Landing, ChatPage} from "./components/pages";
import {Header, Footer} from "./components/layout";
// import {DynamicDemo} from "./components/chat/interactive";
import {TestBleakAI} from "./components/demo";

function App() {
  const [currentRoute, setCurrentRoute] = useState("");

  useEffect(() => {
    // Function to handle hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      setCurrentRoute(hash);
    };

    // Set initial route
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    // Cleanup
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const renderPage = () => {
    switch (currentRoute) {
      case "chat":
        return <ChatPage />;
      case "demo":
        return <TestBleakAI />;
      default:
        return <Landing />;
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="min-h-screen">{renderPage()}</main>
      <Footer />
    </div>
  );
}

export default App;
