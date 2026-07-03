import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Order, Category, HeroSlide } from '../types';
import { 
  TrendingUp, Lock, ShieldCheck, ClipboardList, Box, Users, Sliders, LogOut, PlusCircle, 
  Edit, Trash2, Check, X, AlertTriangle, Search, Filter, ArrowUpRight, Printer, RefreshCw, Upload, Eye, EyeOff,
  Video, PlayCircle, Loader2
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    products,
    categories,
    orders,
    settings,
    isAdminLoggedIn,
    setAdminLoggedIn,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    updateOrderStatus,
    deleteOrder,
    updateSettings,
    setCurrentTab,
    currentUser,
    loginWithGoogle
  } = useStore();

  // Authentication screen states (if not logged in)
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  // Active Admin Tab: 'overview' | 'products' | 'orders' | 'categories' | 'customers' | 'settings'
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'products' | 'orders' | 'categories' | 'customers' | 'settings'>('overview');

  // Custom Confirmation Dialog State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  } | null>(null);

  // Search & Filter in admin sub-tabs
  const [prodSearch, setProdSearch] = useState('');
  const [prodCategoryFilter, setProdCategoryFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // CRUD Editing Modals / Forms States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  
  // Product Form states
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodDimensions, setProdDimensions] = useState('');
  const [prodMaterial, setProdMaterial] = useState('');
  const [prodTags, setProdTags] = useState('');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodVideoUrl, setProdVideoUrl] = useState('');
  const [videoUploading, setVideoUploading] = useState(false);
  const [isCompressingImages, setIsCompressingImages] = useState(false);
  const [prodIsActive, setProdIsActive] = useState(true);
  const [formMsg, setFormMsg] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline Category creation
  const [showInlineAddCategory, setShowInlineAddCategory] = useState(false);
  const [inlineCatName, setInlineCatName] = useState('');
  const [inlineCatDesc, setInlineCatDesc] = useState('');
  const [inlineCatImage, setInlineCatImage] = useState('');

  // Category Form states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');

  // Active Order Detail View
  const [selectedAdminOrder, setSelectedAdminOrder] = useState<Order | null>(null);
  const [showInvoicePrint, setShowInvoicePrint] = useState<Order | null>(null);

  // Admin settings values
  const [tempPassword, setTempPassword] = useState('');
  const [tempPhone, setTempPhone] = useState(settings.contactPhone);
  const [tempEmail, setTempEmail] = useState(settings.contactEmail);
  const [tempAddress, setTempAddress] = useState(settings.address);
  const [tempDelivery, setTempDelivery] = useState(String(settings.deliveryCharge));
  const [tempTax, setTempTax] = useState(String(settings.taxRate * 100));
  const [settingsMsg, setSettingsMsg] = useState('');

  // Slider editing states
  const [slide1Image, setSlide1Image] = useState(settings.heroSlides[0]?.image || '');
  const [slide1Category, setSlide1Category] = useState(settings.heroSlides[0]?.category || '');
  const [slide1Desc, setSlide1Desc] = useState(settings.heroSlides[0]?.description || '');

  const [slide2Image, setSlide2Image] = useState(settings.heroSlides[1]?.image || '');
  const [slide2Category, setSlide2Category] = useState(settings.heroSlides[1]?.category || '');
  const [slide2Desc, setSlide2Desc] = useState(settings.heroSlides[1]?.description || '');

  const [slide3Image, setSlide3Image] = useState(settings.heroSlides[2]?.image || '');
  const [slide3Category, setSlide3Category] = useState(settings.heroSlides[2]?.category || '');
  const [slide3Desc, setSlide3Desc] = useState(settings.heroSlides[2]?.description || '');

  // Handle Log-in
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (username === 'admin' && password === settings.adminPasswordHash) {
      setAdminLoggedIn(true);
    } else {
      setAuthError('Access denied. Invalid credentials.');
    }
  };

  // Helper to compress images to reasonable size & resolution to fit Firestore's 1MB limit per document
  const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Scale maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Convert to jpeg at specified quality
            const compressed = canvas.toDataURL('image/jpeg', quality);
            resolve(compressed);
          } else {
            resolve(event.target?.result as string || '');
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Image Drag & Drop Conversion to base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsCompressingImages(true);
      setFormError('');
      const filesArray = Array.from(e.target.files) as File[];
      const filePromises = filesArray.map(file => {
        return compressImage(file, 800, 800, 0.7);
      });

      Promise.all(filePromises).then(base64Images => {
        setProdImages(prev => [...prev, ...base64Images]);
        setIsCompressingImages(false);
      }).catch(err => {
        console.error("Error compressing image:", err);
        setFormError("Failed to compress selected images. Please try different files.");
        setIsCompressingImages(false);
      });
    }
  };

  const removeUploadedImage = (index: number) => {
    setProdImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const limitBytes = 400 * 1024; // 400KB
      if (file.size > limitBytes) {
        setFormError("Direct video uploads are embedded in the database and have a strict limit of 400KB to fit Firestore's 1MB document size limit. For larger videos, please upload them to a video host (YouTube, Vimeo, or Imgur) and paste the URL link instead!");
        return;
      }
      setVideoUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setProdVideoUrl(event.target?.result as string || '');
        setVideoUploading(false);
      };
      reader.onerror = () => {
        setFormError("Failed to read video file.");
        setVideoUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Populate form for editing
  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdCategory(p.category);
    setProdPrice(String(p.price));
    setProdDesc(p.description);
    setProdStock(String(p.stock));
    setProdDimensions(p.dimensions);
    setProdMaterial(p.material);
    setProdTags(p.tags.join(', '));
    setProdImages(p.images);
    setProdVideoUrl(p.videoUrl || '');
    setProdIsActive(p.isActive);
    setShowAddProduct(true);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategory(categories[0]?.id || '');
    setProdPrice('');
    setProdDesc('');
    setProdStock('');
    setProdDimensions('');
    setProdMaterial('');
    setProdTags('');
    setProdImages([]);
    setProdVideoUrl('');
    setProdIsActive(true);
    setFormMsg('');
    setFormError('');
  };

  const handleProductSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormMsg('');
    setFormError('');

    // Robust fallbacks for empty fields so there's "no error no problem"
    const finalName = prodName.trim() || `Premium Item #${products.length + 1}`;
    const finalCategory = prodCategory || (categories[0]?.id || 'general');
    
    let parsedPrice = Number(prodPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      parsedPrice = 150; // reasonable default price
    }

    let parsedStock = Number(prodStock);
    if (isNaN(parsedStock) || parsedStock < 0) {
      parsedStock = 10; // reasonable default stock
    }

    const payload = {
      name: finalName,
      category: finalCategory,
      price: parsedPrice,
      currency: 'SAR',
      description: prodDesc.trim() || 'Premium bespoke crafted piece.',
      images: prodImages.length > 0 ? prodImages : ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80'],
      videoUrl: prodVideoUrl.trim(),
      stock: parsedStock,
      dimensions: prodDimensions.trim() || 'Standard Dimension',
      material: prodMaterial.trim() || 'Premium Materials',
      tags: prodTags ? prodTags.split(',').map(t => t.trim()).filter(Boolean) : [finalCategory],
      isActive: prodIsActive
    };

    // Size limit check for Firestore 1MB document limit
    const payloadStr = JSON.stringify(payload);
    const approxSizeInBytes = payloadStr.length * 2; // UTF-16 characters are 2 bytes each in JS
    const limitInBytes = 1048487; // Firestore strict limit is 1,048,487 bytes
    if (approxSizeInBytes > limitInBytes) {
      const sizeInMB = (approxSizeInBytes / (1024 * 1024)).toFixed(2);
      setFormError(`Product details are too large (${sizeInMB}MB). Firestore has a strict 1MB document limit. Please remove some images, or reduce their quality, and do not upload raw video files directly (paste an online video link instead).`);
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        setFormMsg('Product updated successfully!');
      } else {
        await addProduct(payload);
        setFormMsg('New product created successfully!');
      }

      setTimeout(() => {
        setShowAddProduct(false);
        resetProductForm();
        setIsSubmitting(false);
      }, 1500);
    } catch (err: any) {
      console.error("Failed to submit product:", err);
      setFormError(err.message || 'An error occurred while saving the product to the database. Please verify your Firebase connection and write permissions.');
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Decommission Material Listing',
      message: 'Are you absolutely certain you wish to delete this material listing from the catalog?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        deleteProduct(id);
      }
    });
  };

  // Category Handlers
  const handleInlineCategorySubmit = async () => {
    // Graceful fallback for Category name if left empty
    const finalName = inlineCatName.trim() || `Bespoke Category ${categories.length + 1}`;
    const defaultImg = "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80";
    const finalImage = inlineCatImage.trim() || defaultImg;
    const generatedId = finalName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `cat-${Date.now()}`;

    try {
      await addCategory({
        name: finalName,
        description: inlineCatDesc.trim() || `Showcase of premium ${finalName}`,
        image: finalImage
      });
      // Automatically select the new category
      setProdCategory(generatedId);
      setShowInlineAddCategory(false);
      setInlineCatName('');
      setInlineCatDesc('');
      setInlineCatImage('');
      setFormMsg(`Category "${finalName}" created and assigned successfully!`);
      setTimeout(() => setFormMsg(''), 3000);
    } catch (err: any) {
      console.error("Failed to add inline category:", err);
      setFormError(err.message || "Failed to save category. Please check Firebase rules.");
    }
  };

  const openEditCategory = (c: Category) => {
    setEditingCategory(c);
    setCatName(c.name);
    setCatDesc(c.description);
    setCatImage(c.image);
    setShowAddCategory(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalName = catName.trim() || `Premium Category ${categories.length + 1}`;
    const defaultImg = "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80";
    const finalImage = catImage.trim() || defaultImg;
    const finalDesc = catDesc.trim() || `Premium bespoke collection of ${finalName}`;

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: finalName, description: finalDesc, image: finalImage });
      } else {
        await addCategory({ name: finalName, description: finalDesc, image: finalImage });
      }
    } catch (err) {
      console.error("Failed to submit category:", err);
    }

    setShowAddCategory(false);
    setEditingCategory(null);
    setCatName('');
    setCatDesc('');
    setCatImage('');
  };

  const handleDeleteCategory = (id: string) => {
    const cat = categories.find(c => c.id === id);
    const catName = cat ? cat.name : 'this category';
    setConfirmModal({
      isOpen: true,
      title: 'Decommission Section',
      message: `Are you absolutely certain you wish to delete the section "${catName}"? Material listings in this section will remain, but their section reference will be cleared.`,
      confirmText: 'Delete Section',
      cancelText: 'Cancel',
      onConfirm: () => {
        deleteCategory(id);
      }
    });
  };

  // Settings Handlers
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMsg('');

    const slides: HeroSlide[] = [
      { id: 'slide-1', image: slide1Image, category: slide1Category, description: slide1Desc },
      { id: 'slide-2', image: slide2Image, category: slide2Category, description: slide2Desc },
      { id: 'slide-3', image: slide3Image, category: slide3Category, description: slide3Desc },
    ];

    updateSettings({
      contactPhone: tempPhone,
      contactEmail: tempEmail,
      address: tempAddress,
      deliveryCharge: Number(tempDelivery),
      taxRate: Number(tempTax) / 100,
      heroSlides: slides,
      adminPasswordHash: tempPassword.trim() ? tempPassword.trim() : settings.adminPasswordHash
    });

    setSettingsMsg('Store and Hero Slide configurations saved successfully.');
    setTempPassword('');
  };

  // ANALYTICS COMPUTATIONS
  const totalSales = useMemo(() => {
    return orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  const activeOrdersCount = useMemo(() => {
    return orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  }, [orders]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stock < 5);
  }, [products]);

  // Search filter lists
  const adminProductsFiltered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(prodSearch.toLowerCase()) || p.id.toLowerCase().includes(prodSearch.toLowerCase());
      const matchCat = prodCategoryFilter === 'all' || p.category === prodCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, prodSearch, prodCategoryFilter]);

  const adminOrdersFiltered = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          o.customer.name.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          o.customer.phone.includes(orderSearch);
      const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Customer List extraction
  const customerList = useMemo(() => {
    const clients: { [email: string]: { name: string; phone: string; email: string; address: string; totalSpent: number; ordersCount: number } } = {};
    orders.forEach(o => {
      const email = o.customer.email.toLowerCase();
      if (!clients[email]) {
        clients[email] = {
          name: o.customer.name,
          phone: o.customer.phone,
          email: o.customer.email,
          address: o.customer.address,
          totalSpent: 0,
          ordersCount: 0
        };
      }
      clients[email].ordersCount += 1;
      if (o.status !== 'cancelled') {
        clients[email].totalSpent += o.grandTotal;
      }
    });
    return Object.values(clients);
  }, [orders]);

  // MOCK LOG-IN PAGE SWITCH
  if (!isAdminLoggedIn) {
    return (
      <div className="bg-[#0c0d10] text-brand-gray-light min-h-screen flex items-center justify-center px-4 py-20 font-sans">
        <div className="w-full max-w-md bg-brand-charcoal border border-[#1c1d24] rounded p-8 space-y-6 text-left animate-fade-in">
          
          <div className="text-center space-y-2">
            <span className="text-[#cfa861] tracking-[0.4em] text-[10px] font-semibold uppercase">Security Gateway</span>
            <h2 className="font-serif text-2xl text-white uppercase tracking-wider">ADMIN PORTAL</h2>
            <p className="text-xs text-brand-gray-muted font-light leading-relaxed">
              Enter credentials to establish high-level Administrative Store authorization.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded">
              {authError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-1.5 font-medium">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-3 text-sm text-white focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-1.5 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-3 text-sm text-white focus:outline-none transition-colors pr-10 font-mono tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-3 text-brand-gray-muted hover:text-white cursor-pointer"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#cfa861] hover:bg-[#e6b96c] text-[#0c0d10] py-3.5 rounded font-semibold text-xs tracking-widest uppercase transition-colors flex justify-center items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Access</span>
            </button>
          </form>

          <div className="pt-4 border-t border-[#1c1d24]/60 space-y-4">
            <div className="p-3 bg-[#cfa861]/5 border border-[#cfa861]/15 rounded text-[11px] text-brand-gray-muted leading-relaxed font-sans">
              <span className="text-[#cfa861] font-medium block mb-1">Partner & Team Access Note:</span>
              Use your shared team password to authenticate. This key can be customized globally under "Store Preferences" inside the dashboard.
            </div>

            <div className="text-center">
              <button 
                onClick={() => setCurrentTab('home')}
                className="text-xs text-brand-gray-muted hover:text-[#cfa861] transition-colors uppercase tracking-wider"
              >
                Back to Storefront
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0c0d10] text-brand-gray-light min-h-screen font-sans flex flex-col md:flex-row">
      
      {/* ADMIN SIDEBAR */}
      <div className="w-full md:w-64 bg-brand-charcoal border-b md:border-b-0 md:border-r border-[#1c1d24] flex-shrink-0 text-left p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div>
            <h3 className="font-serif text-lg text-white tracking-[0.1em] uppercase font-medium">
              Masdar Riyadh
            </h3>
            <span className="text-[9px] tracking-[0.2em] text-[#cfa861] uppercase font-mono block">
              Control Panel v1.0
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'products', label: 'Silhouettes', icon: Box },
              { id: 'orders', label: 'Commissions', icon: ClipboardList },
              { id: 'categories', label: 'Collections', icon: Sliders },
              { id: 'customers', label: 'Customer Files', icon: Users },
              { id: 'settings', label: 'Store Preferences', icon: Sliders }
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveAdminTab(tab.id as any);
                    setSelectedAdminOrder(null);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-xs tracking-wider uppercase font-medium rounded transition-all cursor-pointer ${
                    activeAdminTab === tab.id
                      ? 'bg-[#cfa861] text-[#0c0d10]'
                      : 'text-brand-gray-muted hover:bg-[#1c1d24] hover:text-white'
                  }`}
                >
                  <TabIcon className="w-4 h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin actions bottom */}
        <div className="pt-6 border-t border-[#1c1d24]/60 mt-auto space-y-4">
          <div className="text-[10px] space-y-2">
            <div>
              <p className="text-brand-gray-muted uppercase tracking-widest text-[9px] font-semibold">Admin Session</p>
              <p className="font-mono text-white/50">{settings.contactEmail}</p>
            </div>
            
            <div className="p-2.5 bg-[#0c0d10] border border-[#1c1d24] rounded-sm space-y-1.5">
              <p className="text-brand-gray-muted text-[9px] uppercase tracking-wider font-semibold">Firebase Security</p>
              {currentUser ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span>Securely Linked</span>
                  </div>
                  <p className="font-mono text-[9px] text-brand-gray-muted truncate animate-fade-in" title={currentUser.email || ''}>
                    {currentUser.email}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 animate-fade-in">
                  <div className="flex items-center gap-1.5 text-amber-500">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    <span>Google Unlinked</span>
                  </div>
                  <button
                    onClick={loginWithGoogle}
                    className="w-full text-center bg-[#cfa861] hover:bg-[#e6b96c] text-[#0c0d10] font-mono font-bold text-[9px] py-1 rounded-sm uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Link Google
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => {
              setAdminLoggedIn(false);
              setCurrentTab('home');
            }}
            className="w-full flex items-center gap-2 text-xs uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Portal</span>
          </button>
        </div>
      </div>

      {/* ADMIN WORKSPACE PANEL */}
      <div className="flex-grow p-6 sm:p-10 overflow-x-hidden text-left bg-[#0c0d10]">
        
        {/* SUBTAB 1: ANALYTICS OVERVIEW */}
        {activeAdminTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl text-white uppercase tracking-wide">Command Center</h2>
              <p className="text-xs text-brand-gray-muted leading-relaxed font-light">Real-time revenue, production pipeline states, and catalog tracking.</p>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-brand-charcoal border border-[#1c1d24] p-6 rounded-sm">
                <span className="text-[10px] uppercase tracking-wider text-brand-gray-muted font-medium">Gross Furniture Volume</span>
                <p className="text-2xl font-serif text-[#cfa861] font-medium mt-2">{totalSales.toLocaleString()} SAR</p>
                <span className="text-[10px] text-emerald-400 block mt-2 font-mono">100% Client Collection</span>
              </div>

              <div className="bg-brand-charcoal border border-[#1c1d24] p-6 rounded-sm">
                <span className="text-[10px] uppercase tracking-wider text-brand-gray-muted font-medium">Production Line Counts</span>
                <p className="text-2xl font-serif text-white font-medium mt-2">{activeOrdersCount} Active</p>
                <span className="text-[10px] text-[#cfa861] block mt-2 font-mono">{orders.length} total commissions</span>
              </div>

              <div className="bg-brand-charcoal border border-[#1c1d24] p-6 rounded-sm">
                <span className="text-[10px] uppercase tracking-wider text-brand-gray-muted font-medium">Active Silhouettes</span>
                <p className="text-2xl font-serif text-white font-medium mt-2">{products.filter(p => p.isActive).length} Pieces</p>
                <span className="text-[10px] text-brand-gray-muted block mt-2">{categories.length} premium collections</span>
              </div>

              <div className="bg-brand-charcoal border border-[#1c1d24] p-6 rounded-sm">
                <span className="text-[10px] uppercase tracking-wider text-brand-gray-muted font-medium">Low Stock Triggers</span>
                <p className={`text-2xl font-serif font-medium mt-2 ${lowStockProducts.length > 0 ? 'text-amber-400' : 'text-white'}`}>
                  {lowStockProducts.length} Alerts
                </p>
                <span className="text-[10px] text-brand-gray-muted block mt-2">Inventory threshold &lt; 5</span>
              </div>
            </div>

            {/* Main view rows: Recent Commissions & Low stock */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left span 8: Recent Commissions */}
              <div className="lg:col-span-8 bg-brand-charcoal border border-[#1c1d24] p-6 rounded-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#1c1d24]/60 pb-3">
                  <h3 className="font-serif text-sm tracking-widest uppercase text-white">Recent Commissions</h3>
                  <button onClick={() => setActiveAdminTab('orders')} className="text-[#cfa861] text-[11px] uppercase tracking-wider hover:underline">
                    View Logs
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-brand-gray-light border-collapse">
                    <thead>
                      <tr className="border-b border-[#1c1d24]/40 text-brand-gray-muted">
                        <th className="py-2.5 font-medium uppercase tracking-wider">ID</th>
                        <th className="py-2.5 font-medium uppercase tracking-wider">Client</th>
                        <th className="py-2.5 font-medium uppercase tracking-wider">Amount</th>
                        <th className="py-2.5 font-medium uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1c1d24]/40 font-light">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-brand-black/25">
                          <td className="py-3 font-mono font-medium text-[#cfa861]">{ord.id}</td>
                          <td className="py-3 font-medium">{ord.customer.name}</td>
                          <td className="py-3 font-mono">{ord.grandTotal.toLocaleString()} SAR</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-mono rounded bg-brand-black border border-white/5">
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right span 4: Low stock alerts */}
              <div className="lg:col-span-4 bg-brand-charcoal border border-[#1c1d24] p-6 rounded-sm space-y-4">
                <div className="border-b border-[#1c1d24]/60 pb-3">
                  <h3 className="font-serif text-sm tracking-widest uppercase text-white">Stock Warnings</h3>
                </div>

                <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                  {lowStockProducts.length > 0 ? (
                    lowStockProducts.map(p => (
                      <div key={p.id} className="flex gap-3 justify-between items-center text-xs">
                        <div className="text-left font-sans space-y-0.5">
                          <span className="text-white block line-clamp-1">{p.name}</span>
                          <span className="text-brand-gray-muted text-[10px] block">ID: {p.id}</span>
                        </div>
                        <span className="px-2 py-1 text-[10px] font-mono text-amber-400 bg-amber-500/5 border border-amber-500/10 rounded">
                          {p.stock} left
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 space-y-2 text-brand-gray-muted">
                      <Check className="w-8 h-8 text-emerald-400 mx-auto" />
                      <p className="text-xs">Inventory Levels Robust</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SUBTAB 2: PRODUCT MANAGEMENT (CRUD) */}
        {activeAdminTab === 'products' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl text-white uppercase tracking-wide">Silhouettes Catalog</h2>
                <p className="text-xs text-brand-gray-muted leading-relaxed font-light">Draft, adjust, categorize, and deploy active furniture models.</p>
              </div>

              <button
                onClick={() => {
                  resetProductForm();
                  setShowAddProduct(true);
                }}
                className="inline-flex items-center gap-2 bg-[#cfa861] hover:bg-[#e6b96c] text-[#0c0d10] font-sans text-xs tracking-widest uppercase font-semibold px-5 py-3 rounded-sm cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Craft Piece</span>
              </button>
            </div>

            {/* FORM MODAL (Add / Edit Product) */}
            {showAddProduct && (
              <div className="bg-brand-charcoal border border-[#1c1d24] p-6 sm:p-8 rounded shadow-xl text-left animate-fade-in">
                <div className="flex justify-between items-center border-b border-[#1c1d24] pb-4 mb-6">
                  <h3 className="font-serif text-lg text-white font-medium uppercase tracking-wide">
                    {editingProduct ? `Refine ${editingProduct.name}` : 'Assemble New Silhouette'}
                  </h3>
                  <button 
                    onClick={() => {
                      setShowAddProduct(false);
                      resetProductForm();
                    }}
                    className="p-1 rounded hover:bg-[#1c1d24] text-brand-gray-muted hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {formMsg && (
                  <div className="p-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded mb-5 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>{formMsg}</span>
                  </div>
                )}

                {formError && (
                  <div className="p-4 bg-red-500/10 text-red-400 border border-red-500/20 text-xs rounded mb-5 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleProductSubmit} className="space-y-6">
                  {/* Two columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Column left */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-2">Product Name</label>
                        <input
                          type="text"
                          value={prodName}
                          onChange={(e) => setProdName(e.target.value)}
                          className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-3 text-xs text-white focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted">Category Assignment</label>
                            <button
                              type="button"
                              onClick={() => setShowInlineAddCategory(!showInlineAddCategory)}
                              className="text-[9px] text-[#cfa861] hover:text-white uppercase font-mono tracking-wider transition-colors flex items-center gap-0.5 cursor-pointer"
                            >
                              {showInlineAddCategory ? '✕ Close' : '＋ Quick Add'}
                            </button>
                          </div>
                          <select
                            value={prodCategory}
                            onChange={(e) => setProdCategory(e.target.value)}
                            className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-3 text-xs text-white focus:outline-none transition-colors"
                          >
                            <option value="" disabled>Select category...</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>

                          {showInlineAddCategory && (
                            <div className="mt-3 p-3 bg-[#0c0d10] border border-[#cfa861]/25 rounded space-y-3 animate-fade-in relative z-10 text-left">
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#cfa861] block">New Category Specs</span>
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  placeholder="Category Name (e.g. Luxury Seating)"
                                  value={inlineCatName}
                                  onChange={(e) => setInlineCatName(e.target.value)}
                                  className="w-full bg-[#14151b] border border-[#252731] focus:border-[#cfa861] rounded px-3 py-2 text-xs text-white focus:outline-none"
                                />
                                <input
                                  type="text"
                                  placeholder="Vibe Intro (optional)"
                                  value={inlineCatDesc}
                                  onChange={(e) => setInlineCatDesc(e.target.value)}
                                  className="w-full bg-[#14151b] border border-[#252731] focus:border-[#cfa861] rounded px-3 py-2 text-xs text-white focus:outline-none"
                                />
                                <input
                                  type="url"
                                  placeholder="Showcase Image Link (optional)"
                                  value={inlineCatImage}
                                  onChange={(e) => setInlineCatImage(e.target.value)}
                                  className="w-full bg-[#14151b] border border-[#252731] focus:border-[#cfa861] rounded px-3 py-2 text-xs text-white focus:outline-none"
                                />
                              </div>
                              <div className="flex justify-end gap-2 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowInlineAddCategory(false);
                                    setInlineCatName('');
                                    setInlineCatDesc('');
                                    setInlineCatImage('');
                                  }}
                                  className="px-2.5 py-1.5 border border-[#252731] text-brand-gray-light rounded hover:bg-brand-charcoal transition-colors uppercase font-mono"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={handleInlineCategorySubmit}
                                  className="px-3 py-1.5 bg-[#cfa861] hover:bg-[#e6b96c] text-[#0c0d10] font-semibold rounded transition-colors uppercase font-mono"
                                >
                                  Create
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-2">Price (SAR)</label>
                          <input
                            type="number"
                            value={prodPrice}
                            onChange={(e) => setProdPrice(e.target.value)}
                            className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-3 text-xs text-white focus:outline-none transition-colors font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-2">Stock Threshold</label>
                          <input
                            type="number"
                            value={prodStock}
                            onChange={(e) => setProdStock(e.target.value)}
                            className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-3 text-xs text-white focus:outline-none transition-colors font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-[#cfa861]/80 mb-2">Dimensions <span className="text-[9px] text-brand-gray-muted lowercase italic">(Optional)</span></label>
                          <input
                            id="prodDimensions"
                            type="text"
                            placeholder="e.g. 180cm x 80cm x 70cm (Optional)"
                            value={prodDimensions}
                            onChange={(e) => setProdDimensions(e.target.value)}
                            className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-3 text-xs text-white focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-[#cfa861]/80 mb-2">Material Structure <span className="text-[9px] text-brand-gray-muted lowercase italic">(Optional)</span></label>
                        <input
                          id="prodMaterial"
                          type="text"
                          placeholder="e.g. Solid Ash Wood, Top-Grain Leather (Optional)"
                          value={prodMaterial}
                          onChange={(e) => setProdMaterial(e.target.value)}
                          className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-3 text-xs text-white focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Column right */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-2">Poetic Brand Description</label>
                        <textarea
                          rows={4}
                          value={prodDesc}
                          onChange={(e) => setProdDesc(e.target.value)}
                          className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-3 text-xs text-white focus:outline-none transition-colors resize-none"
                        />
                      </div>

                      {/* Multiple Image uploads Drag & Drop */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-2">Multiple Image Upload (Drag & Drop / Files)</label>
                        <div className="border border-dashed border-[#252731] hover:border-[#cfa861] rounded-sm p-4 text-center cursor-pointer bg-[#0c0d10]/40 transition-colors relative">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isCompressingImages}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                          />
                          {isCompressingImages ? (
                            <div className="py-2">
                              <Loader2 className="w-5 h-5 text-[#cfa861] mx-auto animate-spin mb-2" />
                              <span className="text-[10px] text-[#cfa861] block font-sans font-medium animate-pulse">
                                Compressing images for database safety...
                              </span>
                              <span className="text-[9px] text-brand-gray-muted block font-sans mt-0.5">
                                Reducing dimensions and quality to fit Firestore's limits.
                              </span>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-[#cfa861]/80 mx-auto mb-2" />
                              <span className="text-[10px] text-[#cfa861]/80 block font-sans font-medium mb-0.5">
                                Auto-optimized & compressed for database safety.
                              </span>
                              <span className="text-[9px] text-brand-gray-muted block font-sans">
                                Select multiple image files. They will load and compress immediately.
                              </span>
                            </>
                          )}
                        </div>

                        {/* Image Previews */}
                        {prodImages.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {prodImages.map((img, index) => (
                              <div key={index} className="relative w-12 h-12 rounded border border-[#1c1d24] overflow-hidden group bg-brand-black">
                                <img src={img} alt="preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <button
                                  type="button"
                                  onClick={() => removeUploadedImage(index)}
                                  className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Product Video Section (Flipkart style) */}
                      <div className="border-t border-[#1c1d24]/60 pt-4 space-y-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-2">Product Video (Flipkart-Style Playback)</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* File Upload */}
                            <div className="border border-dashed border-[#252731] hover:border-[#cfa861] rounded-sm p-3 text-center cursor-pointer bg-[#0c0d10]/40 transition-colors relative flex flex-col justify-center min-h-[100px]">
                              <input
                                type="file"
                                accept="video/*"
                                onChange={handleVideoUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              {videoUploading ? (
                                <div className="space-y-1">
                                  <Loader2 className="w-5 h-5 text-[#cfa861] mx-auto animate-spin" />
                                  <span className="text-[10px] text-brand-gray-muted">Reading video file...</span>
                                </div>
                              ) : (
                                <>
                                  <Video className="w-5 h-5 text-[#cfa861]/80 mx-auto mb-1" />
                                  <span className="text-[10px] text-[#cfa861]/80 block font-sans font-medium">Upload Video File</span>
                                  <span className="text-[9px] text-brand-gray-muted block font-sans">Max 10MB</span>
                                </>
                              )}
                            </div>
                            
                            {/* Video URL Input */}
                            <div className="flex flex-col justify-center space-y-1.5">
                              <span className="text-[10px] text-brand-gray-muted block font-sans">Or paste Video URL</span>
                              <input
                                type="text"
                                placeholder="e.g. https://www.w3schools.com/html/mov_bbb.mp4"
                                value={prodVideoUrl}
                                onChange={(e) => setProdVideoUrl(e.target.value)}
                                className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                              />
                              <span className="text-[9px] text-brand-gray-muted leading-tight">
                                Supports direct MP4 links, YouTube/Vimeo links, or Base64 uploaded videos.
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Video Preview */}
                        {prodVideoUrl && (
                          <div className="p-3 bg-[#0c0d10] border border-[#1c1d24] rounded-sm flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <PlayCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span className="text-[10px] text-white font-mono truncate max-w-[200px] md:max-w-[350px]" title={prodVideoUrl}>
                                {prodVideoUrl.startsWith('data:') ? 'Base64 Video Attached' : prodVideoUrl}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setProdVideoUrl('')}
                              className="text-red-400 hover:text-red-300 text-[10px] uppercase font-mono tracking-wider cursor-pointer font-semibold"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 items-center pt-2">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-[#cfa861]/80 mb-2">Search Tags <span className="text-[9px] text-brand-gray-muted lowercase italic">(Optional)</span></label>
                          <input
                            id="prodTags"
                            type="text"
                            placeholder="e.g. office, minimalist (Optional)"
                            value={prodTags}
                            onChange={(e) => setProdTags(e.target.value)}
                            className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-3 text-xs text-white focus:outline-none transition-colors"
                          />
                        </div>

                        <div className="flex items-center space-x-3 mt-4">
                          <input
                            type="checkbox"
                            id="prodIsActive"
                            checked={prodIsActive}
                            onChange={(e) => setProdIsActive(e.target.checked)}
                            className="w-4 h-4 rounded border-[#252731] bg-[#0c0d10] text-[#cfa861] focus:ring-[#cfa861]"
                          />
                          <label htmlFor="prodIsActive" className="text-xs text-white font-medium">Visible on Catalog</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-[#1c1d24]">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddProduct(false);
                        resetProductForm();
                      }}
                      className="border border-[#252731] text-brand-gray-light text-xs uppercase tracking-wider px-5 py-3 rounded hover:bg-brand-charcoal transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || isCompressingImages}
                      className={`bg-[#cfa861] hover:bg-[#e6b96c] text-[#0c0d10] text-xs uppercase tracking-wider px-6 py-3 rounded font-semibold transition-colors cursor-pointer ${(isSubmitting || isCompressingImages) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting 
                        ? 'Processing...' 
                        : (isCompressingImages ? 'Compressing...' : (editingProduct ? 'Save Specifications' : 'Deploy Silhouette'))}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Filter controls table */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between text-left bg-brand-charcoal border border-[#1c1d24] p-5 rounded-sm">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-3 w-4 h-4 text-brand-gray-muted" />
                <input
                  type="text"
                  placeholder="Search name or reference..."
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-2.5 pl-9 text-xs text-white focus:outline-none transition-colors"
                />
              </div>

              <div className="flex gap-4 w-full sm:w-auto">
                <select
                  value={prodCategoryFilter}
                  onChange={(e) => setProdCategoryFilter(e.target.value)}
                  className="bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Catalog list logs */}
            <div className="bg-brand-charcoal border border-[#1c1d24] rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-brand-gray-light border-collapse">
                  <thead>
                    <tr className="bg-[#0c0d10] border-b border-[#1c1d24] text-brand-gray-muted">
                      <th className="p-4 font-medium uppercase tracking-wider">Reference</th>
                      <th className="p-4 font-medium uppercase tracking-wider">Name</th>
                      <th className="p-4 font-medium uppercase tracking-wider">Category</th>
                      <th className="p-4 font-medium uppercase tracking-wider">Price</th>
                      <th className="p-4 font-medium uppercase tracking-wider">Stock</th>
                      <th className="p-4 font-medium uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c1d24]/60">
                    {adminProductsFiltered.map(p => (
                      <tr key={p.id} className="hover:bg-brand-black/25">
                        <td className="p-4 font-mono font-medium text-[#cfa861]">{p.id}</td>
                        <td className="p-4 font-medium flex items-center gap-3">
                          <img src={p.images[0]} alt="thumbnail" className="w-8 h-8 rounded border border-white/5 object-cover" referrerPolicy="no-referrer" />
                          <span className={`${p.isActive ? 'text-white' : 'text-brand-gray-muted line-through'}`}>{p.name}</span>
                        </td>
                        <td className="p-4 font-light">{categories.find(c => c.id === p.category)?.name.split('/')[0] || p.category}</td>
                        <td className="p-4 font-mono">{p.price.toLocaleString()} SAR</td>
                        <td className="p-4 font-mono">
                          <span className={`font-semibold ${p.stock < 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button 
                            onClick={() => openEditProduct(p)}
                            className="p-1.5 rounded hover:bg-brand-black text-brand-gray-muted hover:text-[#cfa861] transition-colors"
                            title="Edit specs"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded hover:bg-brand-black text-brand-gray-muted hover:text-red-400 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: ORDER / COMMISSION MANAGEMENT */}
        {activeAdminTab === 'orders' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl text-white uppercase tracking-wide">Commissions Logs</h2>
              <p className="text-xs text-brand-gray-muted leading-relaxed font-light">Supervise progress timelines, adjust states, and compile print-ready invoices.</p>
            </div>

            {/* INVOICE PRINT-PREVIEW SCREEN (Modal overlay) */}
            {showInvoicePrint && (
              <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4 overflow-y-auto font-sans">
                <div className="w-full max-w-2xl bg-white text-black p-8 sm:p-12 space-y-8 shadow-2xl relative text-left my-8">
                  <button 
                    onClick={() => setShowInvoicePrint(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black font-sans text-xs tracking-widest uppercase cursor-pointer print:hidden"
                  >
                    <span>Close</span>
                  </button>

                  {/* Header info */}
                  <div className="flex justify-between items-start border-b border-gray-200 pb-6">
                    <div className="space-y-1">
                      <h1 className="font-serif text-xl tracking-[0.2em] font-bold">MASDAR AL-RIYADH</h1>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-sans">Premium Home & Office Furniture</p>
                      <p className="text-[10px] text-gray-400">Riyadh, Saudi Arabia</p>
                    </div>
                    <div className="text-right space-y-1">
                      <h2 className="font-serif text-lg font-bold">COMMISSION INVOICE</h2>
                      <p className="text-xs font-mono font-semibold text-brand-gold">ID: {showInvoicePrint.id}</p>
                      <p className="text-[10px] text-gray-400">Date: {new Date(showInvoicePrint.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Customer files */}
                  <div className="grid grid-cols-2 gap-8 text-xs font-sans">
                    <div className="space-y-1">
                      <strong className="block text-[10px] uppercase tracking-wider text-gray-400">Commissioned For</strong>
                      <p className="font-bold text-gray-900">{showInvoicePrint.customer.name}</p>
                      <p className="text-gray-600">Tel: {showInvoicePrint.customer.phone}</p>
                      <p className="text-gray-600">Mail: {showInvoicePrint.customer.email}</p>
                    </div>
                    <div className="space-y-1">
                      <strong className="block text-[10px] uppercase tracking-wider text-gray-400">Riyadh Delivery Coordinates</strong>
                      <p className="text-gray-700 leading-relaxed font-light">{showInvoicePrint.customer.address}</p>
                    </div>
                  </div>

                  {/* Items Invoice Table */}
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-300 text-gray-500 font-semibold">
                        <th className="py-2.5">Silhouette Piece</th>
                        <th className="py-2.5 text-center">Qty</th>
                        <th className="py-2.5 text-right">Unit Rate</th>
                        <th className="py-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {showInvoicePrint.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-3 font-semibold text-gray-800">{item.name}</td>
                          <td className="py-3 text-center">{item.quantity}</td>
                          <td className="py-3 text-right">{item.price.toLocaleString()} SAR</td>
                          <td className="py-3 text-right font-semibold text-gray-900">{(item.price * item.quantity).toLocaleString()} SAR</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals Box */}
                  <div className="border-t border-gray-200 pt-6 flex justify-end">
                    <div className="w-64 space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Items Subtotal</span>
                        <span>{showInvoicePrint.total.toLocaleString()} SAR</span>
                      </div>
                      <div className="flex justify-between">
                        <span>White-glove Delivery</span>
                        <span>{showInvoicePrint.deliveryFee} SAR</span>
                      </div>
                      <div className="flex justify-between font-bold text-black text-sm pt-2 border-t border-gray-200">
                        <span>Total Amount Due</span>
                        <span className="text-brand-gold">{showInvoicePrint.grandTotal.toLocaleString()} SAR</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-200 text-center text-[10px] text-gray-400 font-sans">
                    <p>Cash on Delivery (COD) processing invoice. Pay via Bank terminal upon expert physical assembly.</p>
                    <p className="mt-1 font-semibold">Thank you for commission with Masdar Al-Riyadh Furniture.</p>
                  </div>

                  {/* Actions (hidden when printing) */}
                  <div className="flex justify-end gap-3 pt-6 print:hidden">
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 bg-black text-white text-xs uppercase tracking-wider px-5 py-3 rounded hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Document</span>
                    </button>
                    <button
                      onClick={() => setShowInvoicePrint(null)}
                      className="border border-gray-300 text-gray-600 text-xs uppercase tracking-wider px-5 py-3 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Filter controls tab */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between text-left bg-brand-charcoal border border-[#1c1d24] p-5 rounded-sm">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-3 w-4 h-4 text-brand-gray-muted" />
                <input
                  type="text"
                  placeholder="Search receipt ID, phone, client name..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-2.5 pl-9 text-xs text-white focus:outline-none transition-colors"
                />
              </div>

              <div className="flex gap-4 w-full sm:w-auto">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                >
                  <option value="all">All States</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Table logs / Details split screen */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Table logs column (7 span) */}
              <div className="lg:col-span-7 bg-brand-charcoal border border-[#1c1d24] rounded-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-brand-gray-light border-collapse">
                    <thead>
                      <tr className="bg-[#0c0d10] border-b border-[#1c1d24] text-brand-gray-muted">
                        <th className="p-4 font-medium uppercase tracking-wider">ID</th>
                        <th className="p-4 font-medium uppercase tracking-wider">Client</th>
                        <th className="p-4 font-medium uppercase tracking-wider">Amount</th>
                        <th className="p-4 font-medium uppercase tracking-wider">State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1c1d24]/60">
                      {adminOrdersFiltered.map(o => (
                        <tr 
                          key={o.id} 
                          onClick={() => setSelectedAdminOrder(o)}
                          className={`hover:bg-brand-black/25 cursor-pointer ${
                            selectedAdminOrder?.id === o.id ? 'bg-[#cfa861]/5 border-l-2 border-[#cfa861]' : ''
                          }`}
                        >
                          <td className="p-4 font-mono font-medium text-[#cfa861]">{o.id}</td>
                          <td className="p-4 font-medium text-white">{o.customer.name}</td>
                          <td className="p-4 font-mono">{o.grandTotal.toLocaleString()} SAR</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 text-[9px] uppercase tracking-wider font-mono rounded bg-brand-black border border-white/5 text-white/80">
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Detail Screen (5 span) */}
              <div className="lg:col-span-5">
                {selectedAdminOrder ? (
                  <div className="bg-brand-charcoal border border-[#1c1d24] p-6 rounded-sm space-y-6">
                    <div className="flex justify-between items-start border-b border-[#1c1d24]/60 pb-3">
                      <div className="space-y-1">
                        <span className="text-[9px] tracking-wider font-mono uppercase text-[#cfa861]">File Inspector</span>
                        <h3 className="font-serif text-base text-white">Receipt #{selectedAdminOrder.id}</h3>
                      </div>
                      <button
                        onClick={() => setShowInvoicePrint(selectedAdminOrder)}
                        className="p-2 rounded bg-brand-black hover:bg-[#1c1d24] text-brand-gray-muted hover:text-white transition-colors"
                        title="Print invoice document"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-3.5 text-xs">
                      <div>
                        <strong className="block text-[10px] text-brand-gray-muted uppercase tracking-wider mb-0.5">Commission Holder</strong>
                        <span className="text-white font-medium">{selectedAdminOrder.customer.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <strong className="block text-[10px] text-brand-gray-muted uppercase tracking-wider mb-0.5">Telephone</strong>
                          <span className="text-white">{selectedAdminOrder.customer.phone}</span>
                        </div>
                        <div>
                          <strong className="block text-[10px] text-brand-gray-muted uppercase tracking-wider mb-0.5">Email coordinate</strong>
                          <span className="text-white break-all">{selectedAdminOrder.customer.email}</span>
                        </div>
                      </div>
                      <div>
                        <strong className="block text-[10px] text-brand-gray-muted uppercase tracking-wider mb-0.5">Riyadh Destination address</strong>
                        <span className="text-brand-gray-light font-light leading-relaxed">{selectedAdminOrder.customer.address}</span>
                      </div>
                    </div>

                    {/* Ordered items details */}
                    <div className="border-t border-b border-[#1c1d24]/60 py-4 space-y-3">
                      <strong className="block text-[10px] text-brand-gray-muted uppercase tracking-wider">Reserved pieces</strong>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {selectedAdminOrder.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-xs font-sans">
                            <span className="text-brand-gray-light font-light">{it.name} <strong className="text-[#cfa861] font-mono">x{it.quantity}</strong></span>
                            <span className="text-white font-mono">{(it.price * it.quantity).toLocaleString()} SAR</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Adjust states dropdown */}
                    <div className="space-y-3 text-xs">
                      <strong className="block text-[10px] text-brand-gray-muted uppercase tracking-wider">Modify Production State</strong>
                      <div className="flex gap-3">
                        <select
                          value={selectedAdminOrder.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as any;
                            updateOrderStatus(selectedAdminOrder.id, newStatus);
                            setSelectedAdminOrder(prev => prev ? { ...prev, status: newStatus } : null);
                          }}
                          className="flex-grow bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-3 text-xs text-white focus:outline-none transition-colors"
                        >
                          <option value="pending">Pending Authorization</option>
                          <option value="processing">Processing & Assembly</option>
                          <option value="shipped">Shipped En Route</option>
                          <option value="delivered">Delivered & Assembled</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: 'Delete Commission Record',
                              message: `Are you absolutely sure you want to delete commission receipt #${selectedAdminOrder.id} for ${selectedAdminOrder.customer.name}? This action cannot be undone.`,
                              confirmText: 'Delete Record',
                              cancelText: 'Cancel',
                              onConfirm: () => {
                                deleteOrder(selectedAdminOrder.id);
                                setSelectedAdminOrder(null);
                              }
                            });
                          }}
                          className="px-4 py-3 bg-red-950/45 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-red-600 rounded transition-all cursor-pointer font-medium uppercase text-[10px] tracking-wider font-mono flex items-center gap-1.5"
                          title="Delete commission log permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="py-20 text-center border border-dashed border-[#1c1d24] rounded text-brand-gray-muted">
                    <ClipboardList className="w-8 h-8 text-brand-gray-muted/30 mx-auto mb-2" />
                    <p className="text-xs">Select a commission log to inspect coordinates, change status, and compile print invoices.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* SUBTAB 4: CATEGORY / COLLECTION MANAGEMENT */}
        {activeAdminTab === 'categories' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header Controls */}
            <div className="flex justify-between items-center text-left">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl text-white uppercase tracking-wide">Collections Editor</h2>
                <p className="text-xs text-brand-gray-muted leading-relaxed font-light">Structure the core showcase categories that users browse.</p>
              </div>

              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCatName('');
                  setCatDesc('');
                  setCatImage('');
                  setShowAddCategory(true);
                }}
                className="inline-flex items-center gap-2 bg-[#cfa861] hover:bg-[#e6b96c] text-[#0c0d10] font-sans text-xs tracking-widest uppercase font-semibold px-4 py-3 rounded-sm cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Collection</span>
              </button>
            </div>

            {/* ADD / EDIT CATEGORY FORM PANEL */}
            {showAddCategory && (
              <div className="bg-brand-charcoal border border-[#1c1d24] p-6 rounded-sm text-left animate-fade-in">
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-2">Category Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Dining / Hospitality"
                        value={catName}
                        onChange={(e) => setCatName(e.target.value)}
                        className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-2">Description / Vibe Intro</label>
                      <input
                        type="text"
                        placeholder="Poetic introduction to this design genre..."
                        value={catDesc}
                        onChange={(e) => setCatDesc(e.target.value)}
                        className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-2">Showcase Image Link (High resolution CDN)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={catImage}
                      onChange={(e) => setCatImage(e.target.value)}
                      className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddCategory(false)}
                      className="border border-[#252731] text-brand-gray-light text-xs uppercase px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#cfa861] hover:bg-[#e6b96c] text-[#0c0d10] text-xs uppercase px-5 py-2 rounded font-semibold"
                    >
                      {editingCategory ? 'Save Collection' : 'Deploy Collection'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Grid of existing collections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
              {categories.map(cat => {
                const catProducts = products.filter(p => p.category === cat.id);
                return (
                  <div key={cat.id} className="bg-brand-charcoal border border-[#1c1d24] rounded-sm overflow-hidden flex flex-col justify-between space-y-4">
                    {/* Header: Category banner & details */}
                    <div>
                      <div className="relative h-40 bg-brand-black overflow-hidden border-b border-[#1c1d24]">
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d10] via-[#0c0d10]/40 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h4 className="font-serif text-lg text-white font-semibold uppercase tracking-wide">{cat.name}</h4>
                          <span className="text-[9px] tracking-widest text-[#cfa861] uppercase font-mono">
                            {catProducts.length} Material Listings
                          </span>
                        </div>
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button 
                            onClick={() => openEditCategory(cat)} 
                            className="bg-[#0c0d10]/90 hover:bg-[#cfa861] text-[#cfa861] hover:text-[#0c0d10] border border-[#cfa861]/35 px-3 py-1.5 rounded-sm text-[10px] uppercase font-mono transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Edit className="w-3 h-3" /> Adjust Specs
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(cat.id)} 
                            className="bg-red-950/95 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 px-3 py-1.5 rounded-sm text-[10px] uppercase font-mono transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Delete Section
                          </button>
                        </div>
                      </div>
                      <div className="p-5 space-y-4">
                        <p className="text-xs text-brand-gray-muted leading-relaxed font-sans font-light min-h-[40px]">{cat.description}</p>
                        
                        {/* Material Listings for this section */}
                        <div className="border-t border-[#1c1d24] pt-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] tracking-widest uppercase text-brand-gray-muted font-mono">Material Listings ({catProducts.length})</span>
                            <button
                              onClick={() => {
                                resetProductForm();
                                setProdCategory(cat.id);
                                setShowAddProduct(true);
                                setActiveAdminTab('products');
                              }}
                              className="text-[9px] tracking-widest text-[#cfa861] hover:text-white flex items-center gap-1 uppercase transition-colors font-mono cursor-pointer"
                            >
                              <PlusCircle className="w-3 h-3" />
                              <span>Add Material</span>
                            </button>
                          </div>

                          {catProducts.length === 0 ? (
                            <div className="py-6 border border-dashed border-[#1c1d24] text-center rounded">
                              <p className="text-[10px] text-brand-gray-muted italic">No materials uploaded under this section yet.</p>
                            </div>
                          ) : (
                            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                              {catProducts.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-2 bg-[#0c0d10]/50 hover:bg-[#0c0d10] border border-white/5 rounded transition-all">
                                  <div className="flex items-center gap-3">
                                    <img src={p.images[0]} alt="" className="w-8 h-8 rounded object-cover border border-white/5" referrerPolicy="no-referrer" />
                                    <div className="text-left">
                                      <h5 className="text-xs text-white font-medium line-clamp-1">{p.name}</h5>
                                      <div className="flex gap-2 text-[9px] text-brand-gray-muted font-mono">
                                        <span>{p.price.toLocaleString()} SAR</span>
                                        <span>•</span>
                                        <span className={p.stock < 5 ? 'text-amber-400' : 'text-emerald-400'}>{p.stock} units</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        openEditProduct(p);
                                        setActiveAdminTab('products');
                                      }}
                                      className="p-1 hover:text-[#cfa861] text-brand-gray-muted transition-colors cursor-pointer"
                                      title="Edit Specs"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(p.id)}
                                      className="p-1 hover:text-red-400 text-brand-gray-muted transition-colors cursor-pointer"
                                      title="Delete Product"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUBTAB 5: CUSTOMER MANAGEMENT */}
        {activeAdminTab === 'customers' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl text-white uppercase tracking-wide">Customer Files</h2>
              <p className="text-xs text-brand-gray-muted leading-relaxed font-light">View list of clients, contact details, and grand spent history logs.</p>
            </div>

            {/* Customers table */}
            <div className="bg-brand-charcoal border border-[#1c1d24] rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-brand-gray-light border-collapse">
                  <thead>
                    <tr className="bg-[#0c0d10] border-b border-[#1c1d24] text-brand-gray-muted">
                      <th className="p-4 font-medium uppercase tracking-wider">Client Name</th>
                      <th className="p-4 font-medium uppercase tracking-wider">Telephone</th>
                      <th className="p-4 font-medium uppercase tracking-wider">Email coordinate</th>
                      <th className="p-4 font-medium uppercase tracking-wider">Order Counts</th>
                      <th className="p-4 font-medium uppercase tracking-wider text-right">Grand Volume Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c1d24]/60">
                    {customerList.map((client, idx) => (
                      <tr key={idx} className="hover:bg-brand-black/25">
                        <td className="p-4 font-serif font-medium text-white">{client.name}</td>
                        <td className="p-4 font-mono font-light">{client.phone}</td>
                        <td className="p-4 font-light text-brand-gray-muted">{client.email}</td>
                        <td className="p-4 font-mono">{client.ordersCount} placements</td>
                        <td className="p-4 text-right font-mono font-medium text-[#cfa861]">
                          {client.totalSpent.toLocaleString()} SAR
                        </td>
                      </tr>
                    ))}
                    {customerList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-10 text-center text-brand-gray-muted">No clients have authorized commissions yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 6: STORE / HOMEPAGE SETTINGS */}
        {activeAdminTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-8 animate-fade-in text-left">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl text-white uppercase tracking-wide">Brand & Platform Settings</h2>
              <p className="text-xs text-brand-gray-muted leading-relaxed font-light">Update administrative login credentials, local VAT, logistics fees, and homepage presentation slider copy.</p>
            </div>

            {settingsMsg && (
              <div className="p-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded mb-5 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{settingsMsg}</span>
              </div>
            )}

            {/* Sections split grids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Left Column: Basic configuration */}
              <div className="bg-brand-charcoal border border-[#1c1d24] p-6 sm:p-8 rounded-sm space-y-5">
                <h3 className="font-serif text-sm tracking-widest text-white uppercase border-b border-[#1c1d24]/60 pb-3">Financials & Contacts</h3>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-2">Delivery Fee (SAR)</label>
                    <input
                      type="number"
                      value={tempDelivery}
                      onChange={(e) => setTempDelivery(e.target.value)}
                      className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-2">VAT Tax Rate (%)</label>
                    <input
                      type="number"
                      value={tempTax}
                      onChange={(e) => setTempTax(e.target.value)}
                      className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-2">Contact Telephone</label>
                    <input
                      type="text"
                      value={tempPhone}
                      onChange={(e) => setTempPhone(e.target.value)}
                      className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-2">Contact Concierge Email</label>
                    <input
                      type="email"
                      value={tempEmail}
                      onChange={(e) => setTempEmail(e.target.value)}
                      className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="text-xs font-sans">
                  <label className="block text-[10px] uppercase tracking-widest text-brand-gray-muted mb-2">Flagship Showroom Address</label>
                  <input
                    type="text"
                    value={tempAddress}
                    onChange={(e) => setTempAddress(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                  />
                </div>

                {/* Password modification */}
                <div className="text-xs font-sans border-t border-[#1c1d24]/60 pt-4">
                  <label className="block text-[10px] uppercase tracking-widest text-amber-400 mb-2 font-medium">Reset Administrative Password</label>
                  <input
                    type="password"
                    placeholder="Leave blank to preserve current password..."
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[#252731] focus:border-[#cfa861] rounded px-4 py-3 text-xs text-white focus:outline-none transition-colors font-mono tracking-widest"
                  />
                </div>
              </div>

              {/* Right Column: Hero Slider editing */}
              <div className="bg-brand-charcoal border border-[#1c1d24] p-6 sm:p-8 rounded-sm space-y-6">
                <h3 className="font-serif text-sm tracking-widest text-white uppercase border-b border-[#1c1d24]/60 pb-3">Homepage Slider Slides</h3>
                
                {/* Slide 1 */}
                <div className="space-y-3 pb-4 border-b border-[#1c1d24]/40 text-xs">
                  <span className="text-[#cfa861] text-[9px] font-mono font-semibold uppercase">Slide 1: Outdoor Gardens</span>
                  <input
                    type="text"
                    placeholder="Category Overlay Text"
                    value={slide1Category}
                    onChange={(e) => setSlide1Category(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[#252731] rounded px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Description Text"
                    value={slide1Desc}
                    onChange={(e) => setSlide1Desc(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[#252731] rounded px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={slide1Image}
                    onChange={(e) => setSlide1Image(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[#252731] rounded px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                {/* Slide 2 */}
                <div className="space-y-3 pb-4 border-b border-[#1c1d24]/40 text-xs">
                  <span className="text-[#cfa861] text-[9px] font-mono font-semibold uppercase">Slide 2: Indoors Workspace</span>
                  <input
                    type="text"
                    placeholder="Category Overlay Text"
                    value={slide2Category}
                    onChange={(e) => setSlide2Category(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[#252731] rounded px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Description Text"
                    value={slide2Desc}
                    onChange={(e) => setSlide2Desc(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[#252731] rounded px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={slide2Image}
                    onChange={(e) => setSlide2Image(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[#252731] rounded px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                {/* Slide 3 */}
                <div className="space-y-3 text-xs">
                  <span className="text-[#cfa861] text-[9px] font-mono font-semibold uppercase">Slide 3: Living Silhouettes</span>
                  <input
                    type="text"
                    placeholder="Category Overlay Text"
                    value={slide3Category}
                    onChange={(e) => setSlide3Category(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[#252731] rounded px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Description Text"
                    value={slide3Desc}
                    onChange={(e) => setSlide3Desc(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[#252731] rounded px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={slide3Image}
                    onChange={(e) => setSlide3Image(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[#252731] rounded px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-4 border-t border-[#1c1d24]">
              <button
                type="submit"
                className="bg-[#cfa861] hover:bg-[#e6b96c] text-[#0c0d10] text-xs uppercase tracking-widest py-4 px-8 rounded font-semibold transition-colors cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </form>
        )}

      </div>

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
    </div>
  );
};
