import {Separator} from "../ui/separator";

const Footer = () => {
  return (
    <footer className="border-t border-border py-16 px-6 bg-muted">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-8 md:mb-0">
            <span className="text-xl font-light tracking-tight text-foreground">
              Bleak
            </span>
          </div>

          <div className="flex items-center justify-center flex-wrap gap-8 text-muted-foreground text-sm">
            <a
              href="#"
              className="hover:text-foreground transition-colors font-medium"
            >
              Documentation
            </a>
            <a
              href="#"
              className="hover:text-foreground transition-colors font-medium"
            >
              GitHub
            </a>
            <a
              href="#"
              className="hover:text-foreground transition-colors font-medium"
            >
              Examples
            </a>
            <a
              href="#"
              className="hover:text-foreground transition-colors font-medium"
            >
              Community
            </a>
          </div>
        </div>

        <Separator className="my-12 bg-border" />

        <div className="text-center text-muted-foreground text-sm">
          © 2025 BleakAI. Open source project for intelligent conversational
          interfaces.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
