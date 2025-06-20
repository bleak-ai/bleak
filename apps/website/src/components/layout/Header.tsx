import {useState, useEffect} from "react";
import {Button} from "../ui/button";
import {AuthButton} from "../auth/AuthWrapper";
import {NewsletterSignup} from "../ui/newsletter-signup";

const Header = () => {
  const [currentPath, setCurrentPath] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  const handleProfileClick = () => {
    navigateTo("/profile");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="silent-nav">
      <div className="container-max">
        <div className="flex items-center justify-between py-8 px-10 md:px-20">
          {/* Brand - Silent Edge: Confident, simple */}
          <div className="flex items-center space-x-12">
            <div
              onClick={() => navigateTo("/")}
              className="text-2xl font-light tracking-tight cursor-pointer hover:opacity-80 transition-opacity duration-200 text-foreground"
            >
              Bleak
            </div>

            {/* Desktop Navigation - Clean, minimal */}
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

          {/* Right side - Auth and Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            {/* Newsletter signup - shown when not logged in */}
            <div className="hidden lg:block">
              <NewsletterSignup variant="header" />
            </div>
            <AuthButton onProfileClick={handleProfileClick} />

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 hover:opacity-80 transition-opacity duration-200"
              aria-label="Toggle mobile menu"
            >
              <div className="w-5 h-5 flex flex-col justify-center items-center">
                <div
                  className={`w-5 h-0.5 bg-foreground transition-transform duration-200 ${
                    isMobileMenuOpen ? "rotate-45 translate-y-1" : "mb-1"
                  }`}
                />
                <div
                  className={`w-5 h-0.5 bg-foreground transition-opacity duration-200 ${
                    isMobileMenuOpen ? "opacity-0" : "mb-1"
                  }`}
                />
                <div
                  className={`w-5 h-0.5 bg-foreground transition-transform duration-200 ${
                    isMobileMenuOpen ? "-rotate-45 -translate-y-1" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/20 ">
            <nav className="py-4 px-4 space-y-2">
              {[
                {path: "/", label: "Home"},
                {path: "/chat", label: "Chat"},
                {path: "/docs", label: "Docs"}
              ].map((item) => (
                <Button
                  key={item.path}
                  variant={currentPath === item.path ? "default" : "ghost"}
                  onClick={() => navigateTo(item.path)}
                  className="w-full justify-start text-sm font-medium px-4 py-2 transition-all duration-200"
                >
                  {item.label}
                </Button>
              ))}

              {/* Mobile Newsletter signup */}
              <div className="pt-4 lg:hidden">
                <NewsletterSignup variant="header" />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export {Header};
export default Header;
