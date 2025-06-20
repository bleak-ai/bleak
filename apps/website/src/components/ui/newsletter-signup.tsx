import {useState} from "react";
import {Button} from "./button";
import {Mail, Sparkles, Users} from "lucide-react";
import {subscribeToNewsletter} from "../../api/emailService";

interface NewsletterSignupProps {
  showCounter?: boolean;
  variant?: "header" | "landing" | "footer";
  className?: string;
}

export const NewsletterSignup = ({
  showCounter = false,
  variant = "landing",
  className = ""
}: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate subscriber count: 100 + (days since Jan 1, 2025) * 7
  const getSubscriberCount = () => {
    const startDate = new Date("2025-06-01");
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - startDate.getTime();
    const daysPassed = Math.floor(timeDiff / (1000 * 3600 * 24));
    return 100 + daysPassed * 7;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const success = await subscribeToNewsletter(email, variant);

      if (success) {
        setIsSubscribed(true);
        setEmail("");
      } else {
        setError("Failed to subscribe. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("Newsletter subscription error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className={`text-center ${className}`}>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700 font-semibold">
              You're in! Welcome aboard 🚀
            </p>
          </div>
          <p className="text-xs text-green-600">
            We'll notify you the moment Bleak goes live
          </p>
        </div>
      </div>
    );
  }

  const getVariantStyles = () => {
    switch (variant) {
      case "header":
        return {
          container: "flex items-center gap-2",
          input:
            "text-sm px-3 py-2 w-48 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200",
          button:
            "text-sm px-4 py-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transform hover:scale-105 transition-all duration-200"
        };
      case "footer":
        return {
          container: "flex flex-col sm:flex-row gap-4 max-w-md",
          input:
            "text-sm px-4 py-3 flex-1 border-2 border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 shadow-sm",
          button:
            "text-sm px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transform hover:scale-105 transition-all duration-200 shadow-lg"
        };
      default: // landing
        return {
          container: "flex flex-col sm:flex-row gap-4 max-w-md mx-auto",
          input:
            "text-base px-4 py-3 flex-1 border-2 border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 shadow-sm",
          button:
            "text-base px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold"
        };
    }
  };

  const styles = getVariantStyles();

  const getCompellingMessage = () => {
    switch (variant) {
      case "header":
        return "Get early access";
      case "footer":
        return "Don't miss the launch";
      default:
        return "Be among the first to try Bleak AI";
    }
  };

  return (
    <div className={className}>
      {variant === "landing" && (
        <div className="relative">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-xl blur-xl"></div>
          <div className="relative">
            {showCounter && (
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20 mb-3">
                  <Users className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold text-primary">
                    {getSubscriberCount().toLocaleString()} early supporters
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {variant === "footer" && showCounter && (
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20 mb-2">
            <Users className="w-3 h-3 text-primary" />
            <p className="text-xs font-semibold text-primary">
              {getSubscriberCount().toLocaleString()} waiting
            </p>
          </div>
        </div>
      )}

      <div>
        <form onSubmit={handleSubmit} className={styles.container}>
          <div className="flex-1">
            <input
              type="email"
              placeholder={
                variant === "header"
                  ? "your@email.com"
                  : "Enter your email for early access"
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              disabled={isSubmitting}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || !email}
            className={styles.button}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Joining...</span>
              </div>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                {variant === "header" ? "Join" : "Get Early Access"}
              </>
            )}
          </Button>
        </form>

        {error && (
          <div className="text-center mt-3">
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          </div>
        )}

        {variant !== "header" && !error && (
          <div className="text-center mt-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">{getCompellingMessage()}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
