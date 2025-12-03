import React from 'react';
import { CreditCard, Wallet, ArrowLeftIcon } from 'lucide-react';

interface DashboardHeaderProps {
  wallets: any[];
  onLogout: () => void;
}

export default function DashboardHeader({ wallets, onLogout }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <CreditCard className="w-6 h-6 text-gray-900 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Merchant Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            {wallets.length > 0 && (
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <Wallet className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-mono text-gray-900">
                  {wallets[0].address.slice(0, 4)}...{wallets[0].address.slice(-4)}
                </span>
              </div>
            )}
            <button 
              onClick={onLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}