import {useState, useEffect} from "react";
import {Button} from "../ui/button";
import {AuthButton} from "../auth/AuthWrapper";

const Header = () => {
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    // Function to handle path changes
    const handlePathChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Set initial path
    handlePathChange();

    // Listen for popstate events (browser back/forward)
    window.addEventListener("popstate", handlePathChange);

    // Cleanup
    return () => {
      window.removeEventListener("popstate", handlePathChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  const handleProfileClick = () => {
    navigateTo("/profile");
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div
              onClick={() => navigateTo("/")}
              className="text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
            >
              Bleak
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <Button
                variant={currentPath === "/" ? "default" : "ghost"}
                onClick={() => navigateTo("/")}
                className="text-sm"
              >
                Home
              </Button>
              <Button
                variant={currentPath === "/chat" ? "default" : "ghost"}
                onClick={() => navigateTo("/chat")}
                className="text-sm"
              >
                Chat
              </Button>
              <Button
                variant={currentPath === "/demo" ? "default" : "ghost"}
                onClick={() => navigateTo("/demo")}
                className="text-sm"
              >
                Demo
              </Button>
            </nav>
          </div>

          {/* Authentication Button - Always visible */}
          <div className="flex items-center">
            <AuthButton onProfileClick={handleProfileClick} />
          </div>
        </div>
      </div>
    </header>
  );
};

export {Header};
export default Header;
