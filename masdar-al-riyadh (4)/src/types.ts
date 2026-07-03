export interface Review {
  id: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  description: string;
  images: string[];
  videoUrl?: string; // Optional product video
  reviews?: Review[]; // Optional reviews collection
  stock: number;
  dimensions: string;
  material: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Customer {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  id: string;
  userId?: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
  deliveryFee: number;
  grandTotal: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface HeroSlide {
  id: string;
  image: string;
  category: string;
  description: string;
}

export interface StoreSettings {
  adminPasswordHash: string;
  logo: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  deliveryCharge: number;
  taxRate: number; // 0.15 for 15%
  heroSlides: HeroSlide[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
