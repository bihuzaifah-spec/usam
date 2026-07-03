import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, MapPin, Truck, CheckCircle2, Clock, Ban, PhoneCall, HelpCircle, LogIn, ChevronDown, ChevronUp, AlertCircle, Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const OrderTracker: React.FC = () => {
  const { 
    orders, 
    currentUser, 
    loginWithGoogle, 
    updateOrderStatus, 
    setCurrentTab 
  } = useStore();

  // Search input states (for guest orders tracking)
  const [orderIdInput, setOrderIdInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(null);
  const [guestTrackedOrder, setGuestTrackedOrder] = useState<any | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // Derive foundOrder dynamically from Firestore or local state
  const foundOrder = React.useMemo(() => {
    if (guestTrackedOrder) return guestTrackedOrder;
    if (!trackedOrderId) return null;
    return orders.find(ord => ord.id === trackedOrderId);
  }, [orders, trackedOrderId, guestTrackedOrder]);

  // Accordion toggle states for user orders
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setTrackingError(null);
    setTrackingLoading(true);
    setGuestTrackedOrder(null);
    setTrackedOrderId(null);
    
    // Normalize string checks
    const targetId = orderIdInput.trim().toUpperCase();
    const targetPhone = phoneInput.trim().replace(/\s+/g, '');

    if (!targetId || !targetPhone) {
      setTrackingError('Please enter both Order ID and Phone Number.');
      setTrackingLoading(false);
      return;
    }

    try {
      // 1. Check if the order is already in the synced orders list (for logged-in users)
      const cachedOrder = orders.find(ord => {
        const matchId = ord.id.toUpperCase() === targetId;
        const matchPhone = ord.customer.phone.replace(/\s+/g, '').includes(targetPhone) || 
                            targetPhone.includes(ord.customer.phone.replace(/\s+/g, ''));
        return matchId && matchPhone;
      });

      if (cachedOrder) {
        setTrackedOrderId(cachedOrder.id);
        setGuestTrackedOrder(cachedOrder);
        setTrackingLoading(false);
        return;
      }

      // 2. Otherwise, fetch directly from Firestore using the document ID (Order ID)
      const docRef = doc(db, 'orders', targetId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const ord = docSnap.data();
        const ordPhone = ord.customer.phone.replace(/\s+/g, '');
        const matchPhone = ordPhone.includes(targetPhone) || targetPhone.includes(ordPhone);
        if (matchPhone) {
          setGuestTrackedOrder(ord);
          setTrackedOrderId(ord.id);
        } else {
          setTrackingError('The phone number provided does not match this order ID.');
        }
      } else {
        setTrackingError('Order not found. Please double-check the Order ID (e.g., ORD-9824).');
      }
    } catch (err) {
      console.error("Error tracking order:", err);
      setTrackingError('Failed to retrieve order. Please verify connection and try again.');
    } finally {
      setTrackingLoading(false);
    }
  };

  // Status timeline helper
  const statuses: { id: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'; label: string; desc: string; icon: any }[] = [
    { id: 'pending', label: 'Authorized', desc: 'Sourcing materials and dispatch preparation.', icon: Clock },
    { id: 'processing', label: 'Processing & Loading', desc: 'Materials are being bundled and loaded onto heavy transit fleet.', icon: HelpCircle },
    { id: 'shipped', label: 'En Route', desc: 'Dispatched via heavy-duty logistics fleet.', icon: Truck },
    { id: 'delivered', label: 'Delivered', desc: 'Securely unloaded and inspected at Riyadh jobsite.', icon: CheckCircle2 }
  ];

  const getStatusIndex = (currentStatus: string) => {
    if (currentStatus === 'cancelled') return -1;
    return statuses.findIndex(s => s.id === currentStatus);
  };

  // Toggle order details expanded state
  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Filter orders tied to logged-in Google UID
  const userOrders = currentUser 
    ? orders.filter(ord => ord.userId === currentUser.uid)
    : [];

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order? This will halt dispatch and release the material allocations.')) {
      return;
    }
    
    try {
      setCancellingOrderId(orderId);
      await updateOrderStatus(orderId, 'cancelled');
      alert(`Order ${orderId} has been successfully cancelled.`);
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('Failed to cancel order. Please contact our support line.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  return (
    <div className="bg-[#0c0d10] text-brand-gray-light py-12 sm:py-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <span className="text-[#cfa861] tracking-[0.4em] text-[10px] sm:text-xs font-semibold uppercase">
            Riyadh Logistics Portal
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-white tracking-wide uppercase">
            Track & Manage Orders
          </h2>
          <p className="text-xs text-brand-gray-muted max-w-md mx-auto font-light leading-relaxed">
            Review status updates, track live fleet shipments, or cancel pending allocations in real-time.
          </p>
        </div>

        {/* 1. GOOGLE LOGGED-IN USERS ORDER HUB */}
        {currentUser ? (
          <div className="space-y-6 mb-12">
            <div className="bg-brand-charcoal/40 border border-[#1c1d24] rounded px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt={currentUser.displayName || ''} className="w-10 h-10 rounded-full border border-[#cfa861]/30" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-charcoal border border-[#cfa861]/30 flex items-center justify-center text-xs text-white">
                    {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                  </div>
                )}
                <div>
                  <h3 className="font-serif text-sm text-white font-medium">Logged in as {currentUser.displayName}</h3>
                  <p className="text-[10px] text-brand-gray-muted font-mono">{currentUser.email}</p>
                </div>
              </div>
              <div className="text-xs bg-[#cfa861]/10 text-[#cfa861] px-3 py-1 rounded border border-[#cfa861]/20 font-mono">
                {userOrders.length} Order{userOrders.length !== 1 ? 's' : ''} Linked
              </div>
            </div>

            {/* List of logged in user's orders */}
            {userOrders.length > 0 ? (
              <div className="space-y-6">
                <h3 className="text-xs uppercase tracking-widest text-[#cfa861] font-semibold text-left">Your Order History</h3>
                {userOrders.map((order) => {
                  const currentStatusIdx = getStatusIndex(order.status);
                  const isExpanded = !!expandedOrders[order.id];

                  return (
                    <div key={order.id} className="bg-brand-charcoal border border-[#1c1d24] rounded overflow-hidden text-left transition-all">
                      {/* Top Bar Summary */}
                      <div className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1c1d24]/85">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-white font-semibold">#{order.id}</span>
                            <span className="text-[10px] text-brand-gray-muted font-light">
                              Placed on {new Date(order.createdAt).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="text-xs text-brand-gray-muted font-light">
                            Items: <span className="text-white font-medium">{order.items.reduce((acc: number, cur: any) => acc + cur.quantity, 0)}</span> · Grand Total: <span className="text-[#cfa861] font-mono font-medium">{order.grandTotal.toLocaleString()} SAR</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                          <span className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-mono rounded border ${
                            order.status === 'delivered' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : order.status === 'cancelled'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-[#cfa861]/10 text-[#cfa861] border-[#cfa861]/20 animate-pulse'
                          }`}>
                            {order.status}
                          </span>
                          <button
                            onClick={() => toggleOrderExpand(order.id)}
                            className="text-brand-gray-muted hover:text-white p-1 rounded hover:bg-brand-charcoal transition-colors flex items-center gap-1 text-xs"
                          >
                            <span>Details</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Timeline steps */}
                      <div className="p-5 sm:p-6 bg-[#090a0d]/40">
                        {order.status === 'cancelled' ? (
                          <div className="p-4 bg-red-950/15 border border-red-500/10 rounded text-xs flex gap-3 text-red-400 font-light">
                            <Ban className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong className="block font-medium text-red-300">Order Retracted / Cancelled</strong>
                              <span>This transaction has been successfully canceled and voided. Any pending holds have been resolved.</span>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative pt-2">
                            {statuses.map((step, idx) => {
                              const StepIcon = step.icon;
                              const isCompleted = idx <= currentStatusIdx;
                              const isActive = idx === currentStatusIdx;

                              return (
                                <div key={idx} className="relative flex sm:flex-col gap-3 sm:gap-2 text-left">
                                  {/* Connector lines */}
                                  {idx < statuses.length - 1 && (
                                    <div className="hidden sm:block absolute left-[22px] top-3.5 w-full h-[1.5px] bg-[#1c1d24] z-0">
                                      <div className={`h-full bg-emerald-500/80 transition-all duration-700 ${isCompleted && idx !== currentStatusIdx ? 'w-full' : 'w-0'}`} />
                                    </div>
                                  )}
                                  {idx < statuses.length - 1 && (
                                    <div className="sm:hidden absolute left-3.5 top-7 w-[1.5px] h-full bg-[#1c1d24] z-0">
                                      <div className={`w-full bg-emerald-500/80 transition-all duration-700 ${isCompleted && idx !== currentStatusIdx ? 'h-full' : 'h-0'}`} />
                                    </div>
                                  )}

                                  {/* Icon step bubble */}
                                  <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                                    isCompleted 
                                      ? 'bg-emerald-500 text-[#0c0d10] border-emerald-500' 
                                      : 'bg-brand-black text-brand-gray-muted border-[#252731]'
                                  } ${isActive ? 'ring-4 ring-emerald-500/20 scale-105' : ''}`}>
                                    <StepIcon className="w-3.5 h-3.5" />
                                  </div>

                                  {/* Step label description */}
                                  <div className="space-y-0.5 text-left">
                                    <h4 className={`text-[10px] uppercase tracking-wider font-semibold ${isCompleted ? 'text-white' : 'text-brand-gray-muted'}`}>
                                      {step.label}
                                    </h4>
                                    <p className="text-[9px] text-brand-gray-muted font-light leading-relaxed hidden sm:block">
                                      {step.desc}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Expandable detailed panel */}
                      {isExpanded && (
                        <div className="p-5 sm:p-6 border-t border-[#1c1d24] bg-brand-charcoal/80 space-y-6 animate-fade-in">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            {/* Shipping location */}
                            <div className="md:col-span-7 space-y-3">
                              <h4 className="text-[10px] uppercase tracking-wider text-[#cfa861] font-mono font-medium">Logistics Details</h4>
                              <div className="space-y-2 text-xs font-light">
                                <div className="flex gap-2.5">
                                  <MapPin className="w-3.5 h-3.5 text-[#cfa861] flex-shrink-0 mt-0.5" />
                                  <div>
                                    <strong className="block text-white font-medium">Jobsite Destination</strong>
                                    <span className="text-brand-gray-muted leading-relaxed block mt-0.5">{order.customer.address}</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#1c1d24]/60 mt-3">
                                  <div>
                                    <strong className="block text-white font-medium">Consignee</strong>
                                    <span className="text-brand-gray-muted">{order.customer.name}</span>
                                  </div>
                                  <div>
                                    <strong className="block text-white font-medium">Site Contact</strong>
                                    <span className="text-brand-gray-muted">{order.customer.phone}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Itemized receipt */}
                            <div className="md:col-span-5 space-y-3">
                              <h4 className="text-[10px] uppercase tracking-wider text-[#cfa861] font-mono font-medium">Reserved Material Loads</h4>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {order.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center text-xs font-light">
                                    <div className="text-left">
                                      <span className="text-white block font-medium line-clamp-1">{item.name}</span>
                                      <span className="text-[10px] text-brand-gray-muted block">Qty {item.quantity} · {item.price.toLocaleString()} SAR</span>
                                    </div>
                                    <span className="text-[#cfa861] font-mono">{ (item.price * item.quantity).toLocaleString() } SAR</span>
                                  </div>
                                ))}
                              </div>
                              <div className="border-t border-[#1c1d24]/60 pt-3 space-y-1.5 text-xs font-light">
                                <div className="flex justify-between text-brand-gray-muted">
                                  <span>Load Subtotal</span>
                                  <span>{order.total.toLocaleString()} SAR</span>
                                </div>
                                <div className="flex justify-between text-brand-gray-muted">
                                  <span>Logistics Fleet Delivery</span>
                                  <span>{order.deliveryFee.toLocaleString()} SAR</span>
                                </div>
                                <div className="flex justify-between text-white font-medium pt-1.5 border-t border-[#1c1d24]/40">
                                  <span>Grand Total</span>
                                  <span className="text-[#cfa861] font-mono">{order.grandTotal.toLocaleString()} SAR</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Cancellation/Action line */}
                          <div className="pt-4 border-t border-[#1c1d24] flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-[10px] text-brand-gray-muted max-w-sm font-light">
                              {order.status === 'pending' || order.status === 'processing'
                                ? 'Need to adjust your construction plan? You can cancel your dispatch reservation below prior to freight loading.'
                                : 'This dispatch has already loaded onto our heavy freight rigs or completed jobsite delivery; cancellation is no longer online. Contact logistics dispatch for queries.'}
                            </p>
                            {(order.status === 'pending' || order.status === 'processing') && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={cancellingOrderId === order.id}
                                className="px-5 py-2.5 bg-red-950/30 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 text-xs font-sans font-medium uppercase rounded tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>{cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Material Order'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 px-6 text-center bg-brand-charcoal/20 border border-[#1c1d24] rounded">
                <AlertCircle className="w-10 h-10 text-[#cfa861]/60 mx-auto mb-3" />
                <h4 className="font-serif text-sm text-white font-medium uppercase">No Orders Registered</h4>
                <p className="text-xs text-brand-gray-muted max-w-sm mx-auto mt-1 leading-relaxed font-light">
                  You haven't placed any bulk material orders with this Google Account yet. Browse our professional timber and steel catalogs to get started!
                </p>
                <button
                  onClick={() => setCurrentTab('shop')}
                  className="mt-4 px-4 py-2 bg-[#cfa861] hover:bg-[#e6b96c] text-[#0c0d10] font-sans text-[10px] uppercase tracking-widest rounded font-semibold transition-colors cursor-pointer"
                >
                  Materials Catalog
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-brand-charcoal/40 border border-[#1c1d24] p-6 sm:p-8 rounded text-center mb-10 space-y-4">
            <LogIn className="w-8 h-8 text-[#cfa861] mx-auto" />
            <div className="space-y-1">
              <h3 className="font-serif text-base text-white font-medium uppercase tracking-wide">Sync Orders with Google</h3>
              <p className="text-xs text-brand-gray-muted max-w-md mx-auto leading-relaxed font-light">
                Sign in with Google to view and track all your orders under a consolidated dashboard, cancel pending reservations, and access automatic logistics invoices.
              </p>
            </div>
            <button
              onClick={loginWithGoogle}
              className="px-6 py-2.5 bg-[#cfa861] hover:bg-[#e6b96c] text-[#0c0d10] font-sans text-xs tracking-widest uppercase rounded font-semibold transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Connect with Google</span>
            </button>
          </div>
        )}

        {/* 2. MANUAL GUEST TRACKER SECTION */}
        <div className="bg-brand-charcoal border border-[#1c1d24] p-6 sm:p-8 rounded-sm text-left">
          <div className="mb-6">
            <h3 className="font-serif text-sm text-white uppercase tracking-wider font-medium">Track Individual Guest Order</h3>
            <p className="text-[10px] text-brand-gray-muted font-light mt-0.5">
              Enter any order ID code and matching phone number from your purchase receipt to track a guest invoice.
            </p>
          </div>

          <form onSubmit={handleTrack} className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-4 items-end">
            <div className="sm:col-span-5">
              <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-2 font-medium">Order ID Code</label>
              <input
                type="text"
                required
                placeholder="e.g., ORD-9824"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-3 text-sm text-white focus:outline-none transition-colors font-mono tracking-widest uppercase"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-2 font-medium">Phone Number</label>
              <input
                type="text"
                required
                placeholder="e.g., +966 50 123 4567"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-3 text-sm text-white focus:outline-none transition-colors"
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={trackingLoading}
                className="w-full bg-[#cfa861] hover:bg-[#e6b96c] disabled:bg-[#cfa861]/40 text-[#0c0d10] disabled:text-[#0c0d10]/60 font-sans text-xs tracking-widest uppercase py-3.5 rounded font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {trackingLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>{trackingLoading ? 'Searching...' : 'Locate'}</span>
              </button>
            </div>
          </form>

          {/* Quick Demo Assist */}
          <div className="mt-4 pt-3 border-t border-[#1c1d24]/60 text-[10px] text-brand-gray-muted/80 font-sans flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5">
            <span>Demo Test Coordinates: ID <strong className="font-mono text-[#cfa861]">ORD-9824</strong> or <strong className="font-mono text-[#cfa861]">ORD-7612</strong></span>
            <span>Phone <strong className="font-mono text-[#cfa861]">+966 50 123 4567</strong></span>
          </div>
        </div>

        {/* RESULTS FEEDBACK PANELS FOR MANUAL GUEST TRACKER */}
        {hasSearched && (
          <div className="mt-8">
            {trackingLoading ? (
              <div className="py-16 text-center bg-brand-charcoal border border-[#1c1d24] rounded animate-pulse">
                <Loader2 className="w-10 h-10 text-[#cfa861] animate-spin mx-auto mb-4" />
                <h4 className="font-serif text-sm text-white uppercase tracking-wider">Retrieving Logistics File</h4>
                <p className="text-[10px] text-brand-gray-muted mt-1">Contacting Riyadh database servers...</p>
              </div>
            ) : trackingError ? (
              <div className="py-12 px-6 text-center bg-brand-charcoal border border-red-500/20 rounded animate-fade-in">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <h4 className="font-serif text-base text-white font-medium uppercase">Logistics Search Alert</h4>
                <p className="text-xs text-red-300 max-w-sm mx-auto mt-2 leading-relaxed">
                  {trackingError}
                </p>
              </div>
            ) : foundOrder ? (
              <div className="space-y-8 animate-fade-in text-left">
                
                {/* Timeline Tracker */}
                <div className="bg-brand-charcoal border border-[#1c1d24] p-6 sm:p-8 rounded-sm">
                  <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#1c1d24]/60">
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#cfa861] font-mono tracking-wider uppercase font-semibold">Live Tracking Status</span>
                      <h3 className="font-serif text-lg text-white">Receipt #{foundOrder.id}</h3>
                    </div>
                    <span className={`px-3 py-1 text-[10px] uppercase tracking-widest font-mono font-medium rounded-sm border ${
                      foundOrder.status === 'delivered' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : foundOrder.status === 'cancelled'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-[#cfa861]/10 text-[#cfa861] border-[#cfa861]/20 animate-pulse'
                    }`}>
                      {foundOrder.status}
                    </span>
                  </div>

                  {foundOrder.status === 'cancelled' ? (
                    <div className="p-4 bg-red-950/20 border border-red-500/20 rounded text-xs flex gap-3 text-red-400 font-light">
                      <Ban className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-medium">Order Cancelled</strong>
                        <span>This material allocation has been retracted or cancelled. Please contact our support line for further details.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-4 gap-4 pt-2">
                      {statuses.map((step, idx) => {
                        const StepIcon = step.icon;
                        const isCompleted = idx <= getStatusIndex(foundOrder.status);
                        const isActive = idx === getStatusIndex(foundOrder.status);

                        return (
                          <div key={idx} className="relative flex sm:flex-col gap-4 sm:gap-2 text-left">
                            {idx < statuses.length - 1 && (
                              <div className="hidden sm:block absolute left-[28px] top-4 w-full h-[2px] bg-[#1c1d24] z-0">
                                <div className={`h-full bg-emerald-500 transition-all duration-1000 ${isCompleted && idx !== getStatusIndex(foundOrder.status) ? 'w-full' : 'w-0'}`} />
                              </div>
                            )}

                            {idx < statuses.length - 1 && (
                              <div className="sm:hidden absolute left-4 top-8 w-[2px] h-full bg-[#1c1d24] z-0">
                                <div className={`w-full bg-emerald-500 transition-all duration-1000 ${isCompleted && idx !== getStatusIndex(foundOrder.status) ? 'h-full' : 'h-0'}`} />
                              </div>
                            )}

                            <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                              isCompleted 
                                ? 'bg-emerald-500 text-[#0c0d10] border-emerald-500' 
                                : 'bg-brand-black text-brand-gray-muted border-[#252731]'
                            } ${isActive ? 'ring-4 ring-emerald-500/15 scale-110' : ''}`}>
                              <StepIcon className="w-4 h-4" />
                            </div>

                            <div className="space-y-1 sm:pt-2">
                              <h4 className={`text-xs font-serif tracking-wider uppercase font-semibold ${isCompleted ? 'text-white' : 'text-brand-gray-muted'}`}>
                                {step.label}
                              </h4>
                              <p className="text-[11px] text-brand-gray-muted leading-relaxed font-light">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Logistics Coordinates & Order Items */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Delivery Info */}
                  <div className="md:col-span-7 bg-brand-charcoal border border-[#1c1d24] p-6 sm:p-8 rounded-sm space-y-5">
                    <h4 className="font-serif text-sm tracking-widest uppercase text-white border-b border-[#1c1d24]/60 pb-3">
                      Logistics Coordinates
                    </h4>
                    
                    <div className="space-y-4 text-xs font-sans">
                      <div className="flex gap-3">
                        <MapPin className="w-4 h-4 text-[#cfa861] flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-white mb-0.5">Delivery Destination</strong>
                          <span className="text-brand-gray-muted leading-relaxed font-light">{foundOrder.customer.address}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#1c1d24]/40">
                        <div>
                          <strong className="block text-white mb-0.5">Commission Owner</strong>
                          <span className="text-brand-gray-muted font-light">{foundOrder.customer.name}</span>
                        </div>
                        <div>
                          <strong className="block text-white mb-0.5">Telephone</strong>
                          <span className="text-brand-gray-muted font-light">{foundOrder.customer.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="md:col-span-5 bg-brand-charcoal border border-[#1c1d24] p-6 sm:p-8 rounded-sm space-y-4">
                    <h4 className="font-serif text-sm tracking-widest uppercase text-white border-b border-[#1c1d24]/60 pb-3">
                      Reserved Material Loads
                    </h4>
                    
                    <div className="space-y-3.5">
                      {foundOrder.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <div className="text-brand-gray-light font-light text-left">
                            <span className="line-clamp-1 max-w-[150px] font-medium">{item.name}</span>
                            <span className="text-[10px] text-brand-gray-muted block">Qty {item.quantity} @ {item.price.toLocaleString()} SAR</span>
                          </div>
                          <span className="text-[#cfa861] font-mono font-medium">{(item.price * item.quantity).toLocaleString()} SAR</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-[#1c1d24]/60 pt-4 space-y-1.5 text-xs font-light">
                      <div className="flex justify-between items-center text-brand-gray-muted">
                        <span>Items Subtotal</span>
                        <span className="font-mono">{foundOrder.total.toLocaleString()} SAR</span>
                      </div>
                      <div className="flex justify-between items-center text-brand-gray-muted">
                        <span>Logistics Fleet Delivery</span>
                        <span className="font-mono">{foundOrder.deliveryFee} SAR</span>
                      </div>
                      <div className="flex justify-between items-center text-white font-semibold pt-2 border-t border-[#1c1d24]/40">
                        <span>Grand Total</span>
                        <span className="text-[#cfa861] font-mono">{foundOrder.grandTotal.toLocaleString()} SAR</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Cancel guest order if eligible */}
                {(foundOrder.status === 'pending' || foundOrder.status === 'processing') && (
                  <div className="p-5 bg-brand-charcoal border border-[#1c1d24] rounded flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-light">
                    <span>This guest allocation can still be canceled prior torig loading.</span>
                    <button
                      onClick={() => handleCancelOrder(foundOrder.id)}
                      disabled={cancellingOrderId === foundOrder.id}
                      className="px-4 py-2 bg-red-950/30 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 font-mono font-medium uppercase rounded cursor-pointer transition-colors disabled:opacity-50"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}

                {/* Contact support */}
                <div className="p-4 bg-brand-charcoal/40 border border-[#1c1d24] rounded-sm flex items-center justify-between text-xs font-sans gap-4">
                  <div className="flex gap-2 items-center text-brand-gray-muted">
                    <PhoneCall className="w-4 h-4 text-[#cfa861]" />
                    <span>Need changes to your jobsite logistics? Call us at +966 50 123 4567.</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-16 text-center bg-brand-charcoal border border-[#1c1d24] rounded animate-fade-in">
                <Ban className="w-12 h-12 text-brand-gray-muted/45 mx-auto mb-4" />
                <h4 className="font-serif text-lg text-white font-medium uppercase">No Registration Located</h4>
                <p className="text-xs text-brand-gray-muted max-w-sm mx-auto mt-2 leading-relaxed font-light">
                  No active order registration matched that combination of ID and Phone Contact. Double-check your confirmation receipts.
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
