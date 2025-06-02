import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Types
export interface ApiKey {
  id: string;
  key?: string;
  preview: string;
  name: string;
  created_at: string;
  last_used_at?: string;
  usage_count: number;
}

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  api_keys: ApiKey[];
  usage_stats: {
    total_requests: number;
    monthly_requests: number;
    recent_usage: Array<{
      endpoint: string;
      method: string;
      status_code: number;
      timestamp: string;
      response_time_ms?: number;
    }>;
  };
}

export interface CreateApiKeyRequest {
  name: string;
}

// API Functions
export const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (response.status !== 200) {
    throw new Error("Failed to fetch user profile");
  }

  return response.data;
};

export const createApiKey = async (
  request: CreateApiKeyRequest
): Promise<ApiKey> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/auth/api-keys`,
    request,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  if (response.status !== 200) {
    throw new Error("Failed to create API key");
  }

  return response.data;
};

export const revokeApiKey = async (apiKeyId: string): Promise<void> => {
  const response = await axios.delete(
    `${API_BASE_URL}/api/auth/api-keys/${apiKeyId}`,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  if (response.status !== 200) {
    throw new Error("Failed to revoke API key");
  }
};

export const fetchUsageStats = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/auth/usage`, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (response.status !== 200) {
    throw new Error("Failed to fetch usage statistics");
  }

  return response.data;
};

// Check if user is authenticated
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    // Try to fetch user profile - if it succeeds, user is authenticated
    await fetchUserProfile();
    return true;
  } catch (error) {
    return false;
  }
};
