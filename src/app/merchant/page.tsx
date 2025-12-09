"use client";

import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth/solana';
import { CreditCard } from 'lucide-react';
import { FullScreenLoader } from "@/components/ui/fullscreen-loader";

import DashboardHeader from '@/components/merchant/DashboardHeader';
import DashboardNavigation from '@/components/merchant/DashboardNavigation';
import OverviewTab from '@/components/merchant/OverviewTab';
import PlansTab from '@/components/merchant/PlansTab';
import CustomersTab from '@/components/merchant/CustomersTab';
import WebhooksTab from '@/components/merchant/WebhookTabs';
import ApiKeysTab from '@/components/merchant/ApiKeysTab'; // ADD THIS IMPORT
import WalletSetupModal from '@/components/merchant/WalletSetupModal';
import LoginScreen from '@/components/merchant/LoginScreen';

import { merchantApi, subscriptionApi, analyticsApi } from '../../services/api';
import { Analytics, MerchantPlan, Customer } from '@/types/merchant';
import SettingsTab from '@/components/merchant/SettingsTab';

const MerchantDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'customers' | 'webhooks' | 'api-keys' | 'settings'>('overview');
  
  const [showWalletSetup, setShowWalletSetup] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [plans, setPlans] = useState<MerchantPlan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();

  useEffect(() => {
    if (authenticated && wallets.length === 0) {
      setShowWalletSetup(true);
    }
  }, [authenticated, wallets]);

  useEffect(() => {
    if (authenticated && wallets.length > 0) {
      fetchMerchantData();
    }
  }, [authenticated, wallets, activeTab]);

  const fetchMerchantData = async () => {
    if (wallets.length === 0) return;
    
    const merchantWallet = wallets[0].address;
    setLoading(true);

    try {
      if (activeTab === 'overview') {
        const [analyticsData, plansData] = await Promise.all([
          merchantApi.getAnalytics(merchantWallet),
          merchantApi.getPlans(merchantWallet)
        ]);
        setAnalytics(analyticsData);
        setPlans(plansData);
      } else if (activeTab === 'plans') {
        const plansData = await merchantApi.getPlans(merchantWallet);
        setPlans(plansData);
      } else if (activeTab === 'customers') {
        const customersData = await merchantApi.getCustomers(merchantWallet);
        setCustomers(customersData);
      }
    } catch (error) {
      console.error('Error fetching merchant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletSetupComplete = () => {
    setShowWalletSetup(false);
    fetchMerchantData();
  };

  const handlePlanCreated = () => {
    fetchMerchantData();
  };

  if (!ready) {
    return <FullScreenLoader />;
  }

  if (!authenticated) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        wallets={wallets}
        onLogout={logout}
      />

      <DashboardNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewTab
            analytics={analytics}
            plans={plans}
            loading={loading}
            onCreatePlan={handlePlanCreated}
            merchantWallet={wallets[0]?.address}
          />
        )}

        {activeTab === 'plans' && (
          <PlansTab
            plans={plans}
            loading={loading}
            onPlanCreated={handlePlanCreated}
            merchantWallet={wallets[0]?.address}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersTab
            customers={customers}
            loading={loading}
          />
        )}

        {activeTab === 'webhooks' && (
          <WebhooksTab
            merchantWallet={wallets[0]?.address}
          />
        )}

        {activeTab === 'api-keys' && (
          <ApiKeysTab
            merchantWallet={wallets[0]?.address}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            merchantWallet={wallets[0]?.address}
          />
        )}
      </main>

      <WalletSetupModal 
        isOpen={showWalletSetup}
        onComplete={handleWalletSetupComplete}
      />
    </div>
  );
};

export default MerchantDashboard;