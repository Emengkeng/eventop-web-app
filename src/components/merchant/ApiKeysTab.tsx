import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/components/ui/custom-toast';

interface ApiKey {
  id: string;
  name: string;
  environment: 'devnet' | 'mainnet';
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
}

interface ApiKeysTabProps {
  merchantWallet: string;
}

function CreateApiKeyModal({
  isOpen,
  onClose,
  onSuccess,
  merchantWallet,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  merchantWallet: string;
}) {
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const { getAccessToken } = usePrivy();

  const handleCreate = async () => {
    if (!name.trim()) {
      showErrorToast('Please provide a name for the API key');
      return;
    }

    setIsCreating(true);
    try {
      const token = await getAccessToken();
      
      const response = await fetch(`/api/api-keys/endpoint/${merchantWallet}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create API key');
      }

      const data = await response.json();
      setCreatedKey(data.key);
      showSuccessToast('API key created successfully!');
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Failed to create API key');
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleClose = () => {
    setName('');
    setCreatedKey(null);
    onClose();
    if (createdKey) {
      onSuccess();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccessToast('API key copied to clipboard');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {createdKey ? 'API Key Created' : 'Create API Key'}
        </h2>

        {createdKey ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">
                    Save your API key now
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    This is the only time you&apos;ll see this key. Store it securely.
                  </p>
                </div>
              </div>
              <div className="bg-white rounded border border-yellow-300 p-3 flex items-center gap-2">
                <code className="text-xs font-mono break-all text-gray-900 flex-1">
                  {createdKey}
                </code>
                <button
                  onClick={() => copyToClipboard(createdKey)}
                  className="p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Production API Key"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                maxLength={64}
              />
              <p className="text-xs text-gray-500 mt-2">
                Choose a descriptive name to identify this key
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> This will create a devnet API key. The key
                will be prefixed with <code className="font-mono">sk_test_</code>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isCreating}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isCreating || !name.trim()}
                className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Key'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApiKeysTab({ merchantWallet }: ApiKeysTabProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { getAccessToken } = usePrivy();

  useEffect(() => {
    if (merchantWallet) {
      fetchApiKeys();
    }
  }, [merchantWallet]);

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      
      const response = await fetch(`/api/api-keys/endpoint/${merchantWallet}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch API keys');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setApiKeys(data);
      } else {
        console.error('Unexpected API response format:', data);
        setApiKeys([]);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      showErrorToast(error instanceof Error ? error.message : 'Failed to load API keys');
      setApiKeys([]);
    } finally {
      setLoading(false);
    }
  };

  const revokeApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const token = await getAccessToken();
      
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ merchantWallet })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to revoke API key');
      }

      showSuccessToast('API key revoked successfully');
      fetchApiKeys();
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Failed to revoke API key');
      console.error(error);
    }
  };

  const getKeyPreview = (environment: string) => {
    const prefix = environment === 'devnet' ? 'sk_test_' : 'sk_live_';
    return `${prefix}••••••••••••••••`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">API Keys</h2>
            <p className="text-sm text-gray-600 mb-4">
              Manage your API keys for authentication. Keep your keys secure and never share them publicly.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Getting started:</strong> Include your API key in the Authorization header:
              </p>
              <code className="block mt-2 text-xs bg-white rounded p-2 border border-blue-200 font-mono">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors ml-4"
          >
            <Plus className="w-4 h-4" />
            Create Key
          </button>
        </div>
      </div>

      {/* API Keys List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your API Keys</h3>

          {apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No API keys yet</p>
              <p className="text-sm text-gray-500 mb-6">
                Create your first API key to start integrating
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create API Key
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{key.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            key.environment === 'devnet'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {key.environment}
                        </span>
                        {key.isActive ? (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <AlertCircle className="w-3 h-3" />
                            Revoked
                          </span>
                        )}
                      </div>

                      <code className="text-sm font-mono text-gray-600">
                        {getKeyPreview(key.environment)}
                      </code>

                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span>
                          Created: {new Date(key.createdAt).toLocaleDateString()}
                        </span>
                        {key.lastUsedAt && (
                          <span>
                            Last used: {new Date(key.lastUsedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {key.isActive && (
                      <button
                        onClick={() => revokeApiKey(key.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Revoke key"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateApiKeyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchApiKeys}
        merchantWallet={merchantWallet}
      />
    </div>
  );
}