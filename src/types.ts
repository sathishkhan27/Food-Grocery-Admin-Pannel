/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum OrderStatus {
  PENDING = "PENDING",
  ASSIGNED = "ASSIGNED",
  PREPARING = "PREPARING",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  NEARBY = "NEARBY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED"
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  weight?: string;
  description: string;
  category: "food" | "grocery";
  image: string;
  subCategory?: string;
  gstRate?: number; // GST percentage for this item (e.g. 0, 5, 12, 18)
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface PaymentInfo {
  cardNumber: string;
  cardName: string;
  status: "paid" | "refunded" | "pending";
  amount: number;
  transactionId: string;
  refundId?: string;
  refundedAt?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryLocation: LatLng;
  deliveryAddress: string;
  restaurantLocation: LatLng;
  restaurantName: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverLocation?: LatLng;
  payment: PaymentInfo;
  rating?: number;
  feedback?: string;
  routeNodes?: LatLng[];
  trafficDelayMinutes?: number;
  aiOptimizedEta?: string;
  aiRouteExplanation?: string;
  alternativeRoutes?: Array<{
    name: string;
    routeNodes: LatLng[];
    trafficDelayMinutes: number;
    aiOptimizedEta: string;
    aiRouteExplanation: string;
  }>;
  selectedRouteIndex?: number;
  assignmentConfirmed?: boolean;
  rejectedDriverIds?: string[];
  cgstAmount?: number;
  sgstAmount?: number;
  cgstRate?: number;
  sgstRate?: number;
  discountAmount?: number;
  appliedPromo?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  avatar: string;
  status: "idle" | "delivering" | "offline";
  currentLocation: LatLng;
  rating: number;
  isRegistered?: boolean;
  plateNumber?: string;
  backgroundStatus?: "pending" | "approved" | "none";
  completedDeliveries?: number;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  sender: "customer" | "driver";
  text: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}

export interface NotificationLog {
  id: string;
  type: "order" | "marketing" | "promo";
  title: string;
  body: string;
  timestamp: string;
  playSound?: boolean;
}

export interface PromoBanner {
  id: string;
  title: string;
  desc: string;
  bg: string;
  code: string;
  discountType: "flat_percentage" | "flat_amount" | "combo";
  discountValue: number;
  minCartValue: number;
  comboItems?: string[]; // IDs of products required together for a combo discount
  isActive: boolean;
}

export interface GSTConfig {
  cgstRate: number; // e.g., 9 for 9% CGST
  sgstRate: number; // e.g., 9 for 9% SGST
}

export interface AppState {
  orders: Order[];
  drivers: Driver[];
  chats: ChatMessage[];
  notifications: NotificationLog[];
  autoAssignment: boolean;
  inventory?: { [id: string]: number };
  menuItems?: MenuItem[];
  banners?: PromoBanner[];
  gstConfig?: GSTConfig;
  isTrialMode?: boolean;
}
