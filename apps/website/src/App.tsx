import "./App.css";
import "./styles/animations.css";
import {useState, useEffect} from "react";
import {Landing, ChatPage} from "./components/pages";
import {Header, Footer} from "./components/layout";
// import {DynamicDemo} from "./components/chat/interactive";
import {AuthWrapper} from "./components/auth/AuthWrapper";
import {AuthPageWrapper} from "./components/auth/AuthPageWrapper";
import DashboardPage from "./components/dashboard/UserDashboard";
import DocsPage from "./components/docs/DocsPage";
import {canHandleRoute} from "supertokens-auth-react/ui";
import {PasswordlessPreBuiltUI} from "supertokens-auth-react/recipe/passwordless/prebuiltui";

function App() {
  const [currentRoute, setCurrentRoute] = useState("");

  useEffect(() => {
    // Function to handle path changes
    const handlePathChange = () => {
      const path = window.location.pathname.replace("/", "");
      setCurrentRoute(path);
    };

    // Set initial route
    handlePathChange();

    // Listen for popstate events (browser back/forward)
    window.addEventListener("popstate", handlePathChange);

    // Cleanup
    return () => {
      window.removeEventListener("popstate", handlePathChange);
    };
  }, []);

  // Check if SuperTokens can handle the current route
  if (canHandleRoute([PasswordlessPreBuiltUI])) {
    return (
      <AuthWrapper>
        <AuthPageWrapper />
      </AuthWrapper>
    );
  }

  const renderPage = () => {
    switch (currentRoute) {
      case "chat":
        return <ChatPage />;
      case "profile":
        return <DashboardPage />;
      case "docs":
        return <DocsPage />;
      default:
        return <Landing />;
    }
  };

  return (
    <AuthWrapper>
      <div className="min-h-screen">
        <Header />
        <main className="min-h-screen px-2 md:px-4">{renderPage()}</main>
        <Footer />
      </div>
    </AuthWrapper>
  );
}

export default App;
