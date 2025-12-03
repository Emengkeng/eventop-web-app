import { getAccessToken } from "@privy-io/react-auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = await getAccessToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const merchantApi = {
  register: (data: any) => 
    apiFetch('/merchants/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (wallet: string, data: any) =>
    apiFetch(`/merchants/${wallet}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getMerchant: (wallet: string) =>
    apiFetch(`/merchants/${wallet}`),

  getPlans: (wallet: string) =>
    apiFetch(`/merchants/${wallet}/plans`),

  getPlanDetail: (pda: string) =>
    apiFetch(`/merchants/plans/${pda}`),

  searchPlans: (query: any) =>
    apiFetch(`/merchants/plans/search?${new URLSearchParams(query)}`),

  getAnalytics: (wallet: string) =>
    apiFetch(`/merchants/${wallet}/analytics`),

  getCustomers: (wallet: string) =>
    apiFetch(`/merchants/${wallet}/customers`),

  regenerateWebhookSecret: (wallet: string) =>
    apiFetch(`/merchants/${wallet}/webhook-secret/regenerate`, {
      method: 'POST',
    }),
};

export const subscriptionApi = {
  getUserSubscriptions: (wallet: string) =>
    apiFetch(`/subscriptions/user/${wallet}`),

  getMerchantSubscriptions: (wallet: string) =>
    apiFetch(`/subscriptions/merchant/${wallet}`),

  getSubscriptionDetail: (pda: string) =>
    apiFetch(`/subscriptions/${pda}`),

  getWalletBalance: (wallet: string) =>
    apiFetch(`/subscriptions/wallet/${wallet}/balance`),

  getUserStats: (wallet: string) =>
    apiFetch(`/subscriptions/user/${wallet}/stats`),

  getUpcomingPayments: (wallet: string) =>
    apiFetch(`/subscriptions/user/${wallet}/upcoming`),
};

export const analyticsApi = {
  getRevenueChart: (wallet: string, days: number = 30) =>
    apiFetch(`/analytics/${wallet}/revenue?days=${days}`),

  getSubscriberGrowth: (wallet: string, days: number = 30) =>
    apiFetch(`/analytics/${wallet}/growth?days=${days}`),

  getChurnRate: (wallet: string) =>
    apiFetch(`/analytics/${wallet}/churn`),

  getPlanPerformance: (wallet: string) =>
    apiFetch(`/analytics/${wallet}/plans`),
};