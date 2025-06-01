import {useState, useEffect} from "react";
import {Button} from "../ui/button";

const Header = () => {
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    // Function to handle hash changes
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };

    // Set initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    // Cleanup
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const navigateTo = (hash: string) => {
    window.location.hash = hash;
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigateTo("")}
          >
            <img src="/bleaktreewhite.png" alt="Bleak" className="w-10 h-10" />
            <span className="text-2xl font-light tracking-tight text-foreground ml-2">
              Bleak
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              className={`text-muted-foreground hover:text-foreground hover:bg-accent font-medium ${
                currentHash === "" || currentHash === "#"
                  ? "text-foreground bg-accent"
                  : ""
              }`}
              onClick={() => navigateTo("")}
            >
              Home
            </Button>
            <Button
              variant="ghost"
              className={`text-muted-foreground hover:text-foreground hover:bg-accent font-medium ${
                currentHash === "#chat" ? "text-foreground bg-accent" : ""
              }`}
              onClick={() => navigateTo("chat")}
            >
              Chat
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
