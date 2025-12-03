"use client";

import { 
  Connection, 
  PublicKey, 
  SystemProgram,
} from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, CreditCard, DollarSign, Users, TrendingUp, Plus, Settings, Wallet, Calendar, ChevronRight } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useCreateWallet } from '@privy-io/react-auth/solana';
import { useFundWallet } from '@privy-io/react-auth/solana';
import { useWallets } from '@privy-io/react-auth/solana';
import { useSignAndSendTransaction } from '@privy-io/react-auth/solana';
import localidl from '../../idl/subscription_protocol.json';
import type { SubscriptionProtocol } from '../../types/subscription_protocol';
import { showSuccessToast, showErrorToast } from "@/components/ui/custom-toast";
import { FullScreenLoader } from "@/components/ui/fullscreen-loader";

const USDC_MINT_DEVNET = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

// Types
interface MerchantPlan {
  planPda: string;
  planId: string;
  planName: string;
  feeAmount: string;
  paymentInterval: string;
  totalSubscribers: number;
  isActive: boolean;
}

interface Subscription {
  subscriptionPda: string;
  userWallet: string;
  feeAmount: string;
  paymentCount: number;
  isActive: boolean;
  lastPaymentTimestamp: string;
}

interface Analytics {
  totalRevenue: string;
  activeSubscribers: number;
  totalPlans: number;
  monthlyRecurringRevenue: string;
}

// Mock data for demo
const mockAnalytics: Analytics = {
  totalRevenue: "15420000000",
  activeSubscribers: 234,
  totalPlans: 3,
  monthlyRecurringRevenue: "5240000000"
};

const mockPlans: MerchantPlan[] = [
  {
    planPda: "plan1",
    planId: "premium-monthly",
    planName: "Premium Monthly",
    feeAmount: "29000000",
    paymentInterval: "2592000",
    totalSubscribers: 120,
    isActive: true
  },
  {
    planPda: "plan2",
    planId: "basic-monthly",
    planName: "Basic Monthly",
    feeAmount: "9000000",
    paymentInterval: "2592000",
    totalSubscribers: 89,
    isActive: true
  },
  {
    planPda: "plan3",
    planId: "enterprise-monthly",
    planName: "Enterprise Monthly",
    feeAmount: "99000000",
    paymentInterval: "2592000",
    totalSubscribers: 25,
    isActive: true
  }
];

// Helper functions
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
  return `${days} days`;
};

// Components
const StatCard = ({ icon: Icon, label, value, trend }: any) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200">
    <div className="flex items-center justify-between mb-3">
      <div className="p-2 bg-gray-100 rounded-lg">
        <Icon className="w-5 h-5 text-gray-700" />
      </div>
      {trend && (
        <span className="text-sm text-green-600 font-medium">+{trend}%</span>
      )}
    </div>
    <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

