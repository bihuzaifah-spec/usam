import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, Category, StoreSettings, CartItem, OrderItem } from '../types';
import { defaultProducts, defaultCategories } from '../data/defaultProducts';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  getDoc,
  query,
  where,
  runTransaction
} from 'firebase/firestore';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  orders: Order[];
  cart: CartItem[];
  settings: StoreSettings;
  
  // Auth state
  currentUser: User | null;
  authLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  setAuthError: (error: string | null) => void;
  
  // View states
  currentTab: 'home' | 'shop' | 'order-tracker' | 'admin' | 'admin-login';
  setCurrentTab: (tab: 'home' | 'shop' | 'order-tracker' | 'admin' | 'admin-login') => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  selectedProductId: string | null;
  setSelectedProductId: (prodId: string | null) => void;
  
  // Admin Activation
  isAdminActive: boolean; // browser unlocked
  setAdminActive: (active: boolean) => void;
  isAdminLoggedIn: boolean; // currently authenticated session
  setAdminLoggedIn: (logged: boolean) => void;
  
  // Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  placeOrder: (customer: { name: string; phone: string; email: string; address: string }, paymentMethod: string) => Promise<Order>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  
  updateSettings: (settings: Partial<StoreSettings>) => Promise<void>;
  
  // Cart Actions
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartSubtotal: () => number;
  getCartTotal: () => number;
  clearAllProducts: () => void;
  addProductReview: (productId: string, review: { userName: string; rating: number; comment: string }) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Master default password
const DEFAULT_PASSWORD = 'riyadh2026';

const initialSettings: StoreSettings = {
  adminPasswordHash: DEFAULT_PASSWORD, // We store as plain text for simple client verification
  logo: 'MASDAR AL-RIYADH',
  contactPhone: '+966 9200 02524',
  contactEmail: 'customercare@masdaronline.com',
  address: 'Riyadh Head Office, Al Yasmin District, King Abdulaziz Road, Riyadh, Saudi Arabia',
  deliveryCharge: 150,
  taxRate: 0.15, // 15% VAT
  heroSlides: [
    {
      id: 'slide-1',
      image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1600&q=80',
      category: 'TIMBER & HARDWOODS',
      description: 'Sustainably sourced Romanian white wood, premium kiln-dried hardwoods, and high-density plywood.'
    },
    {
      id: 'slide-2',
      image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1600&q=80',
      category: 'STRUCTURAL STEEL & REBAR',
      description: 'High-tensile reinforcing steel bars and columns complying with international and SASO standards.'
    },
    {
      id: 'slide-3',
      image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&w=1600&q=80',
      category: 'PIPES, FASTENERS & SAFETY PPE',
      description: 'Certified hot/cold water PPR plumbing, premium steel fasteners, and industrial protective safety gear.'
    }
  ]
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      setAuthError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Google Sign-In failed:", error);
      if (error?.code === 'auth/unauthorized-domain') {
        setAuthError("unauthorized-domain");
      } else {
        setAuthError(error?.message || "An unexpected error occurred during Google Login.");
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign-Out failed:", error);
      throw error;
    }
  };

  // Load state from local storage or defaults initially (as a local cache)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('masdar_products_v2');
    return saved ? JSON.parse(saved) : defaultProducts;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('masdar_categories');
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('masdar_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('masdar_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('masdar_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Admin access unlocked via gear icon
  const [isAdminActive, setAdminActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('masdar_admin_active');
    return saved === 'true';
  });

  // Admin session login state
  const [isAdminLoggedIn, setAdminLoggedIn] = useState<boolean>(() => {
    const saved = sessionStorage.getItem('masdar_admin_logged_in');
    return saved === 'true';
  });

  // Navigation states
  const [currentTab, setCurrentTab] = useState<'home' | 'shop' | 'order-tracker' | 'admin' | 'admin-login'>('home');
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Read URL params to jump directly to a product
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const productParam = urlParams.get('product');
      if (productParam) {
        setSelectedProductId(productParam);
        setCurrentTab('shop');
      }
    }
  }, []);

  // Firestore Migration Logic (runs once when admin logs in to seed or migrate local storage if cloud is empty)
  useEffect(() => {
    if (!isAdminLoggedIn) return;

    const runMigration = async () => {
      try {
        // 1. Migrate settings
        const settingsSnap = await getDocs(collection(db, 'settings'));
        if (settingsSnap.empty) {
          const savedSettings = localStorage.getItem('masdar_settings');
          const localSettings = savedSettings ? JSON.parse(savedSettings) : initialSettings;
          await setDoc(doc(db, 'settings', 'store_config'), localSettings);
        }

        // 2. Migrate categories
        const categoriesSnap = await getDocs(collection(db, 'categories'));
        if (categoriesSnap.empty) {
          const savedCategories = localStorage.getItem('masdar_categories');
          const localCategories = savedCategories ? JSON.parse(savedCategories) : defaultCategories;
          for (const cat of localCategories) {
            await setDoc(doc(db, 'categories', cat.id), cat);
          }
        }

        // 3. Migrate products
        const productsSnap = await getDocs(collection(db, 'products'));
        if (productsSnap.empty) {
          const savedProducts = localStorage.getItem('masdar_products_v2');
          const localProducts = savedProducts ? JSON.parse(savedProducts) : defaultProducts;
          if (localProducts.length > 0) {
            for (const prod of localProducts) {
              await setDoc(doc(db, 'products', prod.id), prod);
            }
          }
        }

        // 4. Migrate orders
        const ordersSnap = await getDocs(collection(db, 'orders'));
        if (ordersSnap.empty) {
          const savedOrders = localStorage.getItem('masdar_orders');
          const localOrders = savedOrders ? JSON.parse(savedOrders) : null;
          if (localOrders && localOrders.length > 0) {
            for (const ord of localOrders) {
              await setDoc(doc(db, 'orders', ord.id), ord);
            }
          } else {
            // Seed initial orders so dashboard is not empty
            const seedOrders: Order[] = [
              {
                id: 'ORD-9824',
                customer: {
                  name: 'Ahmed Al-Saud',
                  phone: '+966 50 123 4567',
                  email: 'ahmed.alsaud@riyadh.sa',
                  address: 'Riyadh, Al Yasmin District, Block 4, Villa 12'
                },
                items: [
                  {
                    productId: 'prod-001',
                    name: 'Premium Romanian Wood',
                    quantity: 1,
                    price: 8400,
                    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=200&q=80'
                  }
                ],
                total: 8400,
                deliveryFee: 150,
                grandTotal: 8550,
                status: 'pending',
                paymentMethod: 'cash_on_delivery',
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
              },
              {
                id: 'ORD-7612',
                customer: {
                  name: 'Reem Al-Otaibi',
                  phone: '+966 55 987 6543',
                  email: 'reem.otaibi@gmail.com',
                  address: 'Riyadh, Al Malqa District, Anas Ibn Malik Road, Building 88'
                },
                items: [
                  {
                    productId: 'prod-003',
                    name: 'Structural Steel Rebar',
                    quantity: 2,
                    price: 3200,
                    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=200&q=80'
                  }
                ],
                total: 6400,
                deliveryFee: 150,
                grandTotal: 6550,
                status: 'delivered',
                paymentMethod: 'cash_on_delivery',
                createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
              }
            ];
            for (const ord of seedOrders) {
              await setDoc(doc(db, 'orders', ord.id), ord);
            }
          }
        }
      } catch (err) {
        console.error("Migration to Firestore failed:", err);
      }
    };

    runMigration();
  }, [isAdminLoggedIn]);

  // Real-time Firestore subscriptions to keep client in sync
  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Product);
      });
      // Sort by createdAt descending
      items.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      setProducts(items);
    }, (error) => {
      console.error("Error subscribing to products:", error);
    });

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const items: Category[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Category);
      });
      setCategories(items);
    }, (error) => {
      console.error("Error subscribing to categories:", error);
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'store_config'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as StoreSettings);
      }
    }, (error) => {
      console.error("Error subscribing to settings:", error);
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubSettings();
    };
  }, []);

  // Real-time Firestore subscriptions for orders based on user credentials (security isolation)
  useEffect(() => {
    let unsubOrders = () => {};

    if (isAdminLoggedIn) {
      // Admin sees all orders
      unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
        const items: Order[] = [];
        snapshot.forEach((doc) => {
          items.push(doc.data() as Order);
        });
        items.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        setOrders(items);
      }, (error) => {
        console.error("Error subscribing to admin orders:", error);
      });
    } else if (currentUser) {
      // Customer only receives their own order history
      const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
      unsubOrders = onSnapshot(q, (snapshot) => {
        const items: Order[] = [];
        snapshot.forEach((doc) => {
          items.push(doc.data() as Order);
        });
        items.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        setOrders(items);
      }, (error) => {
        console.error("Error subscribing to user orders:", error);
      });
    } else {
      setOrders([]);
    }

    return () => {
      unsubOrders();
    };
  }, [isAdminLoggedIn, currentUser]);

  // Sync state to local storage for instant offline/cache load
  useEffect(() => {
    localStorage.setItem('masdar_products_v2', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('masdar_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('masdar_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('masdar_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('masdar_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('masdar_admin_active', String(isAdminActive));
  }, [isAdminActive]);

  useEffect(() => {
    sessionStorage.setItem('masdar_admin_logged_in', String(isAdminLoggedIn));
  }, [isAdminLoggedIn]);

  // Product CRUD (writes to Firestore)
  const addProduct = async (p: Omit<Product, 'id' | 'createdAt'>): Promise<void> => {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...p,
      id,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'products', id), newProduct);
    } catch (err) {
      console.error("Error adding product to Firestore:", err);
      throw err;
    }
  };

  const updateProduct = async (id: string, p: Partial<Product>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'products', id), p);
    } catch (err) {
      console.error("Error updating product in Firestore:", err);
      throw err;
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      console.error("Error deleting product from Firestore:", err);
      throw err;
    }
  };

  const clearAllProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      for (const docSnap of querySnapshot.docs) {
        await deleteDoc(doc(db, 'products', docSnap.id));
      }
    } catch (err) {
      console.error("Error clearing products from Firestore:", err);
      throw err;
    }
  };

  const addProductReview = async (productId: string, r: { userName: string; rating: number; comment: string }): Promise<void> => {
    const reviewId = `rev-${Date.now()}`;
    const newReview = {
      ...r,
      id: reviewId,
      createdAt: new Date().toISOString()
    };

    try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const prodData = productSnap.data() as Product;
        const currentReviews = prodData.reviews || [];
        const updatedReviews = [...currentReviews, newReview];
        await updateDoc(productRef, { reviews: updatedReviews });
      } else {
        throw new Error("Product not found in our catalogs.");
      }
    } catch (err) {
      console.error("Error adding product review to Firestore:", err);
      throw err;
    }
  };

  // Category CRUD (writes to Firestore)
  const addCategory = async (c: Omit<Category, 'id'>): Promise<void> => {
    const id = c.name.toLowerCase().replace(/\s+/g, '-');
    const newCat: Category = {
      ...c,
      id
    };
    try {
      await setDoc(doc(db, 'categories', id), newCat);
    } catch (err) {
      console.error("Error adding category to Firestore:", err);
      throw err;
    }
  };

  const updateCategory = async (id: string, c: Partial<Category>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'categories', id), c);
    } catch (err) {
      console.error("Error updating category in Firestore:", err);
      throw err;
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (err) {
      console.error("Error deleting category from Firestore:", err);
      throw err;
    }
  };

  // Order Placement (writes to Firestore)
  const placeOrder = async (customer: { name: string; phone: string; email: string; address: string }, paymentMethod: string): Promise<Order> => {
    const total = getCartSubtotal();
    const orderItems: OrderItem[] = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.images[0]
    }));

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: orderId,
      userId: currentUser?.uid || null,
      customer,
      items: orderItems,
      total,
      deliveryFee: settings.deliveryCharge,
      grandTotal: total + settings.deliveryCharge,
      status: 'pending',
      paymentMethod,
      createdAt: new Date().toISOString()
    };

    try {
      await runTransaction(db, async (transaction) => {
        // 1. Read all product documents to check stock first
        const productReads = [];
        for (const item of cart) {
          const productRef = doc(db, 'products', item.product.id);
          const snap = await transaction.get(productRef);
          productReads.push({ ref: productRef, item, snapshot: snap });
        }

        // 2. Validate stock availability for each item
        for (const read of productReads) {
          if (!read.snapshot.exists()) {
            throw new Error(`Product "${read.item.product.name}" no longer exists in our catalog.`);
          }
          const dbProduct = read.snapshot.data();
          const currentStock = typeof dbProduct.stock === 'number' ? dbProduct.stock : 0;
          if (currentStock < read.item.quantity) {
            throw new Error(`Insufficient stock for "${read.item.product.name}". Available: ${currentStock}, Requested: ${read.item.quantity}`);
          }
        }

        // 3. Deduct stock
        for (const read of productReads) {
          const dbProduct = read.snapshot.data();
          const currentStock = typeof dbProduct.stock === 'number' ? dbProduct.stock : 0;
          const newStock = Math.max(0, currentStock - read.item.quantity);
          transaction.update(read.ref, { stock: newStock });
        }

        // 4. Save order document
        const orderRef = doc(db, 'orders', orderId);
        transaction.set(orderRef, newOrder);
      });

      // Clear the cart on successful database confirmation
      clearCart();
      return newOrder;
    } catch (err: any) {
      console.error("Transaction failed during order placement:", err);
      throw err;
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']): Promise<void> => {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
    } catch (err) {
      console.error("Error updating order status in Firestore:", err);
      throw err;
    }
  };

  const deleteOrder = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (err) {
      console.error("Error deleting order from Firestore:", err);
      throw err;
    }
  };

  // Settings (writes to Firestore)
  const updateSettings = async (s: Partial<StoreSettings>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'settings', 'store_config'), s);
    } catch (err) {
      console.error("Error updating settings in Firestore:", err);
      throw err;
    }
  };

  // Cart Management
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        // Limit by stock
        updated[existingIdx].quantity = Math.min(newQty, product.stock);
        return updated;
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: Math.min(quantity, item.product.stock) };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartSubtotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartTotal = () => {
    return getCartSubtotal() + settings.deliveryCharge;
  };

  return (
    <StoreContext.Provider value={{
      products,
      categories,
      orders,
      cart,
      settings,
      currentUser,
      authLoading,
      loginWithGoogle,
      logout,
      authError,
      setAuthError,
      currentTab,
      setCurrentTab,
      selectedCategory,
      setSelectedCategory,
      selectedProductId,
      setSelectedProductId,
      isAdminActive,
      setAdminActive,
      isAdminLoggedIn,
      setAdminLoggedIn,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      updateCategory,
      deleteCategory,
      placeOrder,
      updateOrderStatus,
      deleteOrder,
      updateSettings,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      getCartSubtotal,
      getCartTotal,
      clearAllProducts,
      addProductReview
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
