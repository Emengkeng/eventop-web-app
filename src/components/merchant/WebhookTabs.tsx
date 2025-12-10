import React, { useState, useEffect } from 'react';
import {
  Webhook,
  Plus,
  Play,
  Pause,
  Trash2,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/components/ui/custom-toast';
import { usePrivy } from '@privy-io/react-auth';

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  description?: string;
  lastSuccess?: string;
  lastFailure?: string;
  totalSuccess: number;
  totalFailure: number;
  createdAt: string;
}

interface WebhookLog {
  id: string;
  event: string;
  payload: any;
  webhookUrl: string;
  status: 'success' | 'failed' | 'pending';
  responseStatus?: number;
  responseBody?: string;
  errorMessage?: string;
  retryCount: number;
  deliveryTime?: number;
  createdAt: string;
  deliveredAt?: string;
}

interface WebhooksTabProps {
  merchantWallet: string;
}

const AVAILABLE_EVENTS = [
  'subscription.created',
  'subscription.payment_succeeded',
  'subscription.payment_failed',
  'subscription.cancelled',
];

function CreateEndpointModal({
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
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>(AVAILABLE_EVENTS);
  const [description, setDescription] = useState('');
  const [secret, setSecret] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    status?: number;
    message: string;
    responseTime?: number;
  } | null>(null);
  const { getAccessToken } = usePrivy();

  const handleTest = async () => {
    if (!url) {
      showErrorToast('Please provide a URL first');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const startTime = Date.now();
      const response = await fetch(`/api/webhooks/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url,
          testPayload: {
            event: 'webhook.test',
            data: {
              message: 'This is a test webhook from your subscription platform',
              timestamp: new Date().toISOString(),
            }
          }
        }),
      });

      const responseTime = Date.now() - startTime;
      const data = await response.json();

      if (response.ok && data.success) {
        setTestResult({
          success: true,
          status: data.status,
          message: `Endpoint responded successfully with status ${data.status}`,
          responseTime,
        });
        showSuccessToast('Endpoint test successful!');
      } else {
        setTestResult({
          success: false,
          status: data.status,
          message: data.error || 'Endpoint test failed',
          responseTime,
        });
        showErrorToast('Endpoint test failed');
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to connect to endpoint',
      });
      showErrorToast('Failed to test endpoint');
    } finally {
      setIsTesting(false);
    }
  };

  const handleCreate = async () => {
    if (!url || events.length === 0) {
      showErrorToast('Please provide URL and select at least one event');
      return;
    }

    setIsCreating(true);
    try {
      const token = await getAccessToken();
      const response = await fetch(
        `/api/webhooks/${merchantWallet}/endpoints`,
        {
          method: 'POST',
          headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
          body: JSON.stringify({ url, events, description }),
        },
      );

      const data = await response.json();
      setSecret(data.secret);
      showSuccessToast('Webhook endpoint created successfully!');
      onSuccess();
    } catch (error) {
      showErrorToast('Failed to create webhook endpoint');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setUrl('');
    setEvents(AVAILABLE_EVENTS);
    setDescription('');
    setSecret('');
    setTestResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {secret ? 'Endpoint Created' : 'Create Webhook Endpoint'}
        </h2>

        {secret ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 font-medium mb-2">
                ⚠️ Save your signing secret
              </p>
              <p className="text-xs text-yellow-700 mb-3">
                This is the only time you&apos;ll see this secret. Use it to verify webhook signatures.
              </p>
              <div className="bg-white rounded border border-yellow-300 p-3">
                <code className="text-xs font-mono break-all text-gray-900">
                  {secret}
                </code>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endpoint URL *
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-api.com/webhooks"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                  onClick={handleTest}
                  disabled={isTesting || !url}
                  className="px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isTesting ? 'Testing...' : 'Test'}
                </button>
              </div>
            </div>

            {testResult && (
              <div
                className={`rounded-lg p-4 ${
                  testResult.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        testResult.success ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      {testResult.message}
                    </p>
                    {testResult.responseTime && (
                      <p
                        className={`text-xs mt-1 ${
                          testResult.success ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        Response time: {testResult.responseTime}ms
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Events to Listen *
              </label>
              <div className="space-y-2">
                {AVAILABLE_EVENTS.map((event) => (
                  <label key={event} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={events.includes(event)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEvents([...events, event]);
                        } else {
                          setEvents(events.filter((ev) => ev !== event));
                        }
                      }}
                      className="w-4 h-4 text-gray-900 rounded border-gray-300 focus:ring-gray-900"
                    />
                    <span className="ml-2 text-sm text-gray-700">{event}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Production webhook endpoint"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isCreating}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
              >
                {isCreating ? 'Creating...' : 'Create Endpoint'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WebhookLogModal({
  log,
  onClose,
}: {
  log: WebhookLog | null;
  onClose: () => void;
}) {
  if (!log) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Webhook Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">
              Status
            </label>
            <div className="mt-1">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  log.status === 'success'
                    ? 'bg-green-100 text-green-800'
                    : log.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {log.status}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">
              Event
            </label>
            <p className="mt-1 text-sm text-gray-900">{log.event}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">
              URL
            </label>
            <p className="mt-1 text-sm text-gray-900 font-mono break-all">
              {log.webhookUrl}
            </p>
          </div>

          {log.deliveryTime && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">
                Delivery Time
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {log.deliveryTime}ms
              </p>
            </div>
          )}

          {log.responseStatus && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">
                Response Status
              </label>
              <p className="mt-1 text-sm text-gray-900">{log.responseStatus}</p>
            </div>
          )}

          {log.errorMessage && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">
                Error Message
              </label>
              <p className="mt-1 text-sm text-red-600">{log.errorMessage}</p>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">
              Payload
            </label>
            <pre className="mt-1 text-xs bg-gray-50 rounded-lg p-4 overflow-x-auto">
              {JSON.stringify(log.payload, null, 2)}
            </pre>
          </div>

          {log.responseBody && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">
                Response
              </label>
              <pre className="mt-1 text-xs bg-gray-50 rounded-lg p-4 overflow-x-auto">
                {log.responseBody}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WebhooksTab({ merchantWallet }: WebhooksTabProps) {
  const [view, setView] = useState<'endpoints' | 'logs'>('endpoints');
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const { getAccessToken } = usePrivy();

  useEffect(() => {
    fetchData();
  }, [merchantWallet, view]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      const [endpointsRes, logsRes, statsRes] = await Promise.all([
        fetch(`/api/webhooks/${merchantWallet}/endpoints`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/webhooks/${merchantWallet}/logs?limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/webhooks/${merchantWallet}/stats`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (endpointsRes.ok) {
        const endpointsData = await endpointsRes.json();
        setEndpoints(Array.isArray(endpointsData) ? endpointsData : []);
      } else {
        setEndpoints([]);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(Array.isArray(logsData.logs) ? logsData.logs : []);
      } else {
        setLogs([]);
      }

      if (statsRes.ok) {
        setStats(await statsRes.json());
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error('Error fetching webhook data:', error);
      setEndpoints([]);
      setLogs([]);
      setStats(null);
      showErrorToast('Failed to load webhook data');
    } finally {
      setLoading(false);
    }
  };

  const toggleEndpoint = async (endpointId: string, isActive: boolean) => {
    try {
      const token = await getAccessToken();
      await fetch(`/api/webhooks/${merchantWallet}/endpoints/${endpointId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isActive: !isActive }),
      });
      showSuccessToast(
        `Endpoint ${!isActive ? 'enabled' : 'disabled'} successfully`,
      );
      fetchData();
    } catch (error) {
      showErrorToast('Failed to update endpoint');
    }
  };

  const deleteEndpoint = async (endpointId: string) => {
    if (!confirm('Are you sure you want to delete this endpoint?')) return;
    const token = await getAccessToken();

    try {
      await fetch(`/api/webhooks/${merchantWallet}/endpoints/${endpointId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      showSuccessToast('Endpoint deleted successfully');
      fetchData();
    } catch (error) {
      showErrorToast('Failed to delete endpoint');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600">Total Sent</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.total}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats.successRate}%
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600">Failed</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {stats.failed}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600">Last 24h</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.last24h}
            </p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setView('endpoints')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                view === 'endpoints'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Endpoints
            </button>
            <button
              onClick={() => setView('logs')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                view === 'logs'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Logs
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {view === 'endpoints' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Webhook Endpoints
                </h3>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                >
                  <Plus className="w-4 h-4" />
                  Add Endpoint
                </button>
              </div>

              {endpoints.length === 0 ? (
                <div className="text-center py-12">
                  <Webhook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No webhook endpoints configured yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {endpoints.map((endpoint) => (
                    <div
                      key={endpoint.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-mono text-gray-900">
                              {endpoint.url}
                            </code>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                endpoint.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {endpoint.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          {endpoint.description && (
                            <p className="text-sm text-gray-600">
                              {endpoint.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              toggleEndpoint(endpoint.id, endpoint.isActive)
                            }
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title={endpoint.isActive ? 'Disable' : 'Enable'}
                          >
                            {endpoint.isActive ? (
                              <Pause className="w-4 h-4 text-gray-600" />
                            ) : (
                              <Play className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteEndpoint(endpoint.id)}
                            className="p-2 hover:bg-red-100 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          {endpoint.totalSuccess} success
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-red-600" />
                          {endpoint.totalFailure} failed
                        </div>
                        <div>Events: {endpoint.events.length}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === 'logs' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Webhook Logs
                </h3>
                <button
                  onClick={fetchData}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No webhook logs yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                log.status === 'success'
                                  ? 'bg-green-500'
                                  : log.status === 'failed'
                                  ? 'bg-red-500'
                                  : 'bg-yellow-500'
                              }`}
                            />
                            <span className="text-sm font-medium text-gray-900">
                              {log.event}
                            </span>
                            {log.deliveryTime && (
                              <span className="text-xs text-gray-500">
                                {log.deliveryTime}ms
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 font-mono">
                            {log.webhookUrl}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                          <Eye className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      {log.errorMessage && (
                        <p className="mt-2 text-xs text-red-600 truncate">
                          {log.errorMessage}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CreateEndpointModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchData}
        merchantWallet={merchantWallet}
      />

      <WebhookLogModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}