import React from 'react';

interface DashboardNavigationProps {
  activeTab: 'overview' | 'plans' | 'customers';
  onTabChange: (tab: 'overview' | 'plans' | 'customers') => void;
}

export default function DashboardNavigation({ activeTab, onTabChange }: DashboardNavigationProps) {
  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'plans' as const, label: 'Plans' },
    { id: 'customers' as const, label: 'Customers' },
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}