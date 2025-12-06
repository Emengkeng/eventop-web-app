import React, { useState } from 'react';
import { 
  Connection, 
  PublicKey, 
  SystemProgram,
} from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { useWallets } from '@privy-io/react-auth/solana';
import { useSignAndSendTransaction } from '@privy-io/react-auth/solana';
import localidl from '../../idl/subscription_protocol.json';
import type { SubscriptionProtocol } from '../../types/subscription_protocol';
import { showSuccessToast, showErrorToast } from "@/components/ui/custom-toast";

const USDC_MINT_DEVNET = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  merchantWallet: string;
}

const generatePlanId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
};

export default function CreatePlanModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  merchantWallet 
}: CreatePlanModalProps) {
  const [formData, setFormData] = useState({
    planName: '',
    feeAmount: '',
    paymentInterval: '30',
    description: '',
    category: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();

  const handleCreatePlan = async () => {
    if (!formData.planName || !formData.feeAmount) {
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
      const merchantWalletPubkey = new PublicKey(wallets[0].address);
      
      // Generate unique plan ID automatically
      const planId = generatePlanId();
      
      // Create a mock wallet for Anchor
      const mockWallet = {
        publicKey: merchantWalletPubkey,
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
      console.log('Creating plan with ID:', planId, merchantWalletPubkey.toBase58());
      
      // Derive PDA
      const [merchantPlanPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('merchant_plan'),
          merchantWalletPubkey.toBuffer(),
          USDC_MINT_DEVNET.toBuffer(),
          Buffer.from(planId)
        ],
        program.programId
      );

      // Build the instruction using Anchor
      const instruction = await program.methods
        .registerMerchant(
          planId,
          formData.planName,
          feeInLamports,
          intervalInSeconds
        )
        .accounts({
          merchantPlan: merchantPlanPda,
          merchant: merchantWalletPubkey,
          mint: USDC_MINT_DEVNET,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      // Create transaction message
      const { blockhash } = await connection.getLatestBlockhash();
      
      const messageV0 = new web3.TransactionMessage({
        payerKey: merchantWalletPubkey,
        recentBlockhash: blockhash,
        instructions: [instruction],
      }).compileToV0Message();

      const transaction = new web3.VersionedTransaction(messageV0);
      const serializedTransaction = Buffer.from(transaction.serialize());

      // Sign and send with Privy
      const result = await signAndSendTransaction({
        transaction: serializedTransaction,
        wallet: wallets[0],
        chain: "solana:devnet",
      });

      console.log('Transaction signature:', result.signature);
      console.log('Generated Plan ID:', planId);
      showSuccessToast(`Plan "${formData.planName}" created successfully!`);
      
      // Reset form
      setFormData({
        planName: '',
        feeAmount: '',
        paymentInterval: '30',
        description: '',
        category: ''
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showErrorToast(`Failed to create plan: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
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
              Billing Interval *
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe what's included in this plan..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category (Optional)
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              placeholder="e.g. SaaS, Content, Education"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              maxLength={32}
            />
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
            onClick={handleCreatePlan}
            disabled={isCreating}
            className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}