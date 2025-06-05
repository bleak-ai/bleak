import React, {useState} from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {Button} from "../ui/button";
import {ProtectedRoute} from "../auth/AuthWrapper";
import {fetchUserProfile, createApiKey, revokeApiKey} from "../../api/authApi";
import type {ApiKey, UserProfile, CreateApiKeyRequest} from "../../api/authApi";
import {Copy, Trash2, Plus, Key} from "lucide-react";

const ApiKeyCard: React.FC<{
  apiKey: ApiKey;
  onRevoke: (id: string) => void;
  isRevoking: boolean;
}> = ({apiKey, onRevoke, isRevoking}) => {
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
    <div className="silent-card space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="font-medium text-foreground">{apiKey.name}</h3>
          <p className="text-sm text-muted-foreground">
            Created {new Date(apiKey.created_at).toLocaleDateString()}
          </p>
        </div>
        <Button
          onClick={() => onRevoke(apiKey.id)}
          variant="outline"
          size="sm"
          disabled={isRevoking}
          className="text-destructive hover:bg-destructive/10 interactive-scale"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 p-3 bg-input rounded-lg border border-border">
          <code className="text-sm text-foreground break-all">
            {apiKey.key || apiKey.preview}
          </code>
        </div>
        <Button
          onClick={() => copyToClipboard(apiKey.key || apiKey.preview)}
          variant="outline"
          size="sm"
          className={`${copied ? "text-green-500" : ""} interactive-scale`}
        >
          <Copy className="w-4 h-4 mr-1" />
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        {apiKey.usage_count} uses
        {apiKey.last_used_at &&
          ` • Last used ${new Date(apiKey.last_used_at).toLocaleDateString()}`}
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
      <div className="container-max section-padding flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-max section-padding">
        <div className="silent-card text-center">
          <div className="text-destructive font-medium">
            Error: {(error as Error).message}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container-max section-padding space-y-12">
      {/* Header - Silent Edge: Clean, confident */}
      <div className="space-y-4">
        <h1 className="text-4xl font-light tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Welcome back, {profile.email}
        </p>
      </div>

      {/* Usage Stats - Clear metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            label: "Total Requests",
            value: profile.usage_stats.total_requests,
            description: "All-time API usage"
          },
          {
            label: "This Month",
            value: profile.usage_stats.monthly_requests,
            description: "Current month requests"
          },
          {
            label: "API Keys",
            value: profile.api_keys.length,
            description: "Active API keys"
          }
        ].map((stat) => (
          <div key={stat.label} className="silent-card text-center space-y-3">
            <p className="text-sm text-muted-foreground font-medium">
              {stat.label}
            </p>
            <p className="text-3xl font-light text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* API Keys Section */}
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-medium text-foreground">API Keys</h2>
            <p className="text-sm text-muted-foreground">
              Manage your API keys for accessing Bleak services
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="interactive-scale"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showCreateForm ? "Cancel" : "Create New Key"}
          </Button>
        </div>

        {/* Create Form - Clean input */}
        {showCreateForm && (
          <div className="silent-card space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground">
                Create New API Key
              </h3>
            </div>
            <div className="flex gap-3">
              <input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Enter a name for this key"
                className="flex-1 silent-input"
              />
              <Button
                onClick={handleCreateApiKey}
                disabled={!newKeyName.trim() || createMutation.isPending}
                className="interactive-scale"
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        )}

        {/* API Keys List */}
        <div className="space-y-4">
          {profile.api_keys.map((apiKey) => (
            <ApiKeyCard
              key={apiKey.id}
              apiKey={apiKey}
              onRevoke={revokeMutation.mutate}
              isRevoking={revokeMutation.isPending}
            />
          ))}
        </div>

        {/* Empty State */}
        {profile.api_keys.length === 0 && (
          <div className="silent-card text-center space-y-4">
            <Key className="w-12 h-12 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">
                No API keys yet
              </h3>
              <p className="text-muted-foreground">
                Create your first API key to start using Bleak services
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => (
  <ProtectedRoute>
    <UserDashboard />
  </ProtectedRoute>
);

export default DashboardPage;
