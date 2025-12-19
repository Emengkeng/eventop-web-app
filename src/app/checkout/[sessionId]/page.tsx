"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppleIcon } from 'lucide-react';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#171717]"></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg border border-[#E2E3F0] overflow-hidden">
        
        {/* Header */}
        <div className="bg-white border-b border-[#E2E3F0] p-8">
          <div className="flex items-center gap-3 mb-6">
            {session.merchant.logoUrl && (
              <img 
                src={session.merchant.logoUrl} 
                alt={session.merchant.companyName}
                className="w-12 h-12 rounded-lg border border-[#E2E3F0]"
              />
            )}
            <div>
              <h1 className="text-2xl font-medium text-[#040217] font-abc-favorit">
                {session.plan.planName}
              </h1>
              <p className="text-[#6B7280] text-sm">
                from {session.merchant.companyName}
              </p>
            </div>
          </div>
          
          <div className="text-4xl font-medium text-[#040217] font-abc-favorit">
            ${(parseFloat(session.plan.feeAmount) / 1_000_000).toFixed(2)}
            <span className="text-lg font-normal text-[#6B7280]">/month</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          
          {/* Subscribing As */}
          <div className="bg-[#F8F9FA] rounded-xl p-4 mb-6 border border-[#E2E3F0]">
            <p className="text-sm text-[#6B7280] mb-1">Subscribing as</p>
            <p className="font-medium text-[#040217]">{session.customerEmail}</p>
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
      <div className="bg-[#F0F4FF] border border-[#D1E0FF] rounded-xl p-6 mb-6">
        <div className="flex items-start gap-3">
          <div className="text-3xl">📱</div>
          <div>
            <h3 className="font-medium text-[#040217] mb-2">
              Download Eventop App to Continue
            </h3>
            <p className="text-sm text-[#6B7280] mb-4">
              To subscribe, you&apos;ll need the Eventop app. It&apos;s free and takes 
              just 2 minutes to set up your account.
            </p>
            <ul className="space-y-2 text-sm text-[#6B7280] mb-4">
              <li className="flex items-center gap-2">
                <span className="text-[#10B981]">✓</span>
                Create your subscription wallet
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#10B981]">✓</span>
                Manage all subscriptions in one place
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#10B981]">✓</span>
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
          className="flex items-center justify-center gap-3 w-full bg-[#171717] text-white py-4 rounded-xl font-medium hover:bg-[#040217] transition"
        >
          <AppleIcon />
          Download on App Store
        </a>
        
        <a
          href="https://play.google.com/store/apps/details?id=com.Eventop"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-[#171717] text-white py-4 rounded-xl font-medium hover:bg-[#040217] transition"
        >
          <PlayStoreIcon />
          Get it on Google Play
        </a>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-[#F8F9FA] rounded-xl border border-[#E2E3F0]">
        <p className="text-sm text-[#6B7280] mb-2 font-medium">
          After installing:
        </p>
        <ol className="text-sm text-[#6B7280] space-y-1 list-decimal list-inside">
          <li>Open the app and create your account</li>
          <li>Return to this page</li>
          <li>Complete your subscription</li>
        </ol>
      </div>

      {/* Cancel */}
      <button
        onClick={() => window.location.href = session.cancelUrl}
        className="w-full mt-4 text-[#6B7280] py-2 text-sm hover:text-[#040217]"
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
    // const deepLink = `exp://8gtihio-jussec-8081.exp.direct/--/subscribe/${session.sessionId}`
    const deepLink = `eventop://subscribe/${session.sessionId}`;
    window.location.href = deepLink;

    // Fallback: if app doesn't open in 3 seconds, show help
    setTimeout(() => {
      setOpening(false);
    }, 3000);
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#F0FDF4] border border-[#D1FAE5] rounded-xl p-4">
        <div className="flex items-center gap-2 text-[#10B981]">
          <span className="text-xl">✓</span>
          <span className="font-medium">App detected!</span>
        </div>
      </div>

      <button
        onClick={handleContinueInApp}
        disabled={opening}
        className="w-full bg-[#5B4FFF] text-white py-4 rounded-xl font-medium hover:bg-[#4A3EE6] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {opening ? 'Opening app...' : 'Continue in Eventop App →'}
      </button>

      <div className="text-center">
        <p className="text-sm text-[#6B7280] mb-2">
          You&apos;ll be redirected to the app to complete your subscription
        </p>
      </div>

      {/* Manual Link (fallback) */}
      <details className="text-sm text-[#6B7280]">
        <summary className="cursor-pointer hover:text-[#040217] font-medium">
          App not opening?
        </summary>
        <div className="mt-2 p-3 bg-[#F8F9FA] rounded-lg border border-[#E2E3F0]">
          <p className="mb-2 font-medium">Try these steps:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Open the Eventop app manually</li>
            <li>Go to &quot;Scan&quot; or &quot;Subscribe&quot;</li>
            <li>Enter code: <code className="bg-white px-2 py-1 rounded border border-[#E2E3F0]">{session.sessionId.slice(0, 8)}</code></li>
          </ol>
        </div>
      </details>

      <details className="text-sm text-[#6B7280]">
        <summary className="cursor-pointer hover:text-[#040217] font-medium">
          I dont have the app installed
        </summary>
        <div className="mt-2 p-3 bg-[#F8F9FA] rounded-lg border border-[#E2E3F0]">
          <p className="mb-2 font-medium">Download the app:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li><a href="https://expo.dev/artifacts/eas/hSQDeyJvU7aFoEVLgaMyzz.apk" className="text-[#5B4FFF] hover:underline">Download the android version of the app</a></li>
          </ol>
        </div>
      </details>

      <button
        onClick={() => window.location.href = session.cancelUrl}
        className="w-full text-[#6B7280] py-2 text-sm hover:text-[#040217]"
      >
        Cancel
      </button>
    </div>
  );
}

function DetectingAppStatus() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B4FFF] mb-4"></div>
      <p className="text-[#6B7280]">Checking for Eventop app...</p>
    </div>
  );
}