const PlanCard = ({ plan, onEdit }: { plan: MerchantPlan; onEdit: () => void }) => (
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
    
    <div className="mt-4">
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
        plan.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
      }`}>
        {plan.isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  </div>
);

const CreatePlanModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [formData, setFormData] = useState({
    planName: '',
    planId: '',
    feeAmount: '',
    paymentInterval: '30'
  });
  const [isCreating, setIsCreating] = useState(false);
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();

  const handleCreatePlanWithAnchor = async () => {
    if (!formData.planName || !formData.planId || !formData.feeAmount) {
      showErrorToast('Please fill in all required fields');
      return;
    }

    if (wallets.length === 0) {
      showErrorToast('Please create a wallet first');
      return;
    }

    setIsCreating(true);

    try {
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      const merchantWallet = new PublicKey(wallets[0].address);
      console.log('Merchant Wallet:', merchantWallet.toBase58());
      
      // Create a mock wallet for Anchor (it won't actually sign)
      const mockWallet = {
        publicKey: merchantWallet,
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any) => txs,
      };
      
      const provider = new AnchorProvider(
        connection, 
        mockWallet as any, 
        { commitment: 'confirmed' }
      );

      const program = new Program(localidl as SubscriptionProtocol, provider);
      
      // Convert values
      const feeInLamports = new BN(Math.floor(parseFloat(formData.feeAmount) * 1_000_000));
      const intervalInSeconds = new BN(parseInt(formData.paymentInterval) * 86400);
      
      // Derive PDA
      const [merchantPlanPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('merchant_plan'),
          merchantWallet.toBuffer(),
          USDC_MINT_DEVNET.toBuffer(),
          Buffer.from(formData.planId)
        ],
        program.programId
      );

      // Build the instruction using Anchor
      const instruction = await program.methods
        .registerMerchant(
          formData.planId,
          formData.planName,
          feeInLamports,
          intervalInSeconds
        )
        .accounts({
          merchantPlan: merchantPlanPda,
          merchant: merchantWallet,
          mint: USDC_MINT_DEVNET,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      // Create transaction message with the instruction
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      
      const messageV0 = new web3.TransactionMessage({
        payerKey: merchantWallet,
        recentBlockhash: blockhash,
        instructions: [instruction],
      }).compileToV0Message();

      const transaction = new web3.VersionedTransaction(messageV0);

      // Serialize the transaction for Privy
      const serializedTransaction = Buffer.from(transaction.serialize());

      // Sign and send with Privy
      const result = await signAndSendTransaction({
        transaction: serializedTransaction,
        wallet: wallets[0],
        chain: "solana:devnet",
      });

      console.log('Transaction signature:', result.signature);
      showSuccessToast(`Plan "${formData.planName}" created successfully!\nSignature: ${result.signature}`);
      
      // Reset form
      setFormData({
        planName: '',
        planId: '',
        feeAmount: '',
        paymentInterval: '30'
      });
      onClose();
    } catch (error) {
      console.error('Error creating plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showErrorToast(`Failed to create plan: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!formData.planName || !formData.planId || !formData.feeAmount) {
      showErrorToast('Please fill in all required fields');
      return;
    }

    if (wallets.length === 0) {
      showErrorToast('Please create a wallet first');
      return;
    }

    setIsCreating(true);

    try {
      // Convert fee amount to lamports (USDC has 6 decimals)
      const feeInLamports = Math.floor(parseFloat(formData.feeAmount) * 1_000_000);
      
      // Convert interval to seconds
      const intervalInSeconds = parseInt(formData.paymentInterval) * 86400;

      // In production, you would:
      // 1. Build the transaction using @solana/web3.js
      // 2. Call your smart contract's register_merchant instruction
      // 3. Sign and send via Privy
      
      // For now, we'll show what the transaction would look like
      console.log('Creating plan with:', {
        merchantWallet: wallets[0].address,
        planId: formData.planId,
        planName: formData.planName,
        feeAmount: feeInLamports,
        paymentInterval: intervalInSeconds,
      });

      // Example transaction structure (you'll need to implement this with @solana/web3.js):
      /*
      const transaction = await buildRegisterMerchantTransaction({
        merchantWallet: wallets[0].address,
        planId: formData.planId,
        planName: formData.planName,
        feeAmount: feeInLamports,
        paymentInterval: intervalInSeconds,
        programId: 'GPVtSfXPiy8y4SkJrMC3VFyKUmGVhMrRbAp2NhiW1Ds2'
      });

      const result = await signAndSendTransaction({
        transaction: transaction.serialize(),
        wallet: wallets[0]
      });

      console.log('Transaction signature:', result);
      */

      showSuccessToast(`Plan "${formData.planName}" created successfully!\n\nIn production, this would call the register_merchant instruction on your Solana program.`);
      
      // Reset form and close
      setFormData({
        planName: '',
        planId: '',
        feeAmount: '',
        paymentInterval: '30'
      });
      onClose();
    } catch (error) {
      console.error('Error creating plan:', error);
      showErrorToast('Failed to create plan. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Plan</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan Name *
            </label>
            <input
              type="text"
              value={formData.planName}
              onChange={(e) => setFormData({...formData, planName: e.target.value})}
              placeholder="e.g. Premium Monthly"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              maxLength={64}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan ID * (unique identifier)
            </label>
            <input
              type="text"
              value={formData.planId}
              onChange={(e) => setFormData({...formData, planId: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
              placeholder="e.g. premium-monthly"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              maxLength={32}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (USDC) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.feeAmount}
              onChange={(e) => setFormData({...formData, feeAmount: e.target.value})}
              placeholder="29.00"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Billing Interval
            </label>
            <select
              value={formData.paymentInterval}
              onChange={(e) => setFormData({...formData, paymentInterval: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="7">Weekly (7 days)</option>
              <option value="30">Monthly (30 days)</option>
              <option value="90">Quarterly (90 days)</option>
              <option value="365">Yearly (365 days)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreatePlanWithAnchor}
            disabled={isCreating}
            className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};

const WalletSetupModal = ({ isOpen, onComplete }: { isOpen: boolean; onComplete: () => void }) => {
  const [step, setStep] = useState<'wallet' | 'fund' | 'complete'>('wallet');
  const { createWallet } = useCreateWallet();
  const { fundWallet } = useFundWallet();
  const { wallets } = useWallets();
  const [createdWallet, setCreatedWallet] = useState<string | null>(null);

  const handleCreateWallet = async () => {
    try {
      // Check if user already has a wallet
      if (wallets.length > 0) {
        setCreatedWallet(wallets[0].address);
        setStep('fund');
        return;
      }
      
      await createWallet({ createAdditional: false });
      // Get the newly created wallet
      if (wallets.length > 0) {
        setCreatedWallet(wallets[0].address);
      }
      setStep('fund');
    } catch (error) {
      console.error('Error creating wallet:', error);
      showErrorToast('Failed to create wallet. Please try again.');
    }
  };

  const handleFundWallet = async () => {
    if (!createdWallet) return;
    
    try {
      await fundWallet({
        address: createdWallet,
        options: {
          amount: '10',
          asset: 'USDC'
        }
      });
      setStep('complete');
    } catch (error) {
      console.error('Error funding wallet:', error);
      // Allow skipping if funding fails
      setStep('complete');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        {step === 'wallet' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Wallet className="w-8 h-8 text-gray-900" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
              Create Your Merchant Wallet
            </h2>
            <p className="text-gray-600 text-center mb-6">
              We&apos;ll create a secure Solana wallet for you to receive subscription payments. You&apos;ll have full control and can export it anytime.
            </p>
            <button
              onClick={handleCreateWallet}
              className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Create Solana Wallet
            </button>
          </>
        )}

        {step === 'fund' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <DollarSign className="w-8 h-8 text-gray-900" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
              Add Funds (Optional)
            </h2>
            <p className="text-gray-600 text-center mb-2">
              Gas fees will be sponsored for plan creation. Add USDC to your wallet to start receiving subscription payments.
            </p>
            {createdWallet && (
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <p className="text-xs text-gray-600 mb-1">Your wallet address:</p>
                <p className="text-xs font-mono text-gray-900 break-all">{createdWallet}</p>
              </div>
            )}
            <div className="space-y-3">
              <button
                onClick={handleFundWallet}
                className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Add USDC Now
              </button>
              <button
                onClick={() => setStep('complete')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </>
        )}

        {step === 'complete' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-green-100 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
              All Set!
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Your merchant account is ready. Start creating subscription plans to grow your business.
            </p>
            <button
              onClick={onComplete}
              className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Main Dashboard
const MerchantDashboard = () => {
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showWalletSetup, setShowWalletSetup] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'customers'>('overview');
  
  // Privy hooks
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();

  // Check if user needs wallet setup
  useEffect(() => {
    if (authenticated && wallets.length === 0) {
      setShowWalletSetup(true);
    }
  }, [authenticated, wallets]);

  const handleWalletSetupComplete = () => {
    setShowWalletSetup(false);
  };

  if (!ready) {
    return <FullScreenLoader />;
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Merchant Portal
            </h1>
            <p className="text-gray-600">
              Manage your subscription plans on Solana
            </p>
          </div>
          
          <button
            onClick={login}
            className="w-full px-6 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors text-lg"
          >
            Sign In with Privy
          </button>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            No crypto knowledge required • Gas fees sponsored
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                onClick={logout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-700" /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {(['overview', 'plans', 'customers'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={DollarSign}
                label="Total Revenue"
                value={formatUSDC(mockAnalytics.totalRevenue)}
                trend={12}
              />
              <StatCard
                icon={Users}
                label="Active Subscribers"
                value={mockAnalytics.activeSubscribers}
                trend={8}
              />
              <StatCard
                icon={CreditCard}
                label="Active Plans"
                value={mockAnalytics.totalPlans}
              />
              <StatCard
                icon={TrendingUp}
                label="Monthly Recurring"
                value={formatUSDC(mockAnalytics.monthlyRecurringRevenue)}
                trend={15}
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
          </>
        )}

        {activeTab === 'plans' && (
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockPlans.map((plan) => (
                <PlanCard
                  key={plan.planPda}
                  plan={plan}
                  onEdit={() => showErrorToast('Edit plan: ' + plan.planName)}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === 'customers' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customers</h2>
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Customer list will be displayed here</p>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <CreatePlanModal isOpen={showCreatePlan} onClose={() => setShowCreatePlan(false)} />
      <WalletSetupModal isOpen={showWalletSetup} onComplete={handleWalletSetupComplete} />
    </div>
  );
};

export default MerchantDashboard;