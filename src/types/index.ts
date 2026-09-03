export type ViewType = "home" | "products" | "checkout" | "product_detail" | "admin" | "profile" | "order_tracking" | "blog" | "post_detail";
export type TimestampType = Date | string | number | { toDate?: () => Date, seconds?: number, nanoseconds?: number };

export interface Product {
  id: string | number; // Some mock data uses number
  name: string;
  description: string;
  category: string;
  price?: string | number;
  oldPrice?: string | number;
  newPrice?: string | number;
  discount?: string | number;
  sold?: number;
  stock?: number;
  image: string;
  images?: string[];
  rating?: number;
  reviews?: number | Review[]; // sometimes reviews is an array
  brand?: string;
  ingredients?: string;
  details?: {
    brand?: string;
    origin?: string;
    volume?: string;
    skinType?: string;
  };
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserProfile {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city?: string;
  note?: string;
}

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin?: boolean;
  shippingProfile?: UserProfile;
}

export interface Voucher {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  isActive: boolean;
  maxUses?: number;
  usedCount?: number;
  usageLimit?: number;
  createdAt?: TimestampType;
  expiresAt?: TimestampType;
}

export interface Order {
  id: string;
  userId: string;
  customerInfo?: UserProfile;
  shippingProfile?: UserProfile;
  items: CartItem[];
  totalPrice: number;
  shippingFee: number;
  discountAmount: number;
  finalTotal: number;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt?: TimestampType;
  voucherCode?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  imageUrl?: string; // used somewhere
  description?: string; // used somewhere
  buttonText?: string;
  buttonLink?: string;
  link?: string;
  isActive: boolean;
  order?: number;
}

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  readTime: string;
  published: boolean;
  date?: string; // used somewhere
  createdAt?: TimestampType;
}

export interface Review {
  id: string | number;
  productId: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  name?: string;
  text?: string;
  rating: number;
  comment?: string;
  createdAt?: TimestampType;
}

export interface Settings {
  description?: string;
  topBarText?: string;
  storeName?: string;
  phone?: string;
  email?: string;
  address?: string;
  facebook?: string;
  instagram?: string;
  zalo?: string;
  tiktok?: string;
  messenger?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankId?: string;
  categories?: string[];
  brands?: string[];
}
