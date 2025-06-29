export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'cashier' | 'server';
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  variants?: ProductVariant[];
  isActive: boolean;
  stock?: number;
  barcode?: string;
  createdAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  priceModifier: number;
  type: 'size' | 'extra';
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  variants: ProductVariant[];
  notes?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'split';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  customerId?: string;
  cashierId: string;
  serverId?: string;
  tableNumber?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailySummary {
  date: string;
  totalSales: number;
  totalOrders: number;
  cashSales: number;
  cardSales: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }>;
}

export interface CashFlow {
  id: string;
  type: 'in' | 'out';
  amount: number;
  reason: string;
  cashierId: string;
  createdAt: Date;
}

export interface Table {
  id: string;
  number: number;
  seats: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string;
}