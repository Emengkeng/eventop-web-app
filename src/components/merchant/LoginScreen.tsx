import React from 'react';
import { CreditCard } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
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
          onClick={onLogin}
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