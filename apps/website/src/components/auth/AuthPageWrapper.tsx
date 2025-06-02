import React from "react";
import {Header, Footer} from "../layout";
import {getRoutingComponent} from "supertokens-auth-react/ui";
import {PasswordlessPreBuiltUI} from "supertokens-auth-react/recipe/passwordless/prebuiltui";

interface AuthPageWrapperProps {
  children?: React.ReactNode;
}

export const AuthPageWrapper: React.FC<AuthPageWrapperProps> = () => {
  // Get the SuperTokens routing component
  const authComponent = getRoutingComponent([PasswordlessPreBuiltUI]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="max-w-2xl mx-auto pt-16 pb-8 px-2">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light text-foreground mb-2">
              Welcome to Bleak AI
            </h1>
            <p className="text-muted-foreground">
              Sign in to access your dashboard and manage API keys
            </p>
          </div>
          <div className="">{authComponent}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
