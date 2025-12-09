import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import {
  User,
  Mail,
  Building2,
  Image,
  Key,
  Save,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/components/ui/custom-toast';

interface MerchantProfile {
  walletAddress: string;
  companyName?: string;
  email?: string;
  logoUrl?: string;
  createdAt: string;
}

interface SettingsTabProps {
  merchantWallet: string;
}

export default function SettingsTab({ merchantWallet }: SettingsTabProps) {
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { getAccessToken } = usePrivy();

  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    logoUrl: '',
  });

  useEffect(() => {
    if (merchantWallet) {
      fetchProfile();
    }
  }, [merchantWallet]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      
      const response = await fetch(`/api/merchants/${merchantWallet}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch merchant profile');
      }

      const data = await response.json();
      setProfile(data);
      
      // Set form data
      setFormData({
        companyName: data.companyName || '',
        email: data.email || '',
        logoUrl: data.logoUrl || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      showErrorToast('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getAccessToken();
      
      const response = await fetch(`/api/merchants/${merchantWallet}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(data);
      showSuccessToast('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      showErrorToast('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showSuccessToast(`${label} copied to clipboard`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-gray-900" />
          <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
        </div>

        <div className="space-y-4">
          {/* Wallet Address (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wallet Address
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={merchantWallet}
                disabled
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(merchantWallet, 'Wallet address')}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Copy wallet address"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Your wallet address cannot be changed
            </p>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Company Name
              </div>
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="Your Company Inc."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </div>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@yourcompany.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Logo URL
              </div>
            </label>
            <input
              type="url"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              placeholder="https://yourcompany.com/logo.png"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            {formData.logoUrl && (
              <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-600 mb-2">Preview:</p>
                <img 
                  src={formData.logoUrl} 
                  alt="Logo preview" 
                  className="h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle2 className="w-6 h-6 text-gray-900" />
          <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Member Since</span>
            <span className="text-sm font-medium text-gray-900">
              {profile?.createdAt && new Date(profile.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Account Type</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
              Devnet
            </span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600">Status</span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              Active
            </span>
          </div>
        </div>
      </div>

      {/* API Documentation Link */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Key className="w-6 h-6" />
              <h2 className="text-xl font-bold">API Documentation</h2>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              Learn how to integrate our subscription API into your application
            </p>
            <button
              onClick={() => window.open('/docs/api', '_blank')}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
            >
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}