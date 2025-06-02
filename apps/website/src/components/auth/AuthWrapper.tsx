import React, {useState, useEffect} from "react";
import {SessionAuth} from "supertokens-auth-react/recipe/session";
import {signOut} from "supertokens-auth-react/recipe/session";
import {SuperTokensWrapper} from "supertokens-auth-react";
import {Button} from "../ui/button";
import {User, LogOut} from "lucide-react";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({children}) => {
  return (
    <SuperTokensWrapper>
      <div className="min-h-screen">{children}</div>
    </SuperTokensWrapper>
  );
};

interface AuthButtonProps {
  onProfileClick?: () => void;
}

export const AuthButton: React.FC<AuthButtonProps> = ({onProfileClick}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is logged in
    import("supertokens-auth-react/recipe/session")
      .then(({doesSessionExist}) => doesSessionExist())
      .then(setIsLoggedIn)
      .catch(() => setIsLoggedIn(false));
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsLoggedIn(false);
      // Redirect to home
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSignIn = () => {
    // Redirect to SuperTokens auth page
    window.location.href = "/login";
  };

  const handleProfile = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      // Default: redirect to profile page
      window.location.href = "/profile";
    }
  };

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={handleProfile}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          Profile
        </Button>
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleSignIn}
      variant="default"
      size="sm"
      className="flex items-center gap-2"
    >
      <User className="w-4 h-4" />
      Sign In
    </Button>
  );
};

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({children}) => {
  return (
    <SessionAuth
      requireAuth={true}
      onSessionExpired={() => {
        window.location.href = "/login";
      }}
    >
      {children}
    </SessionAuth>
  );
};
