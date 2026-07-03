import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Category } from '../types';
import { Sliders, Search, ArrowLeft, ZoomIn, ShoppingBag, Eye, HelpCircle, Edit, Trash2, PlusCircle, Check, X, RefreshCw, Upload, Image, AlertTriangle, Star, MessageSquare, ThumbsUp, PlayCircle, Share2, Link } from 'lucide-react';

export const CustomerShop: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    selectedProductId,
    setSelectedProductId,
    addToCart,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    clearAllProducts,
    addProductReview,
    settings
  } = useStore();

  // Editor mode state
  const [isEditorMode, setIsEditorMode] = useState(false);

  // Password Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  // Custom Confirmation Dialog State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  } | null>(null);

  // Product form fields
  const [prodFormName, setProdFormName] = useState('');
  const [prodFormCategory, setProdFormCategory] = useState('');
  const [prodFormPrice, setProdFormPrice] = useState('');
  const [prodFormDesc, setProdFormDesc] = useState('');
  const [prodFormStock, setProdFormStock] = useState('');
  const [prodFormDimensions, setProdFormDimensions] = useState('');
  const [prodFormMaterial, setProdFormMaterial] = useState('');
  const [prodFormImage, setProdFormImage] = useState('');

  // Category form fields
  const [catFormName, setCatFormName] = useState('');
  const [catFormDesc, setCatFormDesc] = useState('');
  const [catFormImage, setCatFormImage] = useState('');

  // Product Helpers
  const handleAddProductClick = (catId: string) => {
    setEditingProd(null);
    setProdFormName('');
    setProdFormCategory(catId || categories[0]?.id || '');
    setProdFormPrice('150');
    setProdFormDesc('');
    setProdFormStock('50');
    setProdFormDimensions('');
    setProdFormMaterial('');
    setProdFormImage('https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80');
    setShowProductModal(true);
  };

  const handleEditProductClick = (prod: Product) => {
    setEditingProd(prod);
    setProdFormName(prod.name);
    setProdFormCategory(prod.category);
    setProdFormPrice(String(prod.price));
    setProdFormDesc(prod.description);
    setProdFormStock(String(prod.stock));
    setProdFormDimensions(prod.dimensions);
    setProdFormMaterial(prod.material);
    setProdFormImage(prod.images[0] || '');
    setShowProductModal(true);
  };

  const handleProductFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalName = prodFormName.trim() || `Material Item #${products.length + 1}`;
    const finalCategory = prodFormCategory || (categories[0]?.id || 'general');
    const parsedPrice = Number(prodFormPrice) || 150;
    const parsedStock = Number(prodFormStock) || 10;

    const payload = {
      name: finalName,
      category: finalCategory,
      price: parsedPrice,
      currency: 'SAR',
      description: prodFormDesc.trim() || 'Premium grade certified material.',
      images: [prodFormImage.trim() || 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80'],
      stock: parsedStock,
      dimensions: prodFormDimensions.trim() || 'Standard Dimensions',
      material: prodFormMaterial.trim() || 'Industrial Grade',
      tags: [finalCategory],
      isActive: true
    };

    if (editingProd) {
      updateProduct(editingProd.id, payload);
    } else {
      addProduct(payload);
    }

    setShowProductModal(false);
    setEditingProd(null);
  };

  const handleDeleteProductClick = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Material Listing',
      message: 'Are you sure you want to delete this material listing?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        deleteProduct(id);
      }
    });
  };

  // Category Helpers
  const handleCreateCategoryClick = () => {
    setEditingCat(null);
    setCatFormName('');
    setCatFormDesc('');
    setCatFormImage('https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80');
    setShowCategoryModal(true);
  };

  const handleEditCategoryClick = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    setEditingCat(cat);
    setCatFormName(cat.name);
    setCatFormDesc(cat.description);
    setCatFormImage(cat.image);
    setShowCategoryModal(true);
  };

  const handleCategoryFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalName = catFormName.trim() || `Material Section ${categories.length + 1}`;
    const finalImage = catFormImage.trim() || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80';
    const finalDesc = catFormDesc.trim() || `Premium collection of ${finalName}`;

    if (editingCat) {
      updateCategory(editingCat.id, {
        name: finalName,
        description: finalDesc,
        image: finalImage
      });
    } else {
      addCategory({
        name: finalName,
        description: finalDesc,
        image: finalImage
      });
    }

    setShowCategoryModal(false);
    setEditingCat(null);
  };

  const handleDeleteCategoryClick = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    setConfirmModal({
      isOpen: true,
      title: 'Delete Section',
      message: `Are you sure you want to delete the section "${cat.name}"? Materials in this section will remain but their section reference will be orphaned.`,
      confirmText: 'Delete Section',
      cancelText: 'Cancel',
      onConfirm: () => {
        deleteCategory(catId);
        setSelectedCategory(null);
      }
    });
  };

  const handleClearAllProducts = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear Catalog',
      message: 'Are you sure you want to clear ALL material listings? This will leave your catalog completely clean and empty.',
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      onConfirm: () => {
        clearAllProducts();
      }
    });
  };

  const handleResetDefaults = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset to Defaults',
      message: 'Do you want to reset the catalog back to the default demo categories and products?',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      onConfirm: () => {
        localStorage.removeItem('masdar_products_v2');
        localStorage.removeItem('masdar_categories');
        window.location.reload();
      }
    });
  };

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number>(15000); // Max default
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'newest'>('popular');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Active product for detail page
  const activeProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId && p.isActive);
  }, [products, selectedProductId]);

  // Gallery main image
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  const [showVideo, setShowVideo] = useState<boolean>(false);

  // Review form states
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Extract unique materials
  const availableMaterials = useMemo(() => {
    const materials = new Set<string>();
    products.forEach(p => {
      if (p.material) {
        // extract first word or generic material
        const first = p.material.split(',')[0].trim();
        materials.add(first);
      }
    });
    return Array.from(materials);
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (!p.isActive) return false;
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = p.price <= priceRange;
      
      const pMaterial = p.material.toLowerCase();
      const matchesMaterial = selectedMaterial === 'all' || pMaterial.includes(selectedMaterial.toLowerCase());
      
      return matchesCategory && matchesSearch && matchesPrice && matchesMaterial;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return b.stock - a.stock; // popular mock
    });
  }, [products, selectedCategory, searchQuery, priceRange, selectedMaterial, sortBy]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSuccess('');
    setReviewError('');

    if (!activeProduct) return;
    if (!reviewName.trim()) {
      setReviewError('Please provide your name.');
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError('Please enter your review feedback.');
      return;
    }
    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError('Please select a rating between 1 and 5 stars.');
      return;
    }

    setSubmittingReview(true);
    try {
      await addProductReview(activeProduct.id, {
        userName: reviewName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      setReviewSuccess('Thank you! Your verified material evaluation has been submitted.');
      setReviewName('');
      setReviewComment('');
      setReviewRating(5);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleProductClick = (id: string) => {
    setSelectedProductId(id);
    const prod = products.find(p => p.id === id);
    if (prod) {
      setMainImageUrl(prod.images[0]);
    }
    
    // Update browser URL
    const newUrl = `${window.location.pathname}?product=${id}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    setShowVideo(false);
    setReviewSuccess('');
    setReviewError('');
    setReviewName('');
    setReviewComment('');
    setReviewRating(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCatalog = () => {
    setSelectedProductId(null);
    setShowVideo(false);
    
    // Remove query param from URL
    window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
  };

  const handleShareProduct = async (id: string, name: string) => {
    const url = `${window.location.origin}${window.location.pathname}?product=${id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: `Check out ${name} on Masdar Al-Riyadh`,
          url: url
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const renderStars = (rating: number, sizeClass: string = "w-3.5 h-3.5") => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(
          <Star key={i} className={`${sizeClass} text-[#cfa861] fill-[#cfa861]`} />
        );
      } else if (rating >= i - 0.5) {
        stars.push(
          <div key={i} className="relative inline-block leading-none">
            <Star className={`${sizeClass} text-[#252731]`} />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2 h-full">
              <Star className={`${sizeClass} text-[#cfa861] fill-[#cfa861] max-w-none`} />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className={`${sizeClass} text-[#252731]`} />
        );
      }
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  return (
    <div className="bg-[#0c0d10] text-brand-gray-light py-10 sm:py-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* VIEW 1: PRODUCT DETAILED PAGE */}
        {activeProduct ? (
          <div className="space-y-12 animate-fade-in text-left">
            {/* Back button */}
            <button
              onClick={handleBackToCatalog}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#cfa861] hover:text-[#e6b96c] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Materials Catalog</span>
            </button>

            {/* Product core structure */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
              
              {/* Product Gallery (left side, span 7) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="relative aspect-4/3 bg-[#0c0d10] overflow-hidden border border-[#1c1d24] group flex items-center justify-center">
                  {showVideo && activeProduct.videoUrl ? (
                    <video
                      src={activeProduct.videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain bg-[#07080a]"
                    />
                  ) : (
                    <>
                      <img
                        src={mainImageUrl || activeProduct.images[0]}
                        alt={activeProduct.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                      <div className="absolute top-4 right-4 p-2 bg-[#0c0d10]/60 rounded-full text-[#cfa861]/70 border border-white/5">
                        <ZoomIn className="w-4 h-4" />
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                <div className="flex flex-wrap gap-3">
                  {activeProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setMainImageUrl(img);
                        setShowVideo(false);
                      }}
                      className={`w-20 sm:w-24 aspect-4/3 overflow-hidden bg-brand-charcoal border transition-all cursor-pointer ${
                        !showVideo && (mainImageUrl || activeProduct.images[0]) === img 
                          ? 'border-[#cfa861]' 
                          : 'border-[#1c1d24] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}

                  {/* Video Thumbnail Option (Flipkart style) */}
                  {activeProduct.videoUrl && (
                    <button
                      onClick={() => setShowVideo(true)}
                      className={`w-20 sm:w-24 aspect-4/3 overflow-hidden bg-brand-charcoal border transition-all cursor-pointer relative flex flex-col items-center justify-center ${
                        showVideo 
                          ? 'border-[#cfa861]' 
                          : 'border-[#1c1d24] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={activeProduct.images[0]} alt="Video Thumbnail" className="w-full h-full object-cover blur-[2px] opacity-30 absolute inset-0" referrerPolicy="no-referrer" />
                      <div className="relative z-10 flex flex-col items-center gap-1">
                        <PlayCircle className="w-7 h-7 text-[#cfa861]" />
                        <span className="text-[8px] tracking-[0.15em] text-white font-mono font-bold bg-[#0c0d10]/80 px-1 rounded">VIDEO</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Product Specifications & Cart (right side, span 5) */}
              <div className="lg:col-span-5 space-y-6 sm:space-y-8 flex flex-col justify-center">
                <div className="space-y-2 relative">
                  <span className="font-sans text-[10px] tracking-[0.3em] text-[#cfa861] uppercase font-semibold">
                    {categories.find(c => c.id === activeProduct.category)?.name || activeProduct.category}
                  </span>
                  
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="font-serif text-3xl sm:text-4xl text-white tracking-tight leading-tight">
                      {activeProduct.name}
                    </h1>
                    <button
                      onClick={() => handleShareProduct(activeProduct.id, activeProduct.name)}
                      className="flex items-center gap-2 px-3 py-2 bg-[#0c0d10] border border-[#1c1d24] text-brand-gray-muted hover:text-[#cfa861] hover:border-[#cfa861]/30 rounded transition-all cursor-pointer whitespace-nowrap group shrink-0 mt-1"
                      title="Share Link"
                    >
                      <Share2 className="w-4 h-4 group-hover:-rotate-12 transition-transform" />
                      <span className="text-[10px] uppercase tracking-widest font-medium hidden sm:inline">Share</span>
                    </button>
                  </div>

                  <p className="font-sans text-xl text-[#cfa861] font-light tracking-wide pt-2">
                    {activeProduct.price.toLocaleString()} {activeProduct.currency}
                    <span className="text-xs text-brand-gray-muted block sm:inline sm:ml-2">VAT Inclusive</span>
                  </p>
                </div>

                <div className="text-sm text-brand-gray-muted leading-relaxed font-light font-sans">
                  {activeProduct.description}
                </div>

                {/* Technical Specs Accordion-style layout */}
                <div className="border-t border-[#1c1d24] pt-6 space-y-4 text-xs font-sans">
                  <div className="grid grid-cols-3 py-1.5 border-b border-[#1c1d24]/40">
                    <span className="text-brand-gray-muted uppercase tracking-wider font-medium">Dimensions</span>
                    <span className="col-span-2 text-white font-light">{activeProduct.dimensions || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-3 py-1.5 border-b border-[#1c1d24]/40">
                    <span className="text-brand-gray-muted uppercase tracking-wider font-medium">Materiality</span>
                    <span className="col-span-2 text-white font-light">{activeProduct.material || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-3 py-1.5">
                    <span className="text-brand-gray-muted uppercase tracking-wider font-medium">Stock Status</span>
                    <span className="col-span-2 font-medium">
                      {activeProduct.stock > 0 ? (
                        <span className="text-emerald-400">Available ({activeProduct.stock} units)</span>
                      ) : (
                        <span className="text-red-400">Restocking Soon</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Cart Action */}
                <div>
                  <button
                    onClick={() => addToCart(activeProduct, 1)}
                    disabled={activeProduct.stock <= 0}
                    className={`w-full py-4 text-xs uppercase tracking-[0.2em] font-medium transition-all ${
                      activeProduct.stock > 0
                        ? 'bg-[#cfa861] text-[#0c0d10] hover:bg-[#e6b96c]'
                        : 'bg-brand-charcoal text-brand-gray-muted border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    {activeProduct.stock > 0 ? 'Add to Order Request' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>

            {/* Reviews section */}
            <div className="border-t border-[#1c1d24] pt-16 space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-[#1c1d24]/60">
                <div>
                  <h3 className="font-serif text-2xl text-white tracking-wide">
                    Verified Quality Audits & Client Reviews
                  </h3>
                  <p className="text-xs text-brand-gray-muted mt-1 font-sans">
                    SASO-compliant procurement feedbacks and user ratings.
                  </p>
                </div>
                
                {/* Aggregate Rating */}
                {(() => {
                  const rList = activeProduct.reviews || [];
                  const count = rList.length;
                  const avg = count > 0 
                    ? (rList.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1) 
                    : "5.0";
                  return (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-2xl font-serif text-white block">{avg} / 5.0</span>
                        <span className="text-[10px] text-brand-gray-muted font-sans block">{count} client reviews</span>
                      </div>
                      {renderStars(Number(avg), "w-4.5 h-4.5")}
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Reviews List (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  {!(activeProduct.reviews) || activeProduct.reviews.length === 0 ? (
                    <div className="py-12 px-6 rounded bg-[#13141c]/30 border border-[#1c1d24] text-center space-y-3">
                      <MessageSquare className="w-8 h-8 text-[#cfa861]/40 mx-auto" />
                      <p className="text-xs text-brand-gray-muted font-sans">
                        No customer evaluations yet. Be the first to verify this material's quality!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {activeProduct.reviews.map((rev) => (
                        <div 
                          key={rev.id} 
                          className="p-5 rounded bg-[#13141c]/40 border border-[#1c1d24]/80 space-y-3 hover:border-white/5 transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              {/* Avatar circle */}
                              <div className="w-8 h-8 rounded-full bg-[#1c1d24] text-[#cfa861] border border-[#252731] flex items-center justify-center font-serif text-xs font-semibold">
                                {rev.userName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-white text-xs font-medium font-sans flex items-center gap-2">
                                  <span>{rev.userName}</span>
                                  <span className="text-[9px] text-[#cfa861]/80 font-mono bg-[#cfa861]/10 px-1.5 py-0.5 rounded border border-[#cfa861]/25 uppercase tracking-wider">
                                    Verified Contractor
                                  </span>
                                </h4>
                                <span className="text-[9px] text-brand-gray-muted font-mono font-light block">
                                  {new Date(rev.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                            
                            {renderStars(rev.rating, "w-3.5 h-3.5")}
                          </div>
                          
                          <p className="text-xs text-brand-gray-light leading-relaxed font-sans font-light">
                            {rev.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submission Form (5 cols) */}
                <div className="lg:col-span-5">
                  <form onSubmit={handleReviewSubmit} className="p-6 rounded bg-[#13141c]/50 border border-[#1c1d24] space-y-5">
                    <h4 className="font-serif text-lg text-white tracking-wide border-b border-[#1c1d24]/60 pb-3">
                      Submit Material Quality Review
                    </h4>
                    
                    {reviewSuccess && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded font-sans flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>{reviewSuccess}</span>
                      </div>
                    )}

                    {reviewError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded font-sans flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{reviewError}</span>
                      </div>
                    )}

                    {/* Star selection */}
                    <div className="space-y-3">
                      <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted">Material Quality Rating: <span className="text-[#cfa861] font-mono font-bold text-xs">{reviewRating.toFixed(1)} ★</span></label>
                      <div className="flex flex-col gap-3">
                        {/* Interactive Star Row with half-star click support */}
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1 bg-[#0c0d10]/40 p-2 rounded border border-[#1c1d24]/60">
                            {[1, 2, 3, 4, 5].map((starIndex) => {
                              const isFull = reviewRating >= starIndex;
                              const isHalf = !isFull && reviewRating >= (starIndex - 0.5);
                              return (
                                <div key={starIndex} className="relative w-7 h-7 select-none transition-all hover:scale-105">
                                  {/* Visual Star */}
                                  <Star 
                                    className={`w-7 h-7 transition-colors ${
                                      isFull 
                                        ? 'text-[#cfa861] fill-[#cfa861]' 
                                        : 'text-[#252731]'
                                    }`} 
                                  />
                                  {isHalf && (
                                    <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
                                      <Star className="w-7 h-7 text-[#cfa861] fill-[#cfa861] max-w-none" />
                                    </div>
                                  )}
                                  
                                  {/* Left absolute area (half-star) */}
                                  <div 
                                    className="absolute top-0 left-0 w-1/2 h-full cursor-pointer z-20"
                                    onClick={() => setReviewRating(starIndex - 0.5)}
                                    title={`Set to ${starIndex - 0.5} Stars`}
                                  />
                                  {/* Right absolute area (full-star) */}
                                  <div 
                                    className="absolute top-0 right-0 w-1/2 h-full cursor-pointer z-20"
                                    onClick={() => setReviewRating(starIndex)}
                                    title={`Set to ${starIndex} Stars`}
                                  />
                                </div>
                              );
                            })}
                          </div>
                          
                          <span className="text-[10px] text-brand-gray-muted font-mono leading-none ml-2">
                            {reviewRating === 5 && 'Outstanding (SASO)'}
                            {reviewRating >= 4 && reviewRating < 5 && 'Highly Commended'}
                            {reviewRating >= 3 && reviewRating < 4 && 'Standard Grade'}
                            {reviewRating >= 2 && reviewRating < 3 && 'Minor Enhancements Needed'}
                            {reviewRating >= 1 && reviewRating < 2 && 'Substandard Execution'}
                            {reviewRating < 1 && 'Critical Re-evaluation'}
                          </span>
                        </div>

                        {/* Manual Quick selection buttons (Flipkart style for exact decimals) */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-brand-gray-muted block uppercase tracking-wider font-sans font-light">Manual rating entry</span>
                          <div className="flex flex-wrap gap-1">
                            {[1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map((val) => (
                              <button
                                type="button"
                                key={val}
                                onClick={() => setReviewRating(val)}
                                className={`px-2.5 py-1 text-[10px] font-mono rounded border transition-all cursor-pointer ${
                                  reviewRating === val
                                    ? 'bg-[#cfa861] text-[#0c0d10] border-[#cfa861] font-semibold'
                                    : 'bg-[#0c0d10] text-brand-gray-muted border-[#252731] hover:text-white hover:border-[#cfa861]/50'
                                }`}
                              >
                                {val.toFixed(1)} ★
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Name input */}
                    <div className="space-y-1.5">
                      <label htmlFor="revName" className="block text-[10px] uppercase tracking-widest text-brand-gray-muted">Purchaser / Contractor Name</label>
                      <input
                        id="revName"
                        type="text"
                        placeholder="e.g. Al-Fahad Contracting"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        disabled={submittingReview}
                        className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    {/* Comment input */}
                    <div className="space-y-1.5">
                      <label htmlFor="revComment" className="block text-[10px] uppercase tracking-widest text-brand-gray-muted">Quality Feedback & Comments</label>
                      <textarea
                        id="revComment"
                        rows={4}
                        placeholder="Write structural characteristics, strength verification, delivery experience..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        disabled={submittingReview}
                        className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-2.5 text-xs text-white focus:outline-none transition-colors resize-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full bg-[#cfa861] hover:bg-[#e6b96c] disabled:bg-[#1c1d24] disabled:text-brand-gray-muted text-[#0c0d10] py-3 text-xs uppercase tracking-[0.2em] font-semibold transition-colors rounded cursor-pointer flex items-center justify-center gap-2"
                    >
                      {submittingReview ? 'Verifying Audit...' : 'Authorize Review Entry'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Related products */}
            <div className="border-t border-[#1c1d24] pt-16 space-y-8">
              <h3 className="font-serif text-2xl text-white tracking-wide">
                Related Structural Materials
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {products
                  .filter(p => p.category === activeProduct.category && p.id !== activeProduct.id && p.isActive)
                  .slice(0, 4)
                  .map(prod => (
                    <div 
                      key={prod.id}
                      onClick={() => handleProductClick(prod.id)}
                      className="group cursor-pointer space-y-3"
                    >
                      <div className="aspect-4/3 overflow-hidden bg-brand-charcoal border border-[#1c1d24]">
                        <img 
                          src={prod.images[0]} 
                          alt={prod.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                      </div>
                      <div className="space-y-0.5 text-xs text-left">
                        <h4 className="text-white hover:text-[#cfa861] transition-colors line-clamp-1">{prod.name}</h4>
                        <p className="text-[#cfa861] font-mono">{prod.price.toLocaleString()} SAR</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          
          /* VIEW 2: PRODUCT CATALOG GRID WITH FILTERS */
          <div className="space-y-10 animate-fade-in">
            {/* Page Header */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-[#cfa861] tracking-[0.4em] text-[10px] sm:text-xs font-semibold uppercase">
                SASO Certified Inventory
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-white tracking-wide uppercase">
                Materials Catalog
              </h2>
              <p className="text-xs text-brand-gray-muted font-light leading-relaxed">
                Refine our inventory of certified timber, reinforcing steel, industrial plumbing, and heavy-duty safety protective equipment.
              </p>

              {/* Editor Switch Control */}
              <div className="flex justify-center items-center gap-4 pt-3">
                <div className="inline-flex items-center gap-3 bg-brand-charcoal/65 border border-[#1c1d24] px-4 py-2 rounded-full shadow-sm">
                  <span className="text-[10px] tracking-widest uppercase text-brand-gray-muted font-mono">
                    {isEditorMode ? "🛠️ Storefront Editor Active" : "👀 Viewing Storefront"}
                  </span>
                  <button
                    onClick={() => {
                      if (isEditorMode) {
                        setIsEditorMode(false);
                      } else {
                        setPasswordInput('');
                        setPasswordError('');
                        setShowPasswordModal(true);
                      }
                    }}
                    className={`text-[10px] font-sans font-semibold tracking-widest uppercase px-3 py-1 rounded-full transition-all cursor-pointer ${
                      isEditorMode 
                        ? 'bg-[#cfa861] text-[#0c0d10] hover:bg-[#e6b96c]' 
                        : 'bg-brand-black text-brand-gray-muted hover:text-white border border-white/5'
                    }`}
                  >
                    {isEditorMode ? "Disable" : "Enable Edit Mode"}
                  </button>

                  {isEditorMode && (
                    <button
                      onClick={handleResetDefaults}
                      className="text-[9px] tracking-widest text-[#cfa861] hover:text-white flex items-center gap-1 uppercase transition-colors ml-2 font-mono"
                      title="Reload demo catalog"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Categories Toggles list */}
            <div className="flex flex-wrap justify-center gap-3 border-b border-[#1c1d24] pb-6">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-xs tracking-wider transition-colors cursor-pointer ${
                  selectedCategory === null 
                    ? 'bg-[#cfa861] text-[#0c0d10] font-medium' 
                    : 'bg-brand-charcoal hover:bg-[#1c1d24] text-brand-gray-muted hover:text-white'
                }`}
              >
                All Materials
              </button>
              {categories.map(cat => (
                <div 
                  key={cat.id} 
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all border ${
                    selectedCategory === cat.id 
                      ? 'bg-[#cfa861] text-[#0c0d10] border-[#cfa861]' 
                      : 'bg-brand-charcoal border-white/5 hover:border-[#cfa861]/30 text-brand-gray-muted hover:text-white'
                  }`}
                >
                  <button
                    onClick={() => setSelectedCategory(cat.id)}
                    className="text-xs tracking-wider cursor-pointer font-medium focus:outline-none"
                  >
                    {cat.name}
                  </button>
                  {isEditorMode && (
                    <div className="flex items-center gap-1.5 ml-2 border-l border-current/25 pl-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCategoryClick(cat.id);
                        }}
                        className="hover:scale-110 transition-transform cursor-pointer p-0.5"
                        title="Edit Section Specs"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategoryClick(cat.id);
                        }}
                        className="hover:scale-110 transition-transform hover:text-red-500 cursor-pointer p-0.5"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {isEditorMode && (
                <button
                  onClick={handleCreateCategoryClick}
                  className="px-4 py-2 rounded-full text-xs tracking-wider border border-dashed border-[#cfa861]/40 text-[#cfa861] hover:bg-[#cfa861]/10 transition-all flex items-center gap-1 cursor-pointer font-mono"
                  title="Create New Section"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New Section</span>
                </button>
              )}
            </div>

            {/* Filter control bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center text-left bg-brand-charcoal border border-[#1c1d24] p-6 rounded-sm">
              
              {/* Search input (4 span) */}
              <div className="md:col-span-4 relative">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-gray-muted" />
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-3 pl-10 text-xs text-white focus:outline-none transition-colors"
                />
              </div>

              {/* Material Dropdown (3 span) */}
              <div className="md:col-span-3">
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-3 text-xs text-white focus:outline-none transition-colors"
                >
                  <option value="all">All Materials</option>
                  {availableMaterials.map((mat, idx) => (
                    <option key={idx} value={mat.toLowerCase()}>{mat}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Slider (3 span) */}
              <div className="md:col-span-3 space-y-1.5">
                <div className="flex justify-between text-[10px] uppercase tracking-wider text-brand-gray-muted">
                  <span>Max Budget</span>
                  <span className="text-[#cfa861] font-mono">{priceRange.toLocaleString()} SAR</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="15000"
                  step="500"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-[#cfa861] h-1 bg-[#0c0d10] rounded-sm appearance-none cursor-pointer"
                />
              </div>

              {/* Sorting (2 span) */}
              <div className="md:col-span-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-3 text-xs text-white focus:outline-none transition-colors"
                >
                  <option value="popular">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest Additions</option>
                </select>
              </div>
            </div>

            {/* Results Header */}
            <div className="space-y-3 border-b border-[#1c1d24]/40 pb-4 text-left">
              <div className="flex justify-between items-center text-xs text-brand-gray-muted">
                <span>Showing {filteredProducts.length} materials</span>
                {selectedCategory && (
                  <span className="italic text-[#cfa861]/70">
                    {categories.find(c => c.id === selectedCategory)?.description}
                  </span>
                )}
              </div>

              {isEditorMode && (
                <div className="flex flex-wrap gap-2 pt-2 items-center text-xs">
                  {selectedCategory ? (
                    <>
                      <span className="text-brand-gray-muted mr-1 font-mono text-[10px] uppercase">Section Actions:</span>
                      <button
                        onClick={() => handleEditCategoryClick(selectedCategory)}
                        className="px-2.5 py-1.5 bg-brand-charcoal hover:bg-[#1c1d24] text-white hover:text-[#cfa861] border border-white/5 rounded transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit Section Specs
                      </button>
                      <button
                        onClick={() => handleDeleteCategoryClick(selectedCategory)}
                        className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/10 rounded transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete This Section
                      </button>
                      <button
                        onClick={() => handleAddProductClick(selectedCategory)}
                        className="px-3 py-1.5 bg-[#cfa861] hover:bg-[#e6b96c] text-[#0c0d10] font-semibold rounded transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Add Material to Section
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-brand-gray-muted mr-1 font-mono text-[10px] uppercase">Catalog Actions:</span>
                      <button
                        onClick={handleCreateCategoryClick}
                        className="px-2.5 py-1.5 bg-brand-charcoal hover:bg-[#1c1d24] text-white hover:text-[#cfa861] border border-white/5 rounded transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Create New Section
                      </button>
                      <button
                        onClick={() => handleAddProductClick(categories[0]?.id || '')}
                        className="px-2.5 py-1.5 bg-brand-charcoal hover:bg-[#1c1d24] text-white hover:text-[#cfa861] border border-white/5 rounded transition-all flex items-center gap-1 cursor-pointer"
                        disabled={categories.length === 0}
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Add Material
                      </button>
                      <button
                        onClick={handleClearAllProducts}
                        className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-500/20 rounded transition-all flex items-center gap-1 cursor-pointer ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Clear All Products
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map(prod => (
                  <div
                    key={prod.id}
                    className="group bg-brand-charcoal/30 border border-[#1c1d24]/80 overflow-hidden rounded-sm hover:border-[#cfa861]/30 transition-all duration-300 flex flex-col h-full text-left"
                  >
                    {/* Image Area with hover quick views */}
                    <div 
                      onClick={() => handleProductClick(prod.id)}
                      className="relative aspect-4/3 overflow-hidden bg-brand-charcoal cursor-pointer"
                    >
                      {/* Editor Controls Overlay */}
                      {isEditorMode && (
                        <div className="absolute top-3 right-3 flex gap-1.5 z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProductClick(prod);
                            }}
                            className="p-1.5 bg-[#0c0d10]/95 hover:bg-[#cfa861] text-[#cfa861] hover:text-[#0c0d10] border border-[#cfa861]/25 rounded transition-all cursor-pointer shadow-lg"
                            title="Edit Material"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProductClick(prod.id);
                            }}
                            className="p-1.5 bg-red-950/90 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded transition-all cursor-pointer shadow-lg"
                            title="Delete Material"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      {/* Badge if low stock */}
                      {prod.stock > 0 && prod.stock <= 10 && (
                        <span className="absolute top-3 left-3 bg-[#cfa861] text-[#0c0d10] font-sans text-[9px] font-semibold uppercase tracking-widest px-2.5 py-1 z-10">
                          Low Stock ({prod.stock} left)
                        </span>
                      )}
                      {prod.stock === 0 && (
                        <span className="absolute top-3 left-3 bg-red-950/80 border border-red-500/30 text-red-400 font-sans text-[9px] font-semibold uppercase tracking-widest px-2.5 py-1 z-10">
                          Restocking
                        </span>
                      )}

                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-105"
                      />

                      {/* Hover controls panel */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareProduct(prod.id, prod.name);
                          }}
                          className="p-3 rounded-full bg-[#0c0d10] text-white hover:text-[#cfa861] border border-white/10 transition-colors cursor-pointer"
                          title="Share Product"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickViewProduct(prod);
                          }}
                          className="p-3 rounded-full bg-[#0c0d10] text-white hover:text-[#cfa861] border border-white/10 transition-colors cursor-pointer"
                          title="Quick View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (prod.stock > 0) addToCart(prod, 1);
                          }}
                          disabled={prod.stock <= 0}
                          className="p-3 rounded-full bg-[#cfa861] text-[#0c0d10] hover:bg-[#e6b96c] transition-colors disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                          title="Add to Cart"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Meta info area */}
                    <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
                      <div className="space-y-1.5" onClick={() => handleProductClick(prod.id)}>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] tracking-[0.2em] text-[#cfa861] uppercase font-mono">
                            {categories.find(c => c.id === prod.category)?.name.split('/')[0] || prod.category}
                          </span>
                          <span className="text-[10px] font-mono text-brand-gray-muted">{prod.dimensions.split('x')[0]}</span>
                        </div>
                        <h3 className="font-serif text-base text-white font-medium group-hover:text-[#cfa861] transition-colors line-clamp-1 cursor-pointer">
                          {prod.name}
                        </h3>
                        <p className="text-xs text-brand-gray-muted line-clamp-2 font-light leading-relaxed">
                          {prod.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#1c1d24]/60">
                        <span className="text-[#cfa861] font-sans text-sm font-light tracking-wide">
                          {prod.price.toLocaleString()} SAR
                        </span>
                        <div className="flex gap-3">
                          {isEditorMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProductClick(prod);
                              }}
                              className="text-[10px] tracking-widest uppercase text-[#cfa861] hover:text-[#e6b96c] transition-colors flex items-center gap-1 cursor-pointer font-medium"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleProductClick(prod.id)}
                            className="text-[10px] tracking-widest uppercase text-brand-gray-muted hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>View Specifications</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-brand-charcoal/40 border border-[#1c1d24] rounded">
                <HelpCircle className="w-12 h-12 text-brand-gray-muted/50 mx-auto mb-4" />
                <h4 className="font-serif text-lg text-white">No Pieces Matching Specifications</h4>
                <p className="text-xs text-brand-gray-muted max-w-sm mx-auto mt-2 leading-relaxed">
                  Adjust your search or filter configuration. We offer bespoke customized commissions upon direct contact.
                </p>
              </div>
            )}
          </div>
        )}

        {/* QUICK VIEW MODAL */}
        {quickViewProduct && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
            <div 
              className="relative w-full max-w-3xl bg-brand-charcoal border border-[#1c1d24] rounded-sm p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-left animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 text-brand-gray-muted hover:text-white cursor-pointer"
              >
                <span className="text-xs tracking-widest uppercase">Close</span>
              </button>

              <div className="aspect-4/3 bg-brand-black overflow-hidden rounded border border-[#1c1d24]">
                <img 
                  src={quickViewProduct.images[0]} 
                  alt={quickViewProduct.name} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[#cfa861] text-[9px] uppercase tracking-[0.2em] font-medium block">
                    {categories.find(c => c.id === quickViewProduct.category)?.name}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-white tracking-tight font-medium">
                    {quickViewProduct.name}
                  </h3>
                  <p className="text-[#cfa861] text-base font-light font-mono">
                    {quickViewProduct.price.toLocaleString()} SAR
                  </p>
                  <p className="text-xs text-brand-gray-muted leading-relaxed font-light font-sans line-clamp-4">
                    {quickViewProduct.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="text-[11px] text-brand-gray-muted space-y-1 font-sans">
                    <p><strong>Dimensions:</strong> {quickViewProduct.dimensions}</p>
                    <p><strong>Material:</strong> {quickViewProduct.material}</p>
                    <p><strong>Availability:</strong> {quickViewProduct.stock > 0 ? `${quickViewProduct.stock} units ready` : 'Awaiting crafting'}</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        addToCart(quickViewProduct, 1);
                        setQuickViewProduct(null);
                      }}
                      disabled={quickViewProduct.stock <= 0}
                      className="flex-grow py-3 bg-[#cfa861] text-[#0c0d10] hover:bg-[#e6b96c] transition-colors text-xs tracking-wider uppercase font-medium disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {quickViewProduct.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <button
                      onClick={() => {
                        handleShareProduct(quickViewProduct.id, quickViewProduct.name);
                      }}
                      className="px-4 py-3 border border-brand-gray-muted/20 text-white hover:border-[#cfa861] transition-colors text-xs uppercase tracking-wider cursor-pointer"
                      title="Share Product"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        handleProductClick(quickViewProduct.id);
                        setQuickViewProduct(null);
                      }}
                      className="px-4 py-3 border border-brand-gray-muted/20 text-white hover:border-[#cfa861] transition-colors text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCT CREATION/EDITING MODAL */}
        {showProductModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
            <div 
              className="relative w-full max-w-xl bg-brand-charcoal border border-[#1c1d24] rounded-sm p-6 sm:p-8 space-y-6 text-left my-8 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProd(null);
                }}
                className="absolute top-4 right-4 text-brand-gray-muted hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-[#cfa861] text-[9px] uppercase tracking-[0.2em] font-mono block">
                  {editingProd ? "Adjust Specifications" : "Inventory Onboarding"}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl text-white tracking-tight uppercase font-medium">
                  {editingProd ? "Edit Material Item" : "Add New Material"}
                </h3>
              </div>

              <form onSubmit={handleProductFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-1.5 font-mono">Material Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Structural Ash Timber"
                      value={prodFormName}
                      onChange={(e) => setProdFormName(e.target.value)}
                      className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-1.5 font-mono">Category Section</label>
                    <select
                      value={prodFormCategory}
                      onChange={(e) => setProdFormCategory(e.target.value)}
                      className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-1.5 font-mono">Price (SAR)</label>
                    <input
                      type="number"
                      placeholder="e.g., 250"
                      value={prodFormPrice}
                      onChange={(e) => setProdFormPrice(e.target.value)}
                      className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-1.5 font-mono">Stock Quantity</label>
                    <input
                      type="number"
                      placeholder="e.g., 100"
                      value={prodFormStock}
                      onChange={(e) => setProdFormStock(e.target.value)}
                      className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-1.5 font-mono">Dimensions Specs</label>
                    <input
                      type="text"
                      placeholder="e.g., 4m Length x 32mm Diameter"
                      value={prodFormDimensions}
                      onChange={(e) => setProdFormDimensions(e.target.value)}
                      className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-1.5 font-mono">Material Structure</label>
                    <input
                      type="text"
                      placeholder="e.g., Certified Grade 60 Steel"
                      value={prodFormMaterial}
                      onChange={(e) => setProdFormMaterial(e.target.value)}
                      className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-1.5 font-mono">Image URL</label>
                  <input
                    type="text"
                    placeholder="Paste public image link..."
                    value={prodFormImage}
                    onChange={(e) => setProdFormImage(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                  />
                  <span className="text-[9px] text-brand-gray-muted block mt-1 font-sans">
                    Leave default or paste any public image link to represent this material.
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-1.5 font-mono">Material Description</label>
                  <textarea
                    rows={3}
                    placeholder="Detail compliance certificates, load bearing capacities, or grades..."
                    value={prodFormDesc}
                    onChange={(e) => setProdFormDesc(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-3 py-2 text-xs text-white focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-[#1c1d24]/60">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductModal(false);
                      setEditingProd(null);
                    }}
                    className="flex-grow py-2.5 border border-[#252731] hover:border-brand-gray-muted text-white transition-colors text-xs uppercase tracking-wider font-mono cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-grow py-2.5 bg-[#cfa861] hover:bg-[#e6b96c] text-[#0c0d10] transition-colors text-xs uppercase tracking-wider font-semibold cursor-pointer"
                  >
                    {editingProd ? "Save Material Specs" : "Add Material"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CATEGORY (SECTION) CREATION/EDITING MODAL */}
        {showCategoryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
            <div 
              className="relative w-full max-w-md bg-brand-charcoal border border-[#1c1d24] rounded-sm p-6 sm:p-8 space-y-6 text-left animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCat(null);
                }}
                className="absolute top-4 right-4 text-brand-gray-muted hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-[#cfa861] text-[9px] uppercase tracking-[0.2em] font-mono block">
                  {editingCat ? "Adjust Infrastructure" : "Inventory Architecture"}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl text-white tracking-tight uppercase font-medium">
                  {editingCat ? "Edit Category Section" : "Create New Section"}
                </h3>
              </div>

              <form onSubmit={handleCategoryFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-1.5 font-mono">Section Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Heavy Machinery & Crane Tools"
                    value={catFormName}
                    onChange={(e) => setCatFormName(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-1.5 font-mono">Image URL</label>
                  <input
                    type="text"
                    placeholder="Paste public image URL..."
                    value={catFormImage}
                    onChange={(e) => setCatFormImage(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-1.5 font-mono">Section Description</label>
                  <textarea
                    rows={3}
                    placeholder="Explain the technical standards or purpose of this material category..."
                    value={catFormDesc}
                    onChange={(e) => setCatFormDesc(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-3 py-2 text-xs text-white focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-[#1c1d24]/60">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryModal(false);
                      setEditingCat(null);
                    }}
                    className="flex-grow py-2.5 border border-[#252731] hover:border-brand-gray-muted text-white transition-colors text-xs uppercase tracking-wider font-mono cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-grow py-2.5 bg-[#cfa861] hover:bg-[#e6b96c] text-[#0c0d10] transition-colors text-xs uppercase tracking-wider font-semibold cursor-pointer"
                  >
                    {editingCat ? "Save Section Specs" : "Add Section"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Custom Confirmation Modal */}
        {confirmModal && confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#14151a] border border-[#252731] w-full max-w-md p-6 rounded shadow-2xl space-y-5 text-left">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-red-950/40 rounded border border-red-500/20 text-red-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-sm tracking-widest text-white uppercase">{confirmModal.title}</h4>
                  <p className="text-xs text-brand-gray-muted leading-relaxed font-light">{confirmModal.message}</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 font-mono text-[10px] uppercase tracking-wider pt-4 border-t border-[#1c1d24]">
                <button 
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 bg-[#0c0d10] hover:bg-[#1c1d24] text-brand-gray-muted hover:text-white rounded border border-white/5 transition-colors cursor-pointer"
                >
                  {confirmModal.cancelText || 'Cancel'}
                </button>
                <button 
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(null);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded border border-red-650/10 transition-colors cursor-pointer font-medium"
                >
                  {confirmModal.confirmText || 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Password Verification Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#14151a] border border-[#252731] w-full max-w-sm p-6 rounded shadow-2xl space-y-4 text-left">
              <div className="space-y-1">
                <h4 className="font-serif text-sm tracking-widest text-white uppercase">Admin Authentication</h4>
                <p className="text-xs text-brand-gray-muted font-light">Enter password to enable storefront editor.</p>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const targetPassword = settings?.adminPasswordHash || 'riyadh2026';
                  if (passwordInput === targetPassword) {
                    setIsEditorMode(true);
                    setShowPasswordModal(false);
                    setPasswordInput('');
                    setPasswordError('');
                  } else {
                    setPasswordError('Incorrect administrator password.');
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <input
                    type="password"
                    placeholder="Enter Admin Password"
                    autoFocus
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
                  />
                  {passwordError && (
                    <p className="text-red-400 text-[10px] mt-1 font-mono">{passwordError}</p>
                  )}
                </div>

                <div className="flex justify-end gap-3 font-mono text-[10px] uppercase tracking-wider pt-3 border-t border-[#1c1d24]">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordInput('');
                      setPasswordError('');
                    }}
                    className="px-4 py-2 bg-[#0c0d10] hover:bg-[#1c1d24] text-brand-gray-muted hover:text-white rounded border border-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-[#cfa861] hover:bg-[#e6b96c] text-[#0c0d10] font-semibold rounded transition-colors cursor-pointer"
                  >
                    Authenticate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
