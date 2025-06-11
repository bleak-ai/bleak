// Enhanced BleakSession configuration to support secure authentication

export interface SecureBleakSessionConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  elements?: BleakElementConfig;

  // Authentication strategies (choose one)
  auth?: {
    // Strategy 1: Custom headers (for session-based auth)
    headers?: Record<string, string>;

    // Strategy 2: Token provider function (for JWT/dynamic tokens)
    tokenProvider?: () => Promise<string> | string;

    // Strategy 3: Custom auth interceptor
    authenticate?: (config: any) => Promise<any> | any;
  };
}

// Example usage patterns:

// 1. Session-based authentication
const bleakWithSession = new BleakSession({
  baseUrl: "/api/bleak",
  auth: {
    headers: {
      "X-Session-Token": getUserSessionToken(),
      "X-User-ID": getCurrentUserId()
    }
  },
  elements: elementConfig
});

// 2. JWT-based authentication
const bleakWithJWT = new BleakSession({
  baseUrl: "/api/bleak",
  auth: {
    tokenProvider: async () => {
      // Fetch token from secure storage or refresh if needed
      return await getValidJWTToken();
    }
  },
  elements: elementConfig
});

// 3. Custom authentication
const bleakWithCustomAuth = new BleakSession({
  baseUrl: "/api/bleak",
  auth: {
    authenticate: async (requestConfig) => {
      // Add custom authentication logic
      const token = await exchangeCredentialsForToken();
      requestConfig.headers.Authorization = `Bearer ${token}`;
      return requestConfig;
    }
  },
  elements: elementConfig
});

// Backend implementation would validate these auth methods
// and add the actual API key server-side
