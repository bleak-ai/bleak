import "./App.css";
import "./styles/animations.css";
import {useState, useEffect} from "react";
import Landing from "./components/Landing";
import ChatPage from "./components/ChatPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import {DynamicDemo} from "./components/chat/DynamicDemo";

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
        return <DynamicDemo />;
      default:
        return <Landing />;
    }
  };

  return (
    <div className="dark">
      <Header />
      <main className="min-h-screen">{renderPage()}</main>
      <Footer />
    </div>
  );
}

export default App;
