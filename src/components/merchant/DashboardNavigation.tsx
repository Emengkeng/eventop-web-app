import React from 'react';
import { BarChart3, CreditCard, Users, Webhook, Key } from 'lucide-react';

interface DashboardNavigationProps {
  activeTab: 'overview' | 'plans' | 'customers' | 'webhooks' | 'api-keys' | 'settings';
  onTabChange: (tab: 'overview' | 'plans' | 'customers' | 'webhooks' | 'api-keys' | 'settings') => void;
}

export default function DashboardNavigation({
  activeTab,
  onTabChange,
}: DashboardNavigationProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'plans', label: 'Plans', icon: CreditCard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}