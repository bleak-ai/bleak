import React, {useState, useEffect} from "react";
import {Button} from "./ui/button";

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
    <header className="border-b border-white/10 bg-black backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8">
              <img
                src="/bleaktreewhite.png"
                alt="Bleak"
                className="w-full h-full object-contain"
              />
            </div>
            <span
              className="font-bold text-xl text-white cursor-pointer"
              style={{fontFamily: "'Orbitron', monospace"}}
              onClick={() => navigateTo("")}
            >
              bleak
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <Button
              variant={
                currentHash === "" || currentHash === "#" ? "default" : "ghost"
              }
              className={
                currentHash === "" || currentHash === "#"
                  ? "bg-white text-black hover:bg-white/90"
                  : "text-white hover:bg-white/10"
              }
              onClick={() => navigateTo("")}
            >
              Home
            </Button>
            <Button
              variant={currentHash === "#chat" ? "default" : "ghost"}
              className={
                currentHash === "#chat"
                  ? "bg-white text-black hover:bg-white/90"
                  : "text-white hover:bg-white/10"
              }
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
