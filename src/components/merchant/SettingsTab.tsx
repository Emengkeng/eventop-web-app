import React, { useState, useEffect, useRef } from 'react';
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
  Upload,
  X,
  Loader2,
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        body: JSON.stringify({
          companyName: formData.companyName,
          email: formData.email,
        }),
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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showErrorToast('Please select a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      showErrorToast('File size must be less than 4MB');
      return;
    }

    setUploading(true);
    try {
      const token = await getAccessToken();
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/upload/merchant/${merchantWallet}/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.error('Server returned non-JSON response');
        throw new Error('Upload service unavailable. Please ensure backend is running.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload logo');
      }

      const data = await response.json();
      
      setFormData(prev => ({ ...prev, logoUrl: data.url }));
      
      await fetchProfile();
      
      showSuccessToast('Logo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      showErrorToast(error instanceof Error ? error.message : 'Failed to upload logo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    if (!confirm('Are you sure you want to remove your logo?')) {
      return;
    }

    setUploading(true);
    try {
      const token = await getAccessToken();
      
      const response = await fetch(`/api/upload/merchant/${merchantWallet}/logo`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete logo');
      }

      setFormData(prev => ({ ...prev, logoUrl: '' }));
      await fetchProfile();
      showSuccessToast('Logo removed successfully!');
    } catch (error) {
      console.error('Error deleting logo:', error);
      showErrorToast('Failed to remove logo');
    } finally {
      setUploading(false);
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

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Company Logo
              </div>
            </label>

            {formData.logoUrl ? (
              <div className="space-y-3">
                <div className="relative border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <button
                    onClick={handleRemoveLogo}
                    disabled={uploading}
                    className="absolute top-2 right-2 p-1.5 bg-red-100 hover:bg-red-200 rounded-full transition-colors disabled:opacity-50"
                    title="Remove logo"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                  <div className="flex items-center gap-4">
                    <img
                      src={formData.logoUrl}
                      alt="Company logo"
                      className="h-16 w-16 object-contain rounded"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-logo.png';
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Current Logo</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Replace Logo
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Max 4MB • JPEG, PNG, WebP, or GIF
                  </p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-3">Upload your company logo</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Choose Logo
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Max 4MB • JPEG, PNG, WebP, or GIF
                </p>
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