import {Button} from "../ui/button";
import {Home, ArrowLeft, FileQuestion} from "lucide-react";

const NotFoundPage = () => {
  const goHome = () => {
    window.history.pushState({}, "", "/");
    window.location.reload();
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="bg-muted rounded-full p-8">
            <FileQuestion className="w-16 h-16 text-muted-foreground" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <h2 className="text-xl font-medium text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The page you're looking for doesn't exist. It might have been moved,
            deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={goHome} className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Go Home
          </Button>
          <Button
            onClick={goBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>

        {/* Available Routes */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Or try one of these pages:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                window.history.pushState({}, "", "/");
                window.location.reload();
              }}
            >
              Home
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                window.history.pushState({}, "", "/chat");
                window.location.reload();
              }}
            >
              Chat
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                window.history.pushState({}, "", "/docs");
                window.location.reload();
              }}
            >
              Documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
