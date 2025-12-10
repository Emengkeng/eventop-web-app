"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Users, Search, Filter, AppleIcon } from 'lucide-react';
import { PlayStoreIcon } from '@/components/ui/playstore';

export default function CheckoutPage() {
  const { sessionId } = useParams();
  const [session, setSession] = useState<any>(null);
  const [hasApp, setHasApp] = useState<boolean | null>(null);

  useEffect(() => {
    loadSession();
    // detectApp(); // Commented out for testing
    setHasApp(true); // Always assume app is installed for testing
  }, [sessionId]);

  const loadSession = async () => {
    const response = await fetch(`/api/checkout/${sessionId}`);
    const data = await response.json();
    setSession(data);
  };

  // const detectApp = () => {
  //   const deepLink = `exp://8gtihio-jussec-8081.exp.direct/--/ping`;
  //   //const deepLink = `eventop://ping`;
  //   
  //   // Attempt deep link
  //   const start = Date.now();
  //   window.location.href = deepLink;
  //   
  //   // If app opens, this page will blur
  //   const handleBlur = () => {
  //     setHasApp(true);
  //   };
  //   
  //   window.addEventListener('blur', handleBlur);
  //   
  //   // If still here after 2 seconds, app not installed
  //   setTimeout(() => {
  //     if (Date.now() - start > 1500) {
  //       setHasApp(false);
  //     }
  //     window.removeEventListener('blur', handleBlur);
  //   }, 2000);
  // };

  if (!session){
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            {session.merchant.logoUrl && (
              <img 
                src={session.merchant.logoUrl} 
                alt={session.merchant.companyName}
                className="w-12 h-12 rounded-lg bg-white p-1"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {session.plan.planName}
              </h1>
              <p className="text-purple-100">
                from {session.merchant.companyName}
              </p>
            </div>
          </div>
          
          <div className="text-4xl font-bold">
            ${(parseFloat(session.plan.feeAmount) / 1_000_000).toFixed(2)}
            <span className="text-lg font-normal text-purple-100">/month</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          
          {/* Subscribing As */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Subscribing as</p>
            <p className="font-semibold text-gray-900">{session.customerEmail}</p>
          </div>

          {/* App Status - Skip detection for testing */}
          {/* {hasApp === false && <AppDownloadPrompt session={session} />} */}
          {hasApp === true && <AppInstalledFlow session={session} />}
          {/* {hasApp === null && <DetectingAppStatus />} */}

        </div>
      </div>
    </div>
  );
}

function AppDownloadPrompt({ session }: { session: any }) {
  return (
    <div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-3">
          <div className="text-3xl">📱</div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Download Eventop App to Continue
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              To subscribe, you&apos;ll need the Eventop app. It&apos;s free and takes 
              just 2 minutes to set up your account.
            </p>
            <ul className="space-y-2 text-sm text-gray-600 mb-4">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Create your subscription wallet
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Manage all subscriptions in one place
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Earn yield on idle funds
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Download Buttons */}
      <div className="space-y-3">
        <a
          href="https://apps.apple.com/app/Eventop"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition"
        >
          <AppleIcon />
          Download on App Store
        </a>
        
        <a
          href="https://play.google.com/store/apps/details?id=com.Eventop"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition"
        >
          <PlayStoreIcon />
          Get it on Google Play
        </a>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <p className="text-sm text-gray-600 mb-2 font-semibold">
          After installing:
        </p>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Open the app and create your account</li>
          <li>Return to this page</li>
          <li>Complete your subscription</li>
        </ol>
      </div>

      {/* Cancel */}
      <button
        onClick={() => window.location.href = session.cancelUrl}
        className="w-full mt-4 text-gray-500 py-2 text-sm hover:text-gray-700"
      >
        Cancel and return to {session.merchant.companyName}
      </button>
    </div>
  );
}

function AppInstalledFlow({ session }: { session: any }) {
  const [opening, setOpening] = useState(false);

  const handleContinueInApp = () => {
    setOpening(true);
    
    // Open app with deep link
    const deepLink = `exp://8gtihio-jussec-8081.exp.direct/--/subscribe?sessionId=${session.sessionId}`
    // const deepLink = `eventop://subscribe?sessionId=${session.sessionId}`;
    window.location.href = deepLink;

    // Fallback: if app doesn't open in 3 seconds, show help
    setTimeout(() => {
      setOpening(false);
    }, 3000);
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-green-700">
          <span className="text-xl">✓</span>
          <span className="font-semibold">App detected!</span>
        </div>
      </div>

      <button
        onClick={handleContinueInApp}
        disabled={opening}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
      >
        {opening ? 'Opening app...' : 'Continue in Eventop App →'}
      </button>

      <div className="text-center">
        <p className="text-sm text-gray-500 mb-2">
          You&apos;ll be redirected to the app to complete your subscription
        </p>
      </div>

      {/* Manual Link (fallback) */}
      <details className="text-sm text-gray-500">
        <summary className="cursor-pointer hover:text-gray-700">
          App not opening?
        </summary>
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <p className="mb-2">Try these steps:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Open the Eventop app manually</li>
            <li>Go to &quot;Scan&quot; or &quot;Subscribe&quot;</li>
            <li>Enter code: <code className="bg-white px-2 py-1 rounded">{session.sessionId.slice(0, 8)}</code></li>
          </ol>
        </div>
      </details>

      <button
        onClick={() => window.location.href = session.cancelUrl}
        className="w-full text-gray-500 py-2 text-sm hover:text-gray-700"
      >
        Cancel
      </button>
    </div>
  );
}

function DetectingAppStatus() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
      <p className="text-gray-500">Checking for Eventop app...</p>
    </div>
  );
}