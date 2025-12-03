import React, { useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import { MerchantPlan } from '@/types/merchant';
import CreatePlanModal from './CreatePlanModal';

interface PlansTabProps {
  plans: MerchantPlan[];
  loading: boolean;
  onPlanCreated: () => void;
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

const formatInterval = (seconds: string) => {
  const days = parseInt(seconds) / 86400;
  if (days === 7) return 'Weekly';
  if (days === 30) return 'Monthly';
  if (days === 90) return 'Quarterly';
  if (days === 365) return 'Yearly';
  return `${days} days`;
};

function PlanCard({ plan, onEdit }: { plan: MerchantPlan; onEdit: () => void }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.planName}</h3>
          <p className="text-sm text-gray-600">ID: {plan.planId}</p>
        </div>
        <button 
          onClick={onEdit}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      
      {plan.description && (
        <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
      )}
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Price</span>
          <span className="text-lg font-semibold text-gray-900">{formatUSDC(plan.feeAmount)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Billing</span>
          <span className="text-sm font-medium text-gray-900">{formatInterval(plan.paymentInterval)}</span>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <span className="text-sm text-gray-600">Active subscribers</span>
          <span className="text-lg font-semibold text-gray-900">{plan.totalSubscribers}</span>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          plan.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {plan.isActive ? 'Active' : 'Inactive'}
        </span>
        
        {plan.category && (
          <span className="text-xs text-gray-500">{plan.category}</span>
        )}
      </div>
    </div>
  );
}

export default function PlansTab({ plans, loading, onPlanCreated, merchantWallet }: PlansTabProps) {
  const [showCreatePlan, setShowCreatePlan] = useState(false);

  const handlePlanCreated = () => {
    setShowCreatePlan(false);
    onPlanCreated();
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Subscription Plans</h2>
        <button
          onClick={() => setShowCreatePlan(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No plans yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first subscription plan to start accepting recurring payments
            </p>
            <button
              onClick={() => setShowCreatePlan(true)}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Create Your First Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.planPda}
              plan={plan}
              onEdit={() => console.log('Edit plan:', plan.planName)}
            />
          ))}
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