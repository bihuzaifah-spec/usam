import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Homepage } from './components/Homepage';
import { CustomerShop } from './components/CustomerShop';
import { OrderTracker } from './components/OrderTracker';
import { CartDrawer } from './components/CartDrawer';
import { AdminPanel } from './components/AdminPanel';
import { AlertTriangle, Copy, ExternalLink, X, Check } from 'lucide-react';
import { firebaseConfig } from './lib/firebase';

function AppContent() {
  const { currentTab, authError, setAuthError } = useStore();
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const domainsToAuthorize = Array.from(new Set([
    currentHost,
    'usam-eight.vercel.app',
    'ais-dev-rb5e2trrg3h2xrlrvlgnwx-777397636386.asia-southeast1.run.app',
    'ais-pre-rb5e2trrg3h2xrlrvlgnwx-777397636386.asia-southeast1.run.app',
    'localhost'
  ])).filter(Boolean);

  return (
    <div className="flex flex-col min-h-screen bg-brand-black text-brand-gray-light">
      {/* Navigation Header */}
      {currentTab !== 'admin' && <Navbar />}

      {/* Main Screen Layout Container */}
      <main className="flex-grow">
        {currentTab === 'home' && <Homepage />}
        {currentTab === 'shop' && <CustomerShop />}
        {currentTab === 'order-tracker' && <OrderTracker />}
        {(currentTab === 'admin' || currentTab === 'admin-login') && <AdminPanel />}
      </main>

      {/* Footer Area */}
      {currentTab !== 'admin' && <Footer />}

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* Auth Error Guidance Modal */}
      {authError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden border border-[#252731] rounded-lg bg-brand-charcoal text-white shadow-2xl">
            {/* Top accent bar */}
            <div className="h-1 bg-[#cfa861]" />

            <button 
              onClick={() => setAuthError(null)}
              className="absolute p-1 rounded-full top-4 right-4 text-brand-gray-muted hover:text-white hover:bg-[#252731] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2.5 rounded-full bg-red-950/40 border border-red-500/30 text-red-500">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-sans text-base font-semibold tracking-wide text-white uppercase">
                    {authError === 'unauthorized-domain' ? 'Domain Authorization Required' : 'Google Sign-In Failed'}
                  </h3>

                  {authError === 'unauthorized-domain' ? (
                    <div className="mt-2 text-xs leading-relaxed text-brand-gray-light">
                      <p className="mb-3">
                        Firebase Authentication has declined this login request because the current domain is not configured under your Firebase authorized domains list.
                      </p>
                      
                      <div className="p-3 mb-4 rounded border border-[#252731] bg-[#0c0d10] text-[#cfa861] font-mono select-all">
                        Error: auth/unauthorized-domain
                      </div>

                      <h4 className="mb-1.5 font-sans font-medium text-white uppercase tracking-wider text-[10px]">
                        How to solve this step-by-step:
                      </h4>
                      <ol className="mb-4 space-y-3 list-decimal list-inside text-brand-gray-muted">
                        <li>
                          Open your Firebase Console:
                          <a 
                            href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`} 
                            target="_blank" 
                            referrerPolicy="no-referrer"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 ml-1.5 text-[#cfa861] hover:underline font-semibold"
                          >
                            <span>Open Firebase Settings</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </li>
                        <li>
                          Scroll down to the <strong className="text-white">Authorized domains</strong> section.
                        </li>
                        <li>
                          Click <strong className="text-white">Add domain</strong> and add the following domains:
                          <div className="mt-2 space-y-1.5 pl-2">
                            {domainsToAuthorize.map((domain) => (
                              <div key={domain} className="flex items-center justify-between gap-2 p-1.5 rounded bg-[#1c1d24] border border-[#252731]">
                                <span className="font-mono text-[10px] text-white truncate select-all">{domain}</span>
                                <button
                                  onClick={() => handleCopy(domain)}
                                  className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-sans font-medium uppercase tracking-wider bg-[#252731] hover:bg-[#cfa861] hover:text-[#0c0d10] transition-all cursor-pointer"
                                >
                                  {copiedText === domain ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        </li>
                      </ol>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs leading-relaxed text-brand-gray-light">
                      <p className="mb-4">
                        An error occurred while signing in with Google:
                      </p>
                      <div className="p-3 mb-4 rounded border border-[#252731] bg-[#0c0d10] text-red-400 font-mono">
                        {authError}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setAuthError(null)}
                      className="px-4 py-2 font-sans text-[10px] tracking-widest uppercase text-[#0c0d10] bg-[#cfa861] hover:bg-white rounded transition-colors font-medium cursor-pointer"
                    >
                      Understood
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

