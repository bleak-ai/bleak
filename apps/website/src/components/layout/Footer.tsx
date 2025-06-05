import {Separator} from "../ui/separator";

const Footer = () => {
  return (
    <footer className="silent-footer section-padding">
      <div className="container-max space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Brand - Silent Edge: Simple, confident */}
          <div className="flex items-center">
            <span className="text-xl font-light tracking-tight text-foreground">
              Bleak
            </span>
          </div>

          {/* Navigation - Clean, purposeful links */}
          <div className="flex items-center justify-center flex-wrap gap-8 text-muted-foreground text-sm">
            {[
              {href: "/docs", label: "Documentation"},
              {href: "https://github.com/bleak-ai/bleak", label: "GitHub"},
              {href: "/examples", label: "Examples"},
              {href: "/community", label: "Community"}
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-foreground transition-colors duration-200 font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <Separator className="bg-border" />

        <div className="text-center text-muted-foreground text-sm">
          © 2025 BleakAI. Open source project for intelligent conversational
          interfaces.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
