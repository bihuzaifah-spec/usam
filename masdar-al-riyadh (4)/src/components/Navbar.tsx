import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Menu, X, Lock, ClipboardList } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentTab, 
    setCurrentTab, 
    cart, 
    setIsCartOpen, 
    isAdminActive, 
    isAdminLoggedIn,
    setAdminLoggedIn,
    currentUser,
    loginWithGoogle,
    logout
  } = useStore();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Materials Catalog' },
    { id: 'order-tracker', label: 'Track Order' },
  ];

  const handleNavClick = (tabId: any) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setAdminLoggedIn(false);
    setCurrentTab('home');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0c0d10]/90 backdrop-blur-md border-b border-[#1c1d24]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Brand Logo */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex-shrink-0 flex items-center cursor-pointer select-none"
          >
            <div className="text-left">
              <span className="font-serif text-lg sm:text-xl md:text-2xl tracking-[0.2em] text-[#cfa861] font-medium block">
                MASDAR AL-RIYADH
              </span>
              <span className="font-sans text-[8px] tracking-[0.4em] text-brand-gray-muted block -mt-1 uppercase">
                Building Materials & Timber
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8 items-center">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`font-sans text-xs tracking-[0.2em] uppercase transition-colors duration-300 ${
                  currentTab === item.id 
                    ? 'text-[#cfa861] font-medium' 
                    : 'text-brand-gray-muted hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Admin Access Button - Always visible for team members/viewers to log in */}
            <button
              onClick={() => handleNavClick(isAdminLoggedIn ? 'admin' : 'admin-login')}
              className={`flex items-center gap-1.5 font-sans text-xs tracking-[0.2em] uppercase border px-3 py-1.5 rounded-sm border-[#cfa861]/40 transition-all ${
                currentTab === 'admin' || currentTab === 'admin-login'
                  ? 'bg-[#cfa861] text-[#0c0d10]'
                  : 'text-[#cfa861] hover:bg-[#cfa861]/10'
              }`}
            >
              <Lock className="w-3 h-3" />
              {isAdminLoggedIn ? 'Admin Panel' : 'Admin Login'}
            </button>

            {isAdminLoggedIn && (
              <button
                onClick={handleLogout}
                className="text-xs tracking-[0.2em] uppercase text-red-400/80 hover:text-red-400"
              >
                Log Out
              </button>
            )}

            {/* Google Login Status */}
            {currentUser ? (
              <div className="flex items-center gap-3 border-l border-[#1c1d24] pl-4">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt={currentUser.displayName || ''} className="w-6 h-6 rounded-full border border-[#cfa861]/30" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-brand-charcoal border border-[#cfa861]/30 flex items-center justify-center text-[10px] text-white">
                    {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                  </div>
                )}
                <div className="text-left hidden lg:block">
                  <span className="text-[10px] font-medium text-white block leading-tight">{currentUser.displayName}</span>
                  <button onClick={logout} className="text-[8px] tracking-widest text-[#cfa861] uppercase hover:underline block leading-tight">Logout</button>
                </div>
                <button onClick={logout} className="text-[10px] tracking-widest text-[#cfa861] uppercase hover:underline block lg:hidden">Logout</button>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="font-sans text-[10px] tracking-[0.2em] uppercase text-white hover:text-[#cfa861] flex items-center gap-2 border border-[#252731] hover:border-[#cfa861] rounded px-3 py-1.5 transition-all cursor-pointer"
              >
                <span>Google Login</span>
              </button>
            )}
          </div>

          {/* Cart Trigger & Mobile Menu Toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full hover:bg-brand-charcoal transition-colors group cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-brand-gray-light group-hover:text-[#cfa861] transition-colors" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#cfa861] text-[#0c0d10] font-sans text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-full hover:bg-brand-charcoal text-brand-gray-light transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c0d10] border-t border-[#1c1d24] py-4 px-6 space-y-4 animate-fade-in">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`block w-full text-left font-sans text-xs tracking-[0.2em] uppercase py-2 ${
                currentTab === item.id ? 'text-[#cfa861]' : 'text-brand-gray-muted'
              }`}
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={() => handleNavClick(isAdminLoggedIn ? 'admin' : 'admin-login')}
            className="flex items-center gap-2 w-full text-left font-sans text-xs tracking-[0.2em] uppercase py-2 text-[#cfa861]"
          >
            <Lock className="w-3.5 h-3.5" />
            {isAdminLoggedIn ? 'Admin Panel' : 'Admin Login'}
          </button>

          {isAdminLoggedIn && (
            <button
              onClick={handleLogout}
              className="block w-full text-left font-sans text-xs tracking-[0.2em] uppercase py-2 text-red-400"
            >
              Log Out
            </button>
          )}

          {/* Mobile Google Auth Status */}
          <div className="pt-2 border-t border-[#1c1d24]/60">
            {currentUser ? (
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2.5 text-left">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt={currentUser.displayName || ''} className="w-6 h-6 rounded-full border border-[#cfa861]/30" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-brand-charcoal border border-[#cfa861]/30 flex items-center justify-center text-[10px] text-white font-serif">
                      {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                    </div>
                  )}
                  <span className="text-xs font-serif font-medium text-white">{currentUser.displayName}</span>
                </div>
                <button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }} 
                  className="text-[10px] tracking-widest text-red-400 uppercase font-sans font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  loginWithGoogle();
                  setMobileMenuOpen(false);
                }}
                className="w-full font-sans text-xs tracking-[0.2em] uppercase text-white hover:text-[#cfa861] flex items-center justify-center gap-2 border border-[#252731] hover:border-[#cfa861] rounded py-2.5 transition-all cursor-pointer"
              >
                <span>Google Login</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
