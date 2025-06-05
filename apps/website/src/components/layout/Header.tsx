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
    <header className="silent-nav">
      <div className="container-max ">
        <div className="flex items-center justify-between py-8 px-20">
          {/* Brand - Silent Edge: Confident, simple */}
          <div className="flex items-center space-x-12">
            <div
              onClick={() => navigateTo("/")}
              className="text-2xl font-light tracking-tight cursor-pointer hover:opacity-80 transition-opacity duration-200 text-foreground"
            >
              Bleak
            </div>

            {/* Navigation - Clean, minimal */}
            <nav className="hidden md:flex items-center space-x-2">
              {[
                {path: "/", label: "Home"},
                {path: "/chat", label: "Chat"},
                {path: "/docs", label: "Docs"}
              ].map((item) => (
                <Button
                  key={item.path}
                  variant={currentPath === item.path ? "default" : "ghost"}
                  onClick={() => navigateTo(item.path)}
                  className="text-sm font-medium px-4 py-2 transition-all duration-200"
                >
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>

          {/* Authentication - Purposeful placement */}
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
