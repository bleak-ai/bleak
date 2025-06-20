import {Separator} from "../ui/separator";
import {NewsletterSignup} from "../ui/newsletter-signup";

const Footer = () => {
  return (
    <footer className="py-32 px-4 lg:px-16">
      <div className="container-max space-y-12">
        {/* Newsletter Section */}
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20 mb-4">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                Early Access Open
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-medium text-foreground">
              Don't Miss the Launch
            </h3>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Join thousands of developers getting early access to BleakAI.
              <span className="block mt-1 text-sm font-medium text-foreground">
                Be first in line • No spam • Unsubscribe anytime
              </span>
            </p>
          </div>
          <div className="flex justify-center">
            <NewsletterSignup variant="footer" showCounter={true} />
          </div>
        </div>

        <Separator className="bg-border" />

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
