import React, {useState, useEffect} from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {Button} from "../ui/button";
import {ProtectedRoute} from "../auth/AuthWrapper";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Activity,
  Calendar,
  Clock,
  BarChart3
} from "lucide-react";

// Import API functions
import {fetchUserProfile, createApiKey, revokeApiKey} from "../../api/authApi";

// Import types
import type {ApiKey, UserProfile, CreateApiKeyRequest} from "../../api/authApi";

const ApiKeyCard: React.FC<{
  apiKey: ApiKey;
  onRevoke: (id: string) => void;
  isRevoking: boolean;
}> = ({apiKey, onRevoke, isRevoking}) => {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="p-4 border border-border rounded-lg bg-card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-foreground">{apiKey.name}</h3>
          <p className="text-xs text-muted-foreground">
            Created {new Date(apiKey.created_at).toLocaleDateString()}
          </p>
        </div>
        <Button
          onClick={() => onRevoke(apiKey.id)}
          variant="outline"
          size="sm"
          disabled={isRevoking}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 font-mono text-sm bg-muted p-2 rounded">
          {showKey && apiKey.key ? apiKey.key : apiKey.preview}
        </div>
        {apiKey.key && (
          <Button
            onClick={() => setShowKey(!showKey)}
            variant="outline"
            size="sm"
          >
            {showKey ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
        )}
        <Button
          onClick={() => copyToClipboard(apiKey.key || apiKey.preview)}
          variant="outline"
          size="sm"
          className={copied ? "text-green-600" : ""}
        >
          <Copy className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Activity className="w-3 h-3" />
          {apiKey.usage_count} uses
        </span>
        {apiKey.last_used_at && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last used {new Date(apiKey.last_used_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

const UserDashboard: React.FC = () => {
  const [newKeyName, setNewKeyName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    error
  } = useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile
  });

  const createMutation = useMutation({
    mutationFn: (request: CreateApiKeyRequest) => createApiKey(request),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["userProfile"]});
      setNewKeyName("");
      setShowCreateForm(false);
    }
  });

  const revokeMutation = useMutation({
    mutationFn: revokeApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["userProfile"]});
    }
  });

  const handleCreateApiKey = () => {
    if (newKeyName.trim()) {
      createMutation.mutate({name: newKeyName.trim()});
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-destructive">
            Error loading profile: {(error as Error).message}
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-light text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {profile.email}</p>
      </div>

      {/* Usage Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 border border-border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="text-2xl font-bold text-foreground">
                {profile.usage_stats.total_requests}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>

        <div className="p-4 border border-border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold text-foreground">
                {profile.usage_stats.monthly_requests}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>

        <div className="p-4 border border-border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">API Keys</p>
              <p className="text-2xl font-bold text-foreground">
                {profile.api_keys.length}
              </p>
            </div>
            <Key className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-foreground">API Key</h2>
          {profile.api_keys.length === 0 && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create API Key
            </Button>
          )}
        </div>

        {profile.api_keys.length === 0 && !showCreateForm && (
          <div className="text-center py-8 border border-border rounded-lg bg-card">
            <Key className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              You need an API key to access Bleak AI services
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create Your API Key
            </Button>
          </div>
        )}

        {showCreateForm && (
          <div className="p-4 border border-border rounded-lg bg-card">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  API Key Name
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., My Bleak API Key"
                  className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateApiKey}
                  disabled={!newKeyName.trim() || createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewKeyName("");
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
              {createMutation.error && (
                <p className="text-sm text-destructive">
                  Error: {(createMutation.error as Error).message}
                </p>
              )}
            </div>
          </div>
        )}

        {profile.api_keys.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> You have one API key for your
                account. Keep it secure and don't share it. If compromised, you
                can revoke it and create a new one.
              </p>
            </div>

            <div className="grid gap-4">
              {profile.api_keys.map((apiKey) => (
                <ApiKeyCard
                  key={apiKey.id}
                  apiKey={apiKey}
                  onRevoke={revokeMutation.mutate}
                  isRevoking={revokeMutation.isPending}
                />
              ))}
            </div>

            {/* Allow creating a new key only after revoking the old one */}
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-2">
                Need a new API key? Revoke your current key first.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {profile.usage_stats.recent_usage.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-foreground">
            Recent Activity
          </h2>
          <div className="border border-border rounded-lg bg-card">
            <div className="divide-y divide-border">
              {profile.usage_stats.recent_usage.map((usage, index) => (
                <div
                  key={index}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        usage.status_code >= 200 && usage.status_code < 300
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                    <div>
                      <p className="font-mono text-sm text-foreground">
                        {usage.method} {usage.endpoint}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(usage.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-foreground">
                      Status: {usage.status_code}
                    </p>
                    {usage.response_time_ms && (
                      <p className="text-muted-foreground">
                        {usage.response_time_ms}ms
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DashboardPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <UserDashboard />
    </ProtectedRoute>
  );
};

export default DashboardPage;
