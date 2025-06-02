import SuperTokens from "supertokens-auth-react";
import Passwordless from "supertokens-auth-react/recipe/passwordless";
import Session from "supertokens-auth-react/recipe/session";

export const SuperTokensConfig = {
  appInfo: {
    appName: "Bleak AI",
    apiDomain: import.meta.env.VITE_API_BASE_URL,
    websiteDomain: import.meta.env.VITE_WEBSITE_BASE_URL,
    apiBasePath: "/auth",
    websiteBasePath: "/login"
  },
  recipeList: [
    Passwordless.init({
      contactMethod: "EMAIL"
    }),
    Session.init()
  ]
};

// Initialize SuperTokens
SuperTokens.init(SuperTokensConfig);
