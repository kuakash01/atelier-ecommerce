// Global TypeScript definitions for the e-commerce platform

export interface CloudinaryImage {
  _id?: string;
  url: string;
  public_id: string;
}

export interface ColorOption {
  _id?: string;
  name: string;
  hex: string;
  colorName?: string;
  colorHex?: string;
  inStock?: boolean;
}

export interface SizeOption {
  _id?: string;
  name: string;
  code?: string;
  inStock?: boolean;
}

export interface ProductVariant {
  _id?: string;
  color: string | ColorOption;
  size: string | SizeOption;
  price: number;
  mrp: number;
  stock: number;
  sku?: string;
}

export interface Product {
  _id: string;
  title: string;
  description?: string;
  slug?: string;
  category: string;
  price: number;
  mrp: number;
  color?: string;
  thumbnail: CloudinaryImage;
  images?: CloudinaryImage[];
  variants?: ProductVariant[];
  colors?: ColorOption[];
  allColors?: ColorOption[];
  sizes?: SizeOption[];
  inStock?: boolean;
  ratings?: {
    average: number;
    count: number;
  };
  filterTags?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string | null;
  image?: CloudinaryImage | null;
  children?: Category[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CarouselSlide {
  _id: string;
  desktopImage: CloudinaryImage;
  mobileImage: CloudinaryImage;
  position: number;
  status: boolean;
  redirectType: 'product' | 'category' | 'landing' | 'filter' | string;
  redirectValue: string;
  headline?: string;
  subheadline?: string;
  tagline?: string;
}

export interface UserData {
  id?: string;
  email?: string;
  name?: string;
  role?: 'customer' | 'admin' | string;
  profilePicture?: string;
  cartCount?: number;
}

export interface AuthState {
  isAuthenticated: boolean | null;
  isAuthModalOpen: boolean;
  userData: UserData | null;
  isLoading: boolean;
}

export interface CartItem {
  _id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  items: CartItem[];
  totalAmount: number;
  totalQty: number;
}

export interface ReviewItem {
  name: string;
  rating: number;
  review: string;
  date?: string;
  verified?: boolean;
  location?: string;
  productPurchased?: string;
}
