import React, {useState} from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {Button} from "../ui/button";
import {ProtectedRoute} from "../auth/AuthWrapper";
import {
  fetchUserProfile,
  createApiKey,
  revokeApiKey,
  updateMonthlyLimit
} from "../../api/authApi";
import type {ApiKey, UserProfile, CreateApiKeyRequest} from "../../api/authApi";
import {Copy, Trash2, Plus, Key, X, CheckCircle, Settings} from "lucide-react";

const ApiKeyCard: React.FC<{
  apiKey: ApiKey;
  onRevoke: (id: string) => void;
  isRevoking: boolean;
  onUpdateLimit: (id: string, limit: number) => void;
  isUpdatingLimit: boolean;
}> = ({apiKey, onRevoke, isRevoking, onUpdateLimit, isUpdatingLimit}) => {
  const [copied, setCopied] = useState(false);
  const [editingLimit, setEditingLimit] = useState(false);
  const [newLimit, setNewLimit] = useState(apiKey.monthly_limit);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSaveLimit = () => {
    if (
      newLimit >= 1 &&
      newLimit <= 100000 &&
      newLimit !== apiKey.monthly_limit
    ) {
      onUpdateLimit(apiKey.id, newLimit);
    }
    setEditingLimit(false);
  };

  const handleCancelEdit = () => {
    setNewLimit(apiKey.monthly_limit);
    setEditingLimit(false);
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
        <div className="flex gap-2">
          <Button
            onClick={() => setEditingLimit(!editingLimit)}
            variant="outline"
            size="sm"
            disabled={isUpdatingLimit}
            className="text-muted-foreground hover:text-foreground interactive-scale"
          >
            <Settings className="w-4 h-4 mr-1" />
            Limits
          </Button>
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

      {/* Monthly Limit Editor */}
      {editingLimit && (
        <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">
              Monthly Request Limit
            </h4>
          </div>
          <div className="flex gap-3 items-center">
            <input
              type="number"
              value={newLimit}
              onChange={(e) =>
                setNewLimit(
                  Math.max(1, Math.min(100000, parseInt(e.target.value) || 1))
                )
              }
              min="1"
              max="100000"
              className="flex-1 silent-input"
              placeholder="Enter monthly limit"
            />
            <Button
              onClick={handleSaveLimit}
              size="sm"
              disabled={isUpdatingLimit || newLimit < 1 || newLimit > 100000}
              className="interactive-scale"
            >
              {isUpdatingLimit ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={handleCancelEdit}
              variant="outline"
              size="sm"
              disabled={isUpdatingLimit}
              className="interactive-scale"
            >
              Cancel
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Set between 1 and 100,000 requests per month. Higher limits may be
            available with premium plans.
          </p>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        {apiKey.usage_count} total uses
        {apiKey.last_used_at &&
          ` • Last used ${new Date(apiKey.last_used_at).toLocaleDateString()}`}
        <br />
        Monthly: {apiKey.monthly_usage}/{apiKey.monthly_limit} requests
        {apiKey.monthly_usage >= apiKey.monthly_limit && (
          <span className="text-red-500 font-medium">
            {" "}
            • Rate limit reached
          </span>
        )}
      </div>
    </div>
  );
};

// New modal component for showing newly created API key
const NewApiKeyModal: React.FC<{
  apiKey: ApiKey | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({apiKey, isOpen, onClose}) => {
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

  if (!isOpen || !apiKey) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg shadow-lg max-w-lg w-full mx-4">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <h2 className="text-xl font-medium text-foreground">
                  API Key Created Successfully
                </h2>
                <p className="text-sm text-muted-foreground">
                  Copy your key now - it won't be shown in full again
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Key Details */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Key Name
              </label>
              <p className="text-foreground mt-1">{apiKey.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                API Key
              </label>
              <div className="flex gap-3 mt-2">
                <div className="flex-1 p-3 bg-input rounded-lg border border-border">
                  <code className="text-sm text-foreground break-all">
                    {apiKey.key || apiKey.preview}
                  </code>
                </div>
                <Button
                  onClick={() => copyToClipboard(apiKey.key || apiKey.preview)}
                  variant="outline"
                  size="sm"
                  className={`${
                    copied ? "text-green-500" : ""
                  } interactive-scale`}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              <strong>Important:</strong> This is the only time you'll see the
              full API key. Make sure to copy and store it securely.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <Button onClick={onClose} className="interactive-scale">
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserDashboard: React.FC = () => {
  const [newKeyName, setNewKeyName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newApiKey, setNewApiKey] = useState<ApiKey | null>(null);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
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
    onSuccess: (data: ApiKey) => {
      queryClient.invalidateQueries({queryKey: ["userProfile"]});
      setNewKeyName("");
      setShowCreateForm(false);
      setNewApiKey(data);
      setShowNewKeyModal(true);
    }
  });

  const revokeMutation = useMutation({
    mutationFn: revokeApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["userProfile"]});
    }
  });

  const updateLimitMutation = useMutation({
    mutationFn: ({apiKeyId, limit}: {apiKeyId: string; limit: number}) =>
      updateMonthlyLimit(apiKeyId, {monthly_limit: limit}),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["userProfile"]});
    }
  });

  const handleCreateApiKey = () => {
    if (newKeyName.trim()) {
      createMutation.mutate({name: newKeyName.trim()});
    }
  };

  const handleUpdateLimit = (apiKeyId: string, limit: number) => {
    updateLimitMutation.mutate({apiKeyId, limit});
  };

  const handleCloseNewKeyModal = () => {
    setShowNewKeyModal(false);
    setNewApiKey(null);
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
              onUpdateLimit={handleUpdateLimit}
              isUpdatingLimit={updateLimitMutation.isPending}
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

      {/* New API Key Modal */}
      <NewApiKeyModal
        apiKey={newApiKey}
        isOpen={showNewKeyModal}
        onClose={handleCloseNewKeyModal}
      />
    </div>
  );
};

const DashboardPage: React.FC = () => (
  <ProtectedRoute>
    <UserDashboard />
  </ProtectedRoute>
);

export default DashboardPage;
