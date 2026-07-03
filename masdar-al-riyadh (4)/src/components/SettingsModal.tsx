import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Lock, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    settings, 
    isAdminActive, 
    setAdminActive, 
    setCurrentTab,
    updateSettings 
  } = useStore();
  
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === settings.adminPasswordHash) {
      setAdminActive(true);
      setStatusMessage({
        type: 'success',
        text: 'Terminal Authorized. The hidden Admin Access portals are now active in the navigation and footer structures.'
      });
      // Auto-redirect to admin login after short delay
      setTimeout(() => {
        onClose();
        setCurrentTab('admin-login');
      }, 2000);
    } else {
      setStatusMessage({
        type: 'error',
        text: 'Verification failed. Incorrect system access credentials.'
      });
    }
  };

  const handleLockTerminal = () => {
    setAdminActive(false);
    setPasswordInput('');
    setStatusMessage({
      type: 'success',
      text: 'Terminal locked. Admin pathways successfully hidden.'
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-md bg-brand-charcoal border border-[#1c1d24] rounded-lg p-6 sm:p-8 animate-fade-in text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-gray-muted hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#cfa861]/10 rounded text-[#cfa861]">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg tracking-[0.1em] text-white uppercase font-medium">
              System Configuration
            </h3>
          </div>
          <p className="text-xs text-brand-gray-muted leading-relaxed font-sans">
            Enter the master credential key to authorize this terminal and unveil the administrative control portals.
          </p>
        </div>

        {/* Authorization Form */}
        <form onSubmit={handleVerifyPassword} className="space-y-4">
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-brand-gray-muted mb-2 font-medium">
              Admin Access Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-3 text-sm text-white focus:outline-none transition-colors pr-10 font-mono tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-brand-gray-muted hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* System status feedback */}
          {statusMessage && (
            <div className={`p-4 rounded text-xs flex items-start gap-3 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed font-sans">{statusMessage.text}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {isAdminActive ? (
              <button
                type="button"
                onClick={handleLockTerminal}
                className="w-full border border-red-500/30 hover:border-red-500 text-red-400 font-sans text-xs tracking-[0.15em] uppercase py-3 rounded hover:bg-red-500/5 transition-all font-medium cursor-pointer"
              >
                Deauthorize Terminal
              </button>
            ) : (
              <button
                type="submit"
                className="w-full bg-[#cfa861] hover:bg-[#e6b96c] text-[#0c0d10] font-sans text-xs tracking-[0.15em] uppercase py-3 rounded font-semibold transition-colors cursor-pointer"
              >
                Verify & Unlock
              </button>
            )}
          </div>
        </form>

        {/* Instructions footer info */}
        <div className="mt-6 pt-4 border-t border-[#1c1d24] flex justify-between items-center text-[10px] text-brand-gray-muted font-sans">
          <span>SECURE TERMINAL ACCESS</span>
          <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-brand-charcoal border border-[#252731] rounded">KSA V1.0</span>
        </div>
      </div>
    </div>
  );
};
