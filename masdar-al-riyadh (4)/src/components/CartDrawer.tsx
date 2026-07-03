import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Mail, MapPin, Check, LogIn, Loader2 } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    getCartSubtotal,
    getCartTotal,
    placeOrder,
    settings,
    setCurrentTab,
    currentUser,
    loginWithGoogle,
    authLoading
  } = useStore();

  // Checkout phases: 'cart' | 'checkout' | 'success'
  const [phase, setPhase] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  // Form coordinates
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Al Yasmin');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auto-populate or clear fields based on Google sign in status
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.displayName || '');
      setEmail(currentUser.email || '');
    } else {
      setName('');
      setEmail('');
    }
  }, [currentUser]);

  if (!isCartOpen) return null;

  const handleClose = () => {
    setIsCartOpen(false);
    // Only reset phase if not successful
    if (phase !== 'success') {
      setPhase('cart');
    }
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    setPhase('checkout');
  };

  const handleBackToCart = () => {
    setPhase('cart');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    if (!name.trim()) {
      setSubmitting(false);
      return setFormError('Full name is required.');
    }
    if (!phone.trim()) {
      setSubmitting(false);
      return setFormError('Saudi telephone contact is required.');
    }
    if (!email.trim() || !email.includes('@')) {
      setSubmitting(false);
      return setFormError('A valid email coordinate is required.');
    }
    if (!address.trim()) {
      setSubmitting(false);
      return setFormError('Precise villa or office address is required.');
    }

    const fullAddress = `${address}, ${district} District, Riyadh, Saudi Arabia. Notes: ${notes || 'None'}`;
    
    // Process creation
    try {
      const order = await placeOrder({
        name,
        phone,
        email,
        address: fullAddress
      }, 'cash_on_delivery');
      
      setCreatedOrder(order);
      setPhase('success');
    } catch (err: any) {
      setFormError(err.message || 'Failed to reserve stock. Some items might have sold out.');
    } finally {
      setSubmitting(false);
    }
  };

  const riyadhDistricts = [
    'Al Yasmin', 'Al Malqa', 'Al Narjis', 'Al Aqeeq', 'Al Qairawan', 'Al Hada', 'Al Safarat (Diplomatic Quarter)', 'Al Sulaimaniyah', 'Olaya'
  ];

  return (
    <div className="fixed inset-0 z-[90] flex justify-end bg-black/80 backdrop-blur-xs">
      {/* Backdrop area trigger close */}
      <div className="absolute inset-0 cursor-pointer" onClick={handleClose} />

      {/* Cart Container Drawer */}
      <div className="relative w-full max-w-md h-full bg-[#0c0d10] border-l border-[#1c1d24] flex flex-col justify-between text-left shadow-2xl animate-fade-in">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#1c1d24] flex justify-between items-center bg-brand-charcoal">
          <div className="space-y-0.5">
            <h3 className="font-serif text-lg text-white tracking-wider uppercase font-medium">
              {phase === 'cart' && 'Your Selected Materials'}
              {phase === 'checkout' && 'Riyadh Jobsite Delivery Coordinates'}
              {phase === 'success' && 'Materials Reserved'}
            </h3>
            <p className="text-[10px] text-brand-gray-muted tracking-widest font-sans uppercase">
              {phase === 'cart' && `${cart.length} unique items`}
              {phase === 'checkout' && 'Site delivery & offloading services'}
              {phase === 'success' && `Receipt #${createdOrder?.id}`}
            </p>
          </div>
          <button 
            onClick={handleClose} 
            className="p-1 rounded-full hover:bg-[#1c1d24] text-brand-gray-muted hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PHASES BODY AREA */}
        <div className="flex-grow overflow-y-auto p-6 font-sans">
          
          {/* PHASE A: CART LIST */}
          {phase === 'cart' && (
            <div className="h-full flex flex-col justify-between">
              {cart.length > 0 ? (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-4 border-b border-[#1c1d24]/60 pb-5">
                      {/* Image Thumbnail */}
                      <div className="w-20 h-20 bg-brand-charcoal border border-[#1c1d24] flex-shrink-0 rounded-sm overflow-hidden">
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Detail Info */}
                      <div className="flex-grow flex flex-col justify-between py-0.5">
                        <div className="space-y-1">
                          <h4 className="text-white text-xs font-serif font-medium tracking-wide line-clamp-1">
                            {item.product.name}
                          </h4>
                          <p className="text-[#cfa861] text-[11px] font-mono">
                            {item.product.price.toLocaleString()} SAR
                          </p>
                        </div>

                        {/* Adjust quantities */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center bg-[#0c0d10] border border-[#252731] rounded">
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 text-brand-gray-muted hover:text-white transition-colors cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs text-white font-mono">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 text-brand-gray-muted hover:text-white transition-colors cursor-pointer"
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-brand-gray-muted/40 hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                  <div className="p-4 bg-brand-charcoal rounded-full text-brand-gray-muted/30 border border-[#1c1d24]">
                    <Trash2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif text-white text-base">Your materials list is empty</h4>
                  <p className="text-xs text-brand-gray-muted max-w-xs leading-relaxed font-light">
                    Browse our Materials Catalog and select high-quality wood, steel, or plumbing supplies for your construction project.
                  </p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setCurrentTab('shop');
                    }}
                    className="mt-2 text-[#cfa861] text-xs font-semibold tracking-widest uppercase border-b border-[#cfa861] pb-1.5"
                  >
                    View Materials
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PHASE B: CHECKOUT FORM COORDINATES */}
          {phase === 'checkout' && (
            !currentUser ? (
              <div className="space-y-6 text-center py-8 animate-fade-in">
                <div className="w-16 h-16 bg-[#cfa861]/10 border border-[#cfa861]/30 rounded-full flex items-center justify-center text-[#cfa861] mx-auto">
                  <LogIn className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-serif text-lg text-white font-medium uppercase tracking-wide">Google Login Required</h4>
                  <p className="text-xs text-brand-gray-muted max-w-xs mx-auto leading-relaxed font-light">
                    To place an order and track your material shipments in real-time, please sign in with your Google account. All your orders will be securely tied to your Google profile for easy tracking and cancellation (like Flipkart).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  className="w-full bg-[#cfa861] hover:bg-[#e6b96c] text-[#0c0d10] font-sans text-xs tracking-widest uppercase py-3.5 rounded font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In with Google</span>
                </button>
                <button
                  type="button"
                  onClick={handleBackToCart}
                  className="w-full border border-[#252731] hover:bg-brand-charcoal text-white text-xs uppercase tracking-wider py-3.5 rounded transition-colors font-medium cursor-pointer font-mono"
                >
                  Back to Material List
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1 bg-brand-charcoal/40 border border-[#1c1d24] p-4 rounded text-xs mb-4">
                  <span className="text-[#cfa861] tracking-wider uppercase font-semibold font-mono block">Riyadh Jobsite Logistics</span>
                  <p className="text-brand-gray-muted leading-relaxed font-light">
                    All bulk building materials placed in Riyadh are dispatched via our specialized heavy-duty transport fleet within 72 hours, with secure jobsite unloading.
                  </p>
                </div>

                {formError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded">
                    {formError}
                  </div>
                )}

                <fieldset disabled={submitting} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Ahmed Al-Saud"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-3 py-2 text-sm text-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-1.5">Phone Contact</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g., +966 50 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-3 py-2 text-sm text-white focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-1.5">Email coordinate</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g., ahmed@email.sa"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-3 py-2 text-sm text-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-1.5">Riyadh District</label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                      >
                        {riyadhDistricts.map((dist, idx) => (
                          <option key={idx} value={dist}>{dist} District</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-1.5">Delivery / Site Address</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Block 4, Construction Site, Street 10"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-1.5">Special Delivery Instructions (Optional)</label>
                    <textarea
                      placeholder="e.g., Gate code or elevator access information..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-3 py-2 text-xs text-white focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <div className="bg-[#0c0d10] p-4 rounded border border-[#252731] space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-brand-gray-muted block">Payment Method</span>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border border-[#cfa861] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#cfa861]" />
                      </div>
                      <div className="text-xs">
                        <strong className="text-white font-medium block">Cash or Card on Delivery (COD)</strong>
                        <span className="text-[10px] text-brand-gray-muted block leading-relaxed font-light mt-0.5">
                          Pay via Mada, Visa, or bank transfer upon jobsite delivery and inspection. Zero extra fees apply.
                        </span>
                      </div>
                    </div>
                  </div>
                </fieldset>

                {/* Action buttons inside form */}
                <div className="flex gap-3 pt-4 border-t border-[#1c1d24] mt-6">
                  <button
                    type="button"
                    onClick={handleBackToCart}
                    disabled={submitting}
                    className="w-1/3 border border-[#252731] hover:bg-brand-charcoal text-white text-xs uppercase tracking-wider py-3.5 rounded transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-2/3 bg-[#cfa861] hover:bg-[#e6b96c] text-[#0c0d10] text-xs uppercase tracking-[0.15em] py-3.5 rounded font-semibold transition-colors flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Authorizing...</span>
                      </>
                    ) : (
                      <>
                        <span>Authorize Order Request</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )
          )}

          {/* PHASE C: SUCCESS SCREEN */}
          {phase === 'success' && createdOrder && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mx-auto animate-pulse">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h4 className="font-serif text-xl text-white font-medium">Materials Order Request Secured</h4>
                <p className="text-xs text-brand-gray-muted max-w-xs mx-auto leading-relaxed font-light">
                  We have received your site delivery coordinates. Your building supplies have been allocated at our Al-Yasmin hub. Our logistics manager will contact you shortly to coordinate delivery.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-[#0c0d10] p-5 rounded border border-[#1c1d24] text-left space-y-4">
                <div className="flex justify-between items-center text-xs border-b border-[#1c1d24]/60 pb-3">
                  <span className="text-brand-gray-muted uppercase tracking-wider">Order ID Code</span>
                  <span className="text-[#cfa861] font-mono font-semibold tracking-wider uppercase">{createdOrder.id}</span>
                </div>

                <div className="space-y-3 max-h-32 overflow-y-auto pr-1">
                  {createdOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-brand-gray-light font-light line-clamp-1 max-w-[200px]">
                        {item.name} <span className="text-brand-gray-muted font-mono font-light">x{item.quantity}</span>
                      </span>
                      <span className="text-[#cfa861] font-mono">{(item.price * item.quantity).toLocaleString()} SAR</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#1c1d24]/60 pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-brand-gray-muted font-light">
                    <span>White-Glove Delivery</span>
                    <span>{createdOrder.deliveryFee} SAR</span>
                  </div>
                  <div className="flex justify-between items-center text-white font-medium">
                    <span>Total Amount</span>
                    <span className="text-[#cfa861] font-mono">{createdOrder.grandTotal.toLocaleString()} SAR</span>
                  </div>
                </div>
              </div>

              {/* MOCK EMAIL CONFIRMATION NOTIFICATION */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded flex items-start gap-2.5 text-left text-[11px] text-emerald-400">
                <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed font-light">
                  <strong>Notification:</strong> A confirmation e-mail with invoice breakdown has been dispatched to <strong>{createdOrder.customer.email}</strong>.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setCurrentTab('order-tracker');
                  }}
                  className="w-full py-3 bg-[#cfa861] text-[#0c0d10] hover:bg-[#e6b96c] transition-all text-xs tracking-wider uppercase font-semibold text-center rounded block"
                >
                  Track Order Progress
                </button>
                <button
                  onClick={() => {
                    setPhase('cart');
                    setCreatedOrder(null);
                    setIsCartOpen(false);
                    setCurrentTab('home');
                  }}
                  className="w-full py-3 border border-[#252731] hover:bg-brand-charcoal text-white text-xs tracking-wider uppercase font-medium rounded block text-center"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM SUMMARY FOOTER AREA (ONLY IF NOT COMPLETED) */}
        {phase !== 'success' && cart.length > 0 && (
          <div className="p-6 border-t border-[#1c1d24] bg-brand-charcoal space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-brand-gray-muted font-light">
                <span>Items Subtotal</span>
                <span className="text-white font-mono">{getCartSubtotal().toLocaleString()} SAR</span>
              </div>
              <div className="flex justify-between text-xs text-brand-gray-muted font-light">
                <span>Riyadh Jobsite Delivery</span>
                <span className="text-white font-mono">{settings.deliveryCharge} SAR</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-[#1c1d24]/60 font-semibold text-white">
                <span>Total Amount</span>
                <span className="text-[#cfa861] font-mono text-base">{getCartTotal().toLocaleString()} SAR</span>
              </div>
            </div>

            {/* CTA action button outside form */}
            {phase === 'cart' && (
              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-[#cfa861] hover:bg-[#e6b96c] text-[#0c0d10] py-4 rounded font-semibold text-xs tracking-[0.2em] uppercase transition-colors flex justify-center items-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-brand-gray-muted tracking-wider uppercase font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#cfa861]" />
              <span>Complimentary Site Unloading Included</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
