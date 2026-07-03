import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Settings, Phone, Mail, MapPin, Compass, ShieldCheck } from 'lucide-react';
import { SettingsModal } from './SettingsModal';

export const Footer: React.FC = () => {
  const { settings, isAdminActive, isAdminLoggedIn, setCurrentTab } = useStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = () => {
    setLogoClicks(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setIsSettingsOpen(true);
        return 0;
      }
      return next;
    });
    // Reset count if user stops clicking for 2 seconds
    const timer = setTimeout(() => {
      setLogoClicks(0);
    }, 2000);
    return () => clearTimeout(timer);
  };

  return (
    <footer className="bg-brand-charcoal border-t border-[#1c1d24] text-brand-gray-light pt-16 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Brand & Philosophy */}
          <div className="md:col-span-2 space-y-4 text-left">
            <span 
              onClick={handleLogoClick}
              className="font-serif text-xl sm:text-2xl tracking-[0.2em] text-[#cfa861] font-medium block cursor-pointer select-none active:scale-95 transition-transform"
              title="Masdar Al-Riyadh Trading Co."
            >
              MASDAR AL-RIYADH
            </span>
            <p className="text-xs text-brand-gray-muted leading-relaxed max-w-sm">
              Supplying premium-grade timber, structural steel, industrial piping, and certified safety equipment across Riyadh with absolute quality assurance.
            </p>
            <div className="flex gap-4 pt-2 text-[#cfa861]/70 text-xs items-center">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> SASO & ASTM Certified</span>
              <span className="flex items-center gap-1"><Compass className="w-3.5 h-3.5" /> Crane-Equipped Logistics</span>
            </div>
          </div>

          {/* Column 2: Client Concierge */}
          <div className="space-y-4 text-left">
            <h4 className="font-serif text-xs tracking-[0.2em] text-white uppercase font-semibold">
              Client Concierge
            </h4>
            <ul className="space-y-2.5 text-xs text-brand-gray-muted">
              <li>
                <button onClick={() => setCurrentTab('shop')} className="hover:text-[#cfa861] transition-colors">
                  View Materials Catalog
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('order-tracker')} className="hover:text-[#cfa861] transition-colors">
                  Track Existing Order
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentTab(isAdminLoggedIn ? 'admin' : 'admin-login')} 
                  className="hover:text-[#cfa861] text-[#cfa861] font-medium transition-colors"
                >
                  {isAdminLoggedIn ? 'Partner Portal (Admin)' : 'Partner Portal Login'}
                </button>
              </li>
              <li>
                <span className="block text-brand-gray-muted/50">Sunday to Thursday: 9:00 AM – 9:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Coordinates */}
          <div className="space-y-4 text-left">
            <h4 className="font-serif text-xs tracking-[0.2em] text-white uppercase font-semibold">
              Contact Coordinates
            </h4>
            <ul className="space-y-2.5 text-xs text-brand-gray-muted">
              <li className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-[#cfa861] flex-shrink-0 mt-0.5" />
                <span>{settings.contactPhone}</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-[#cfa861] flex-shrink-0 mt-0.5" />
                <span className="break-all">{settings.contactEmail}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#cfa861] flex-shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-[#1c1d24]/60 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-brand-gray-muted">
          <div>
            &copy; {new Date().getFullYear()} Masdar Al-Riyadh Trading Co. (Masdar Building Materials). All Rights Reserved. Riyadh, Saudi Arabia.
          </div>
          
          {/* Settings trigger & Social Links */}
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setCurrentTab(isAdminLoggedIn ? 'admin' : 'admin-login')}
              className="text-[#cfa861]/70 hover:text-[#cfa861] transition-colors text-[10px] tracking-wider uppercase font-medium flex items-center gap-1"
            >
              <span>{isAdminLoggedIn ? 'Partner Panel' : 'Partner Portal'}</span>
            </button>

            {/* Gear Cog Trigger */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-md hover:bg-brand-charcoal text-brand-gray-muted/40 hover:text-[#cfa861] transition-all cursor-pointer"
              aria-label="System Settings"
            >
              <Settings className="w-4 h-4 text-[#cfa861] animate-spin-slow" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </footer>
  );
};
