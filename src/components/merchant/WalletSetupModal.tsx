import React, { useState } from 'react';
import { Wallet, DollarSign } from 'lucide-react';
import { useCreateWallet } from '@privy-io/react-auth/solana';
import { useFundWallet } from '@privy-io/react-auth/solana';
import { useWallets } from '@privy-io/react-auth/solana';
import { showErrorToast } from "@/components/ui/custom-toast";

interface WalletSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function WalletSetupModal({ isOpen, onComplete }: WalletSetupModalProps) {
  const [step, setStep] = useState<'wallet' | 'fund' | 'complete'>('wallet');
  const { createWallet } = useCreateWallet();
  const { fundWallet } = useFundWallet();
  const { wallets } = useWallets();
  const [createdWallet, setCreatedWallet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateWallet = async () => {
    setIsLoading(true);
    try {
      // Check if user already has a wallet
      if (wallets.length > 0) {
        setCreatedWallet(wallets[0].address);
        setStep('fund');
        return;
      }
      
      await createWallet({ createAdditional: false });
      
      // Wait a moment for wallet to be available
      setTimeout(() => {
        if (wallets.length > 0) {
          setCreatedWallet(wallets[0].address);
          setStep('fund');
        }
      }, 1000);
    } catch (error) {
      console.error('Error creating wallet:', error);
      showErrorToast('Failed to create wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFundWallet = async () => {
    if (!createdWallet) return;
    
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipFunding = () => {
    setStep('complete');
  };

  const handleComplete = () => {
    onComplete();
    // Reset for next time
    setStep('wallet');
    setCreatedWallet(null);
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
              We&apos;ll create a secure Solana wallet for you to receive subscription payments. 
              You&apos;ll have full control and can export it anytime.
            </p>
            <button
              onClick={handleCreateWallet}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Wallet...' : 'Create Solana Wallet'}
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
              Gas fees will be sponsored for plan creation. Add USDC to your wallet 
              to start receiving subscription payments.
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
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Add USDC Now'}
              </button>
              <button
                onClick={handleSkipFunding}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
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
              onClick={handleComplete}
              className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </div>
  );
}