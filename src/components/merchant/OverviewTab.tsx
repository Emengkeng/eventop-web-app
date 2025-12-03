import React, { useState } from 'react';
import { DollarSign, Users, CreditCard, TrendingUp, Plus, Calendar, ChevronRight } from 'lucide-react';
import StatCard from './StatCard';
import { Analytics, MerchantPlan } from '@/types/merchant';
import CreatePlanModal from './CreatePlanModal';

interface OverviewTabProps {
  analytics: Analytics | null;
  plans: MerchantPlan[];
  loading: boolean;
  onCreatePlan: () => void;
  merchantWallet: string;
}

const formatUSDC = (amount: string) => {
  const num = parseFloat(amount) / 1_000_000;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(num);
};

export default function OverviewTab({ 
  analytics, 
  plans, 
  loading, 
  onCreatePlan,
  merchantWallet 
}: OverviewTabProps) {
  const [showCreatePlan, setShowCreatePlan] = useState(false);

  const handlePlanCreated = () => {
    setShowCreatePlan(false);
    onCreatePlan();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={analytics ? formatUSDC(analytics.totalRevenue) : '$0.00'}
          trend={analytics?.revenueGrowth}
        />
        <StatCard
          icon={Users}
          label="Active Subscribers"
          value={analytics?.activeSubscribers || 0}
          trend={analytics?.subscriberGrowth}
        />
        <StatCard
          icon={CreditCard}
          label="Active Plans"
          value={analytics?.totalPlans || plans.length}
        />
        <StatCard
          icon={TrendingUp}
          label="Monthly Recurring"
          value={analytics ? formatUSDC(analytics.monthlyRecurringRevenue) : '$0.00'}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowCreatePlan(true)}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-900 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-900 transition-colors">
                <Plus className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
              </div>
              <span className="font-medium text-gray-900">Create Plan</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-900 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-900 transition-colors">
                <Users className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
              </div>
              <span className="font-medium text-gray-900">View Customers</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-900 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-900 transition-colors">
                <Calendar className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
              </div>
              <span className="font-medium text-gray-900">Upcoming Payments</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Recent Plans Preview */}
      {plans.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Plans</h2>
            <span className="text-sm text-gray-600">{plans.length} total</span>
          </div>
          <div className="space-y-3">
            {plans.slice(0, 3).map((plan) => (
              <div key={plan.planPda} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{plan.planName}</p>
                  <p className="text-sm text-gray-600">{formatUSDC(plan.feeAmount)}/mo</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{plan.totalSubscribers} subscribers</p>
                  <p className="text-xs text-gray-600">{plan.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CreatePlanModal
        isOpen={showCreatePlan}
        onClose={() => setShowCreatePlan(false)}
        onSuccess={handlePlanCreated}
        merchantWallet={merchantWallet}
      />
    </>
  );
}