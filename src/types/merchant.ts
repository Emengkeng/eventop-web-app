
export interface Analytics {
  totalRevenue: string;
  activeSubscribers: number;
  totalPlans: number;
  monthlyRecurringRevenue: string;
  revenueGrowth?: number;
  subscriberGrowth?: number;
}

export interface MerchantPlan {
  planPda: string;
  planId: string;
  planName: string;
  feeAmount: string;
  paymentInterval: string;
  totalSubscribers: number;
  isActive: boolean;
  description?: string;
  category?: string;
}

export interface Customer {
  subscriptionPda: string;
  userWallet: string;
  planName: string;
  feeAmount: string;
  paymentCount: number;
  lastPaymentTimestamp: string;
  totalPaid: string;
  isActive: boolean;
  createdAt: string;
  cancelledAt: string | null;
}