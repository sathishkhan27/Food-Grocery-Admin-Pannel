/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";
import { Order, OrderStatus, Driver, ChatMessage, NotificationLog, LatLng, MenuItem, PromoBanner, GSTConfig } from "./src/types.js";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Google GenAI
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Google GenAI client initialized successfully with API key.");
  } catch (err) {
    console.error("Error initializing Google GenAI client:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. AI routing will fall back to local simulator.");
}

// Global In-Memory State
const initialDrivers: Driver[] = [
  {
    id: "driver_1",
    name: "Alex Carter",
    phone: "+1 (555) 123-4567",
    vehicle: "E-Bike (Eco-Express)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    status: "idle",
    currentLocation: { lat: 37.773, lng: -122.422 },
    rating: 4.8,
    completedDeliveries: 18
  },
  {
    id: "driver_2",
    name: "Marcus Vance",
    phone: "+1 (555) 987-6543",
    vehicle: "Electric Sedan (Bolt)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    status: "idle",
    currentLocation: { lat: 37.781, lng: -122.415 },
    rating: 4.9,
    completedDeliveries: 24
  },
  {
    id: "driver_3",
    name: "Sophia Martinez",
    phone: "+1 (555) 456-7890",
    vehicle: "Motorcycle (Pulsar)",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    status: "idle",
    currentLocation: { lat: 37.765, lng: -122.430 },
    rating: 4.7,
    completedDeliveries: 15
  }
];

let drivers: Driver[] = [...initialDrivers];
let orders: Order[] = [];
let chats: ChatMessage[] = [];
let notifications: NotificationLog[] = [
  {
    id: "notif_init_1",
    type: "marketing",
    title: "Welcome to PingZo!",
    body: "Use promo code PINGZO50 to get 50% off on your first order. Live tracking enabled!",
    timestamp: new Date().toISOString()
  },
  {
    id: "notif_init_2",
    type: "promo",
    title: "Fresh Groceries Delivered Fast",
    body: "Get organic vegetables and dairy products in 15 minutes. Explore PingZo Groceries.",
    timestamp: new Date(Date.now() - 3600000).toISOString()
  }
];
let autoAssignment = true;
let isTrialMode = true;

const initialMenuItems: MenuItem[] = [
  { id: "m_1", name: "Premium Truffle Burger", price: 299, oldPrice: 399, weight: "1 pc", description: "Aged beef patty, black truffle aioli, wild mushrooms, swiss cheese.", category: "food", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&fit=crop" },
  { id: "m_2", name: "Neapolitan Burrata Pizza", price: 399, oldPrice: 499, weight: "1 pc", description: "San Marzano tomatoes, fresh burrata, aromatic basil, cold-pressed olive oil.", category: "food", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&fit=crop" },
  { id: "m_3", name: "Spicy Salmon Crunch Roll", price: 499, oldPrice: 599, weight: "8 pcs", description: "8 pieces of sushi grade salmon, dynamic crunch crisp, spicy sriracha glaze.", category: "food", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&fit=crop" },
  { id: "g_veg_1", name: "Coriander Leaves", price: 10, oldPrice: 21, weight: "80 - 100 g", description: "Freshly cut, highly aromatic coriander leaves, perfect for garnishing.", category: "grocery", subCategory: "Vegetables", image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&fit=crop" },
  { id: "g_veg_2", name: "Tomato Local", price: 19, oldPrice: 55, weight: "500 g", description: "Vine-ripened, sour-sweet local tomatoes, farm-sourced.", category: "grocery", subCategory: "Vegetables", image: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&fit=crop" },
  { id: "g_veg_3", name: "Onion Local", price: 36, oldPrice: 86, weight: "900 g - 1 kg", description: "High-quality pink onions, essential daily vegetable.", category: "grocery", subCategory: "Vegetables", image: "https://images.unsplash.com/photo-1508747705-3df207a84c6f5?w=400&fit=crop" },
  { id: "g_veg_4", name: "Mint Leaves", price: 11, oldPrice: 21, weight: "100 g", description: "Zesty green mint leaves, ideal for chutneys and coolers.", category: "grocery", subCategory: "Vegetables", image: "https://images.unsplash.com/photo-1515252814826-6a84f3316279?w=400&fit=crop" },
  { id: "g_veg_5", name: "Sweet Orange Carrots", price: 39, oldPrice: 65, weight: "1 kg", description: "Crispy, sweet orange carrots, packed with Vitamin A.", category: "grocery", subCategory: "Vegetables", image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&fit=crop" },
  { id: "g_fr_1", name: "Fresh Banana Robusta", price: 49, oldPrice: 80, weight: "1 kg (5-6 pcs)", description: "Premium Robusta yellow bananas, high in energy.", category: "grocery", subCategory: "Fruits", image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&fit=crop" },
  { id: "g_fr_2", name: "Shimla Red Apples", price: 149, oldPrice: 220, weight: "4 pcs (approx. 500-600g)", description: "Crisp and juicy sweet red apples from Himachal.", category: "grocery", subCategory: "Fruits", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&fit=crop" },
  { id: "g_fr_3", name: "Sweet Papaya", price: 39, oldPrice: 65, weight: "1 pc (approx. 800g)", description: "Naturally sweet and healthy semi-ripe papaya.", category: "grocery", subCategory: "Fruits", image: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&fit=crop" },
  { id: "g_deal_1", name: "Bellavita CEO Man Perfume", price: 485, oldPrice: 899, weight: "1 pc (100 ml)", description: "Aromatic luxury perfume with long lasting masculine fragrance notes.", category: "grocery", subCategory: "Pantry", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&fit=crop" },
  { id: "g_deal_2", name: "Plum Green Tea Face Wash", price: 145, oldPrice: 199, weight: "1 pc (50 ml)", description: "Gentle soap-free foaming gel face wash, rich in antioxidant green tea extracts.", category: "grocery", subCategory: "Pantry", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&fit=crop" },
  { id: "g_deal_3", name: "Special Atta Premium Pack", price: 84, oldPrice: 97.2, weight: "1 pack (45 pcs)", description: "Finely milled whole wheat chapatis mix for everyday cooking.", category: "grocery", subCategory: "Pantry", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&fit=crop" }
];

let menuItems: MenuItem[] = [...initialMenuItems];

// Default stock count of products organized category-based
const defaultInventory: { [id: string]: number } = {
  "m_1": 25,
  "m_2": 15,
  "m_3": 20,
  "g_veg_1": 15,
  "g_veg_2": 25,
  "g_veg_3": 30,
  "g_veg_4": 12,
  "g_veg_5": 8,
  "g_fr_1": 18,
  "g_fr_2": 4, // low stock
  "g_fr_3": 0, // out of stock
  "g_deal_1": 12,
  "g_deal_2": 6,
  "g_deal_3": 30
};

let inventory: { [id: string]: number } = { ...defaultInventory };

const initialBanners: PromoBanner[] = [
  {
    id: "b_1",
    title: "⚡️ WEEKEND BLITZ",
    desc: "Get ₹50 Off on orders above ₹199 with code PINGZO50",
    bg: "from-amber-500 to-rose-600",
    code: "PINGZO50",
    discountType: "flat_amount",
    discountValue: 50,
    minCartValue: 199,
    isActive: true
  },
  {
    id: "b_2",
    title: "🥑 ORGANIC FESTIVAL",
    desc: "Free delivery on all groceries above ₹150! Code: FREESHIP",
    bg: "from-emerald-500 to-cyan-600",
    code: "FREESHIP",
    discountType: "flat_amount",
    discountValue: 39,
    minCartValue: 150,
    isActive: true
  },
  {
    id: "b_3",
    title: "🥗 COMBO FESTIVAL",
    desc: "Flat ₹100 Off when you buy Premium Truffle Burger & Neapolitan Pizza! Code: BURGERPIZZA",
    bg: "from-purple-600 to-indigo-700",
    code: "BURGERPIZZA",
    discountType: "combo",
    discountValue: 100,
    minCartValue: 0,
    comboItems: ["m_1", "m_2"],
    isActive: true
  },
  {
    id: "b_4",
    title: "🏷️ FLAT 15% SPECIAL",
    desc: "Get 15% off on your entire cart! Code: PINGZO15",
    bg: "from-pink-500 to-purple-600",
    code: "PINGZO15",
    discountType: "flat_percentage",
    discountValue: 15,
    minCartValue: 100,
    isActive: true
  }
];

let banners: PromoBanner[] = [...initialBanners];

let gstConfig: GSTConfig = {
  cgstRate: 2.5, // 2.5% CGST
  sgstRate: 2.5  // 2.5% SGST
};

// Helper to push notifications
function pushNotification(type: "order" | "marketing" | "promo", title: string, body: string, playSound = false) {
  const notif: NotificationLog = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    type,
    title,
    body,
    timestamp: new Date().toISOString(),
    playSound
  };
  notifications.unshift(notif);
}

// Generate simple path between two coordinates for simulated tracking fallback
function generateRouteNodes(start: LatLng, end: LatLng, steps = 8, deviation = 0): LatLng[] {
  const nodes: LatLng[] = [];
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    // Add minor wiggles to make the route look like realistic roads rather than straight lines
    const wiggleFactor = (0.001 + deviation) * Math.sin(ratio * Math.PI);
    nodes.push({
      lat: start.lat + (end.lat - start.lat) * ratio + (i > 0 && i < steps ? wiggleFactor : 0),
      lng: start.lng + (end.lng - start.lng) * ratio + (i > 0 && i < steps ? wiggleFactor * 1.5 : 0)
    });
  }
  return nodes;
}

function getDistance(p1: LatLng, p2: LatLng): number {
  return Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2));
}

// Auto-assign pending orders to the nearest online available driver
async function runAutoAssignmentQueue() {
  if (!autoAssignment) return;

  // Find all orders that are PENDING (i.e. not assigned, or returned to PENDING after rejection)
  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING);
  if (pendingOrders.length === 0) return;

  for (const order of pendingOrders) {
    // Find all online idle drivers who have NOT rejected this order yet
    const availableDrivers = drivers.filter(d => 
      d.status === "idle" && 
      (!order.rejectedDriverIds || !order.rejectedDriverIds.includes(d.id))
    );

    if (availableDrivers.length === 0) continue;

    // Sort available drivers by distance to the restaurant (priority-wise auto assign)
    availableDrivers.sort((a, b) => {
      const distA = getDistance(a.currentLocation, order.restaurantLocation);
      const distB = getDistance(b.currentLocation, order.restaurantLocation);
      return distA - distB;
    });

    const nearestDriver = availableDrivers[0];

    // Assign as unconfirmed offer to nearest available driver
    nearestDriver.status = "delivering"; // Mark as delivering to reserve them
    order.status = OrderStatus.ASSIGNED;
    order.assignmentConfirmed = false;
    order.driverId = nearestDriver.id;
    order.driverName = nearestDriver.name;
    order.driverPhone = nearestDriver.phone;
    order.driverLocation = { ...nearestDriver.currentLocation };

    // Set optimized route
    try {
      const aiRoute = await getAIoptimizedRoute(order.restaurantLocation, order.deliveryLocation);
      order.routeNodes = aiRoute.routeNodes;
      order.trafficDelayMinutes = aiRoute.trafficDelayMinutes;
      order.aiOptimizedEta = aiRoute.aiOptimizedEta;
      order.aiRouteExplanation = aiRoute.aiRouteExplanation;
      order.alternativeRoutes = aiRoute.alternativeRoutes;
      order.selectedRouteIndex = aiRoute.selectedRouteIndex;
    } catch (aiErr) {
      const alt1 = generateRouteNodes(order.restaurantLocation, order.deliveryLocation, 10, 0.002);
      const alt2 = generateRouteNodes(order.restaurantLocation, order.deliveryLocation, 10, -0.0025);
      const alt3 = generateRouteNodes(order.restaurantLocation, order.deliveryLocation, 10, 0.0045);
      order.routeNodes = alt1;
      order.trafficDelayMinutes = 2;
      order.aiOptimizedEta = "12 mins";
      order.aiRouteExplanation = "Local router estimated direct paths with light afternoon breeze delays.";
      order.alternativeRoutes = [
        { name: "⚡️ PingZo AI-Suggested (Fastest)", routeNodes: alt1, trafficDelayMinutes: 2, aiOptimizedEta: "12 mins", aiRouteExplanation: "Optimized route that bypasses active construction on 5th Street via direct alleyway connectors." },
        { name: "🛣️ Expressway Direct Corridor", routeNodes: alt2, trafficDelayMinutes: 8, aiOptimizedEta: "18 mins", aiRouteExplanation: "Primary highway corridor route. Shorter mileage but experiences peak-hour merging backlog." },
        { name: "🚴 E-Bike Eco-Alley", routeNodes: alt3, trafficDelayMinutes: 0, aiOptimizedEta: "21 mins", aiRouteExplanation: "Scenic flat route optimized for light electric vehicles, skipping major high-traffic junctions." }
      ];
      order.selectedRouteIndex = 0;
    }

    pushNotification("order", "Order Assigned (Awaiting Confirmation)", `Your order from ${order.restaurantName} is offered to nearby rider ${nearestDriver.name}.`, true);
  }
}

// API Endpoints

// 1. Get entire applet state
app.get("/api/state", (req, res) => {
  res.json({
    orders,
    drivers,
    chats,
    notifications,
    autoAssignment,
    inventory,
    menuItems,
    banners,
    gstConfig,
    isTrialMode
  });
});

// 1b. Toggle Trial Mode
app.post("/api/admin/toggle-trial", (req, res) => {
  isTrialMode = !isTrialMode;
  res.json({ success: true, isTrialMode });
});

// 2. Reset applet state for testing / demo
app.post("/api/admin/reset", (req, res) => {
  drivers = [...initialDrivers].map(d => ({ ...d, status: "idle", currentLocation: { ...d.currentLocation } }));
  orders = [];
  chats = [];
  inventory = { ...defaultInventory };
  menuItems = [...initialMenuItems];
  banners = [...initialBanners];
  gstConfig = {
    cgstRate: 2.5,
    sgstRate: 2.5
  };
  notifications = [
    {
      id: "notif_init_1",
      type: "marketing",
      title: "Welcome to PingZo!",
      body: "Use promo code PINGZO50 to get 50% off on your first order. Live tracking enabled!",
      timestamp: new Date().toISOString()
    }
  ];
  autoAssignment = true;
  pushNotification("marketing", "System Restored", "All orders, stocks, and simulation loops have been reset successfully.");
  res.json({ success: true });
});

// 3. Create a new Order
app.post("/api/order/create", async (req, res) => {
  const { customerName, customerPhone, deliveryLocation, deliveryAddress, restaurantName, restaurantLocation, items, totalPrice, payment, cgstRate, sgstRate, cgstAmount, sgstAmount, discountAmount, appliedPromo } = req.body;

  // Enforce inventory stock check
  if (items && Array.isArray(items)) {
    for (const item of items) {
      const menuItemId = item.menuItem?.id;
      const quantity = item.quantity || 1;
      if (menuItemId && inventory[menuItemId] !== undefined) {
        if (inventory[menuItemId] < quantity) {
          return res.status(400).json({ error: `Item "${item.menuItem?.name || menuItemId}" is out of stock. Please adjust your cart.` });
        }
      }
    }

    // Deduct stock after confirming all items are in stock
    for (const item of items) {
      const menuItemId = item.menuItem?.id;
      const quantity = item.quantity || 1;
      if (menuItemId && inventory[menuItemId] !== undefined) {
        inventory[menuItemId] = Math.max(0, inventory[menuItemId] - quantity);
      }
    }
  }

  const orderId = `order_${Date.now().toString().slice(-6)}`;
  
  // Setup order model
  const newOrder: Order = {
    id: orderId,
    customerName: customerName || "Guest Customer",
    customerPhone: customerPhone || "+1 (555) 000-1111",
    deliveryLocation,
    deliveryAddress,
    restaurantName,
    restaurantLocation,
    items,
    totalPrice,
    status: OrderStatus.PENDING,
    createdAt: new Date().toISOString(),
    cgstRate,
    sgstRate,
    cgstAmount,
    sgstAmount,
    discountAmount,
    appliedPromo,
    payment: {
      cardNumber: payment?.cardNumber || "**** **** **** 1234",
      cardName: payment?.cardName || "Customer Name",
      status: "paid",
      amount: totalPrice,
      transactionId: `tx_${Date.now()}_${Math.floor(Math.random() * 10000)}`
    }
  };

  orders.unshift(newOrder);

  pushNotification("order", "Order Placed!", `Your order from ${restaurantName} of ₹${totalPrice.toFixed(2)} is being processed.`, true);

  // Auto Assignment System via unified queue
  if (autoAssignment) {
    await runAutoAssignmentQueue();
  } else {
    pushNotification("order", "Manual Assignment Mode", "Order has been placed but needs manual driver assignment from dashboard.", true);
  }

  // Get the updated state of the newOrder (it may now have been assigned to a driver)
  const finalOrder = orders.find(o => o.id === newOrder.id) || newOrder;

  res.json({ success: true, order: finalOrder });
});

// 3.5. Create a Simulation Demo Order for Live Tracking testing
app.post("/api/order/create-demo", async (req, res) => {
  const { customerName, customerPhone, deliveryLocation, deliveryAddress } = req.body;

  const demoItems = [
    {
      menuItem: menuItems[0], // Premium Truffle Burger
      quantity: 1
    }
  ];
  
  const totalPrice = menuItems[0].price;
  const restaurantName = "SOMA Organic Grocers";
  const restaurantLocation = { lat: 37.7712, lng: -122.4205 };

  const orderId = `order_demo_${Date.now().toString().slice(-4)}`;

  const demoOrder: Order = {
    id: orderId,
    customerName: customerName || "Demo Sathish Khan",
    customerPhone: customerPhone || "+1 (555) 789-1234",
    deliveryLocation: deliveryLocation || { lat: 37.7812, lng: -122.4154 },
    deliveryAddress: deliveryAddress || "789 Mission St, San Francisco, CA",
    restaurantName,
    restaurantLocation,
    items: demoItems,
    totalPrice,
    status: OrderStatus.PENDING,
    createdAt: new Date().toISOString(),
    cgstRate: 2.5,
    sgstRate: 2.5,
    cgstAmount: Math.round(totalPrice * 0.025 * 100) / 100,
    sgstAmount: Math.round(totalPrice * 0.025 * 100) / 100,
    discountAmount: 0,
    payment: {
      cardNumber: "**** **** **** 4242",
      cardName: customerName || "Demo Sathish Khan",
      status: "paid",
      amount: totalPrice,
      transactionId: `tx_demo_${Date.now()}`
    }
  };

  orders.unshift(demoOrder);
  pushNotification("order", "Demo Tracking Active!", "Simulated live courier route has been prepared.");

  // Force assign to Driver 1 for instant simulation
  const driver = drivers.find(d => d.id === "driver_1");
  if (driver) {
    driver.status = "delivering";
    demoOrder.status = OrderStatus.ASSIGNED;
    demoOrder.assignmentConfirmed = true;
    demoOrder.driverId = driver.id;
    demoOrder.driverName = driver.name;
    demoOrder.driverPhone = driver.phone;
    demoOrder.driverLocation = { ...driver.currentLocation };

    // Generate path route nodes
    const altRoute = generateRouteNodes(restaurantLocation, demoOrder.deliveryLocation, 10, 0.002);
    demoOrder.routeNodes = altRoute;
    demoOrder.trafficDelayMinutes = 1;
    demoOrder.aiOptimizedEta = "10 mins";
    demoOrder.aiRouteExplanation = "AI selected optimized SOMA bypass route avoiding active Market St blockages.";
  }

  res.json({ success: true, order: demoOrder });
});

// 4. Cancel Order with Automated Refund Workflow
app.post("/api/order/cancel", (req, res) => {
  const { orderId } = req.body;
  const orderIndex = orders.findIndex(o => o.id === orderId);

  if (orderIndex === -1) {
    return res.status(404).json({ error: "Order not found" });
  }

  const order = orders[orderIndex];
  if (order.status === OrderStatus.DELIVERED) {
    return res.status(400).json({ error: "Delivered orders cannot be cancelled." });
  }

  order.status = OrderStatus.CANCELLED;

  // Restore inventory stock
  if (order.items && Array.isArray(order.items)) {
    for (const item of order.items) {
      const menuItemId = item.menuItem?.id;
      const quantity = item.quantity || 1;
      if (menuItemId && inventory[menuItemId] !== undefined) {
        inventory[menuItemId] += quantity;
      }
    }
  }
  
  // Refund processing automated workflow
  order.payment.status = "refunded";
  order.payment.refundId = `ref_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  order.payment.refundedAt = new Date().toISOString();

  // Free up driver
  if (order.driverId) {
    const driver = drivers.find(d => d.id === order.driverId);
    if (driver) {
      driver.status = "idle";
    }
  }

  pushNotification("order", "Order Cancelled & Refunded", `Order #${order.id} cancelled. Refund of ₹${order.totalPrice.toFixed(2)} processed to your card instantly.`, true);
  res.json({ success: true, order });
});

// 5. Rate order / Submit feedback
app.post("/api/order/rate", (req, res) => {
  const { orderId, rating, feedback } = req.body;
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  order.rating = rating;
  order.feedback = feedback || "";

  // Update driver rating average slightly for simulation
  if (order.driverId) {
    const driver = drivers.find(d => d.id === order.driverId);
    if (driver) {
      driver.rating = parseFloat(((driver.rating * 9 + rating) / 10).toFixed(2));
    }
  }

  res.json({ success: true, order });
});

// 6. Real-time chat send
app.post("/api/chat/send", (req, res) => {
  const { orderId, sender, text } = req.body;

  const newMessage: ChatMessage = {
    id: `msg_${Date.now()}`,
    orderId,
    sender,
    text,
    timestamp: new Date().toISOString()
  };

  chats.push(newMessage);
  res.json({ success: true, message: newMessage });
});

// 7. Update driver location and order tracking status (Simulated real-time)
app.post("/api/driver/update-status", (req, res) => {
  const { driverId, orderId, status, lat, lng } = req.body;

  const driver = drivers.find(d => d.id === driverId);
  if (driver && lat && lng) {
    driver.currentLocation = { lat, lng };
  }

  if (orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      if (status) {
        order.status = status;
        
        // Automated notification updates triggered on state change
        if (status === OrderStatus.PREPARING) {
          pushNotification("order", "Restaurant Preparing", `${order.restaurantName} is wrapping up your fresh items.`, true);
        } else if (status === OrderStatus.OUT_FOR_DELIVERY) {
          pushNotification("order", "Out for Delivery", `Driver ${order.driverName} is on the way to your delivery address.`, true);
        } else if (status === OrderStatus.NEARBY) {
          pushNotification("order", "Driver Nearby!", `${order.driverName} is just a minute away. Please get ready to collect.`, true);
        } else if (status === OrderStatus.DELIVERED) {
          pushNotification("order", "Order Delivered!", `Yay! Your order from ${order.restaurantName} has arrived. Enjoy your meal!`, true);
          // Free up driver
          if (driver) {
            driver.status = "idle";
          }
        }
      }
      if (lat && lng) {
        order.driverLocation = { lat, lng };
      }
    }
  }

  res.json({ success: true });
});

// 8. Administrative actions
app.post("/api/admin/toggle-auto", (req, res) => {
  const { enabled } = req.body;
  autoAssignment = enabled;
  pushNotification("marketing", "Auto Order Manager", `Auto-order assignment has been turned ${enabled ? "ON" : "OFF"}.`);
  res.json({ success: true, autoAssignment });
});

// 9. Manual Assignment of Driver
app.post("/api/admin/assign", async (req, res) => {
  const { orderId, driverId } = req.body;
  const order = orders.find(o => o.id === orderId);
  const driver = drivers.find(d => d.id === driverId);

  if (!order || !driver) {
    return res.status(404).json({ error: "Order or driver not found." });
  }

  if (driver.status !== "idle") {
    return res.status(400).json({ error: "Driver is already on duty." });
  }

  // De-assign previous driver if any
  if (order.driverId) {
    const prevDriver = drivers.find(d => d.id === order.driverId);
    if (prevDriver) prevDriver.status = "idle";
  }

  driver.status = "delivering";
  order.status = OrderStatus.ASSIGNED;
  order.driverId = driver.id;
  order.driverName = driver.name;
  order.driverPhone = driver.phone;
  order.driverLocation = { ...driver.currentLocation };

  try {
    const aiRoute = await getAIoptimizedRoute(order.restaurantLocation, order.deliveryLocation);
    order.routeNodes = aiRoute.routeNodes;
    order.trafficDelayMinutes = aiRoute.trafficDelayMinutes;
    order.aiOptimizedEta = aiRoute.aiOptimizedEta;
    order.aiRouteExplanation = aiRoute.aiRouteExplanation;
    order.alternativeRoutes = aiRoute.alternativeRoutes;
    order.selectedRouteIndex = aiRoute.selectedRouteIndex;
  } catch (aiErr) {
    const alt1 = generateRouteNodes(order.restaurantLocation, order.deliveryLocation, 10, 0.002);
    const alt2 = generateRouteNodes(order.restaurantLocation, order.deliveryLocation, 10, -0.0025);
    const alt3 = generateRouteNodes(order.restaurantLocation, order.deliveryLocation, 10, 0.0045);
    order.routeNodes = alt1;
    order.trafficDelayMinutes = 2;
    order.aiOptimizedEta = "12 mins";
    order.aiRouteExplanation = "Local router estimated direct paths with light afternoon breeze delays.";
    order.alternativeRoutes = [
      { name: "⚡️ PingZo AI-Suggested (Fastest)", routeNodes: alt1, trafficDelayMinutes: 2, aiOptimizedEta: "12 mins", aiRouteExplanation: "Optimized route that bypasses active construction on 5th Street via direct alleyway connectors." },
      { name: "🛣️ Expressway Direct Corridor", routeNodes: alt2, trafficDelayMinutes: 8, aiOptimizedEta: "18 mins", aiRouteExplanation: "Primary highway corridor route. Shorter mileage but experiences peak-hour merging backlog." },
      { name: "🚴 E-Bike Eco-Alley", routeNodes: alt3, trafficDelayMinutes: 0, aiOptimizedEta: "21 mins", aiRouteExplanation: "Scenic flat route optimized for light electric vehicles, skipping major high-traffic junctions." }
    ];
    order.selectedRouteIndex = 0;
  }

  pushNotification("order", "Driver Reassigned", `Admin assigned ${driver.name} to deliver your order.`, true);
  res.json({ success: true, order });
});

// 10. Marketing alert push
app.post("/api/marketing/push", (req, res) => {
  const { title, body } = req.body;
  pushNotification("marketing", title, body);
  res.json({ success: true });
});

// AI Routing Optimization Core Function
async function getAIoptimizedRoute(restaurant: LatLng, customer: LatLng): Promise<{
  routeNodes: LatLng[];
  trafficDelayMinutes: number;
  aiOptimizedEta: string;
  aiRouteExplanation: string;
  alternativeRoutes: Array<{
    name: string;
    routeNodes: LatLng[];
    trafficDelayMinutes: number;
    aiOptimizedEta: string;
    aiRouteExplanation: string;
  }>;
  selectedRouteIndex: number;
}> {
  // Generate beautiful, highly separate alternative paths
  const alt1Nodes = generateRouteNodes(restaurant, customer, 10, 0.002);
  const alt2Nodes = generateRouteNodes(restaurant, customer, 10, -0.0025);
  const alt3Nodes = generateRouteNodes(restaurant, customer, 10, 0.0045);

  const localAlternatives = [
    {
      name: "⚡️ PingZo AI-Suggested (Fastest)",
      routeNodes: alt1Nodes,
      trafficDelayMinutes: 2,
      aiOptimizedEta: "12 mins",
      aiRouteExplanation: "Optimized route that bypasses active construction on 5th Street via direct alleyway connectors."
    },
    {
      name: "🛣️ Expressway Direct Corridor",
      routeNodes: alt2Nodes,
      trafficDelayMinutes: 8,
      aiOptimizedEta: "18 mins",
      aiRouteExplanation: "Primary highway corridor route. Shorter mileage but experiences peak-hour merging backlog near downtown."
    },
    {
      name: "🚴 E-Bike Eco-Alley",
      routeNodes: alt3Nodes,
      trafficDelayMinutes: 0,
      aiOptimizedEta: "21 mins",
      aiRouteExplanation: "Scenic flat route optimized for light electric vehicles, skipping major high-traffic junctions."
    }
  ];

  if (!ai) {
    return {
      routeNodes: alt1Nodes,
      trafficDelayMinutes: 2,
      aiOptimizedEta: "12 mins",
      aiRouteExplanation: "Optimized route that bypasses active construction on 5th Street via direct alleyway connectors.",
      alternativeRoutes: localAlternatives,
      selectedRouteIndex: 0
    };
  }

  const prompt = `
    You are PingZo's high-performance AI Routing Engine.
    Given a restaurant location at coordinate (${restaurant.lat}, ${restaurant.lng}) and a customer delivery location at coordinate (${customer.lat}, ${customer.lng}).
    
    We need you to optimize the path, predict traffic patterns, and provide THREE alternative routes.
    Output a strict JSON object structure:
    {
      "trafficDelayMinutes": number (estimated minutes of traffic latency),
      "aiOptimizedEta": string (like "12 mins"),
      "aiRouteExplanation": string (a short description for the fastest route),
      "alternativeRoutes": [
        {
          "name": "⚡️ PingZo AI-Suggested (Fastest)",
          "trafficDelayMinutes": 2,
          "aiOptimizedEta": "12 mins",
          "aiRouteExplanation": "description...",
          "routeWiggles": array of number pairs [[lat, lng], [lat, lng], ...] representing 8-10 coordinates
        },
        {
          "name": "🛣️ Expressway Direct Corridor",
          "trafficDelayMinutes": 8,
          "aiOptimizedEta": "18 mins",
          "aiRouteExplanation": "description...",
          "routeWiggles": array of number pairs
        },
        {
          "name": "🚴 E-Bike Eco-Alley",
          "trafficDelayMinutes": 0,
          "aiOptimizedEta": "21 mins",
          "aiRouteExplanation": "description...",
          "routeWiggles": array of number pairs
        }
      ]
    }
    Do NOT include markdown wrapping like \`\`\`json. Output ONLY the raw valid JSON string.
  `;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      attempts++;
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const cleanText = response.text ? response.text.trim() : "";
      const parsed = JSON.parse(cleanText);

      const alternativeRoutes = parsed.alternativeRoutes.map((alt: any, altIdx: number) => {
        const routeNodes: LatLng[] = [restaurant];
        if (Array.isArray(alt.routeWiggles)) {
          alt.routeWiggles.forEach((node: any) => {
            if (Array.isArray(node) && node.length === 2) {
              routeNodes.push({ lat: Number(node[0]), lng: Number(node[1]) });
            } else if (node && typeof node === 'object' && 'lat' in node && 'lng' in node) {
              routeNodes.push({ lat: Number(node.lat), lng: Number(node.lng) });
            }
          });
        }
        routeNodes.push(customer);

        const fallbackNodes = altIdx === 0 ? alt1Nodes : altIdx === 1 ? alt2Nodes : alt3Nodes;

        return {
          name: alt.name || localAlternatives[altIdx].name,
          routeNodes: routeNodes.length > 3 ? routeNodes : fallbackNodes,
          trafficDelayMinutes: alt.trafficDelayMinutes || localAlternatives[altIdx].trafficDelayMinutes,
          aiOptimizedEta: alt.aiOptimizedEta || localAlternatives[altIdx].aiOptimizedEta,
          aiRouteExplanation: alt.aiRouteExplanation || localAlternatives[altIdx].aiRouteExplanation
        };
      });

      return {
        routeNodes: alternativeRoutes[0].routeNodes,
        trafficDelayMinutes: alternativeRoutes[0].trafficDelayMinutes,
        aiOptimizedEta: alternativeRoutes[0].aiOptimizedEta,
        aiRouteExplanation: alternativeRoutes[0].aiRouteExplanation,
        alternativeRoutes,
        selectedRouteIndex: 0
      };
    } catch (err: any) {
      const errStr = JSON.stringify(err) || String(err);
      const isTemporary = 
        errStr.includes("503") || 
        errStr.includes("UNAVAILABLE") || 
        errStr.includes("demand") || 
        err?.status === 'UNAVAILABLE' ||
        errStr.includes("429") ||
        errStr.includes("RESOURCE_EXHAUSTED") ||
        err?.status === 'RESOURCE_EXHAUSTED';

      if (isTemporary && attempts < maxAttempts) {
        const isQuota = errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED");
        console.warn(`[Temporary] Gemini API ${isQuota ? "quota limit" : "high-demand"}. Retrying attempt ${attempts + 1}/${maxAttempts} after backoff...`);
        await new Promise(resolve => setTimeout(resolve, (isQuota ? 2000 : 800) * attempts));
        continue;
      }
      console.warn("Gemini route optimization temporary fallback used:", err instanceof Error ? err.message : errStr);
      break;
    }
  }

  return {
    routeNodes: alt1Nodes,
    trafficDelayMinutes: 2,
    aiOptimizedEta: "12 mins",
    aiRouteExplanation: "PingZo AI optimized routing through low-density local streets.",
    alternativeRoutes: localAlternatives,
    selectedRouteIndex: 0
  };
}

// Support Route optimization API exposed for client query
app.post("/api/ai/optimize-route", async (req, res) => {
  const { restaurant, customer } = req.body;
  if (!restaurant || !customer) {
    return res.status(400).json({ error: "restaurant and customer coordinates are required" });
  }

  try {
    const result = await getAIoptimizedRoute(restaurant, customer);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Select active route for an order
app.post("/api/order/select-route", (req, res) => {
  const { orderId, routeIndex } = req.body;
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  if (!order.alternativeRoutes || !order.alternativeRoutes[routeIndex]) {
    return res.status(400).json({ error: "Invalid route index" });
  }

  const selected = order.alternativeRoutes[routeIndex];
  order.selectedRouteIndex = routeIndex;
  order.routeNodes = selected.routeNodes;
  order.trafficDelayMinutes = selected.trafficDelayMinutes;
  order.aiOptimizedEta = selected.aiOptimizedEta;
  order.aiRouteExplanation = selected.aiRouteExplanation;

  pushNotification(
    "order", 
    "Delivery Route Optimized", 
    `Driver has switched to path: ${selected.name}. New ETA: ${selected.aiOptimizedEta}.`
  );

  res.json({ success: true, order });
});

// Driver registration and background check initiation
app.post("/api/driver/register", (req, res) => {
  const { name, phone, vehicle, plateNumber, avatar } = req.body;
  if (!name || !phone || !vehicle) {
    return res.status(400).json({ error: "Name, phone, and vehicle type are required." });
  }

  const id = `driver_${Date.now().toString().slice(-4)}`;
  const newDriver: Driver = {
    id,
    name,
    phone,
    vehicle,
    plateNumber: plateNumber || `PZ-${Math.floor(Math.random() * 9000) + 1000}`,
    avatar: avatar || `https://images.unsplash.com/photo-${[
      "1534528741775-53994a69daeb",
      "1507003211169-0a1dd7228f2d",
      "1494790108377-be9c29b29330",
      "1500648767791-00dcc994a43e"
    ][Math.floor(Math.random() * 4)]}?w=100&h=100&fit=crop`,
    status: "offline", // Must be offline initially
    currentLocation: { lat: 37.773, lng: -122.422 },
    rating: 5.0,
    isRegistered: true,
    backgroundStatus: "pending" // Under verification
  };

  drivers.push(newDriver);
  pushNotification("marketing", "Rider Application Received", `${name} has applied as a delivery partner and is awaiting fleet onboarding verification.`);
  res.json({ success: true, driver: newDriver });
});

// Admin approves a pending onboarding delivery driver
app.post("/api/admin/approve-driver", (req, res) => {
  const { driverId } = req.body;
  if (!driverId) {
    return res.status(400).json({ error: "driverId is required." });
  }

  const driver = drivers.find(d => d.id === driverId);
  if (!driver) {
    return res.status(404).json({ error: "Driver profile not found." });
  }

  driver.backgroundStatus = "approved";
  driver.status = "offline"; // approved, now they can toggle online!

  pushNotification("marketing", "Delivery Partner Onboarded 🚀", `Congratulations! ${driver.name} has been approved, background verified, and is ready for deliveries.`);
  res.json({ success: true, driver });
});

// Admin updates inventory item stock
app.post("/api/admin/update-stock", (req, res) => {
  const { itemId, quantity } = req.body;
  if (!itemId || quantity === undefined) {
    return res.status(400).json({ error: "itemId and quantity are required." });
  }

  inventory[itemId] = Math.max(0, parseInt(quantity, 10));
  pushNotification("promo", "Stock Handled", `Stock count for ${itemId} updated to ${inventory[itemId]} units.`);
  res.json({ success: true, inventory });
});

// ----------------- ADMIN COMPREHENSIVE CONTROL APIs -----------------

// Admin: Create driver partner directly
app.post("/api/admin/driver/create", (req, res) => {
  const { name, phone, vehicle, plateNumber, status, backgroundStatus, rating } = req.body;
  if (!name || !phone || !vehicle) {
    return res.status(400).json({ error: "Name, phone, and vehicle are required." });
  }

  const id = `driver_${Date.now().toString().slice(-4)}`;
  const newDriver: Driver = {
    id,
    name,
    phone,
    vehicle,
    plateNumber: plateNumber || `PZ-${Math.floor(Math.random() * 9000) + 1000}`,
    avatar: `https://images.unsplash.com/photo-${[
      "1534528741775-53994a69daeb",
      "1507003211169-0a1dd7228f2d",
      "1494790108377-be9c29b29330",
      "1500648767791-00dcc994a43e"
    ][Math.floor(Math.random() * 4)]}?w=100&h=100&fit=crop`,
    status: status || "offline",
    currentLocation: { lat: 37.773, lng: -122.422 },
    rating: Number(rating) || 5.0,
    isRegistered: true,
    backgroundStatus: backgroundStatus || "approved",
    completedDeliveries: 0
  };

  drivers.push(newDriver);
  pushNotification("marketing", "New Driver Onboarded", `Fleet Manager added a new partner: ${name} (${vehicle}).`);
  res.json({ success: true, driver: newDriver, drivers });
});

// Admin: Update driver partner details
app.post("/api/admin/driver/update", (req, res) => {
  const { id, name, phone, vehicle, plateNumber, status, backgroundStatus, rating, completedDeliveries } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Driver ID is required for update." });
  }

  const driver = drivers.find(d => d.id === id);
  if (!driver) {
    return res.status(444).json({ error: "Driver not found." });
  }

  if (name !== undefined) driver.name = name;
  if (phone !== undefined) driver.phone = phone;
  if (vehicle !== undefined) driver.vehicle = vehicle;
  if (plateNumber !== undefined) driver.plateNumber = plateNumber;
  if (status !== undefined) driver.status = status;
  if (backgroundStatus !== undefined) driver.backgroundStatus = backgroundStatus;
  if (rating !== undefined) driver.rating = Number(rating);
  if (completedDeliveries !== undefined) driver.completedDeliveries = Number(completedDeliveries);

  pushNotification("marketing", "Driver Updated", `Driver profile ${driver.name} was updated by Fleet Manager.`);
  res.json({ success: true, driver, drivers });
});

// Admin: Delete driver partner
app.post("/api/admin/driver/delete", (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Driver ID is required for deletion." });
  }

  const idx = drivers.findIndex(d => d.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Driver not found." });
  }

  const name = drivers[idx].name;
  drivers.splice(idx, 1);
  pushNotification("marketing", "Driver Profile Erased", `Partner ${name} was de-registered from the fleet active pool.`);
  res.json({ success: true, drivers });
});

// Admin: Create product / menu item dynamically
app.post("/api/admin/product/create", (req, res) => {
  const { name, price, oldPrice, weight, description, category, subCategory, image, stock } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: "Name, price, and category (food or grocery) are required." });
  }

  const id = `g_dyn_${Date.now().toString().slice(-4)}`;
  const newProduct: MenuItem = {
    id,
    name,
    price: Number(price),
    oldPrice: oldPrice ? Number(oldPrice) : undefined,
    weight: weight || "1 unit",
    description: description || "Freshly sourced high-quality organic item added by Store Admin.",
    category: category === "food" ? "food" : "grocery",
    subCategory: subCategory || "Organic Mix",
    image: image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&fit=crop"
  };

  menuItems.push(newProduct);
  inventory[id] = stock !== undefined ? Math.max(0, Number(stock)) : 20;

  pushNotification("promo", "New Product Added 🍎", `${name} has been added to ${category} Catalog under ${newProduct.subCategory}.`);
  res.json({ success: true, product: newProduct, menuItems, inventory });
});

// Admin: Update product / menu item
app.post("/api/admin/product/update", (req, res) => {
  const { id, name, price, oldPrice, weight, description, category, subCategory, image, stock } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Product ID is required for updates." });
  }

  const product = menuItems.find(m => m.id === id);
  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }

  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = Number(price);
  if (oldPrice !== undefined) product.oldPrice = oldPrice ? Number(oldPrice) : undefined;
  if (weight !== undefined) product.weight = weight;
  if (description !== undefined) product.description = description;
  if (category !== undefined) product.category = category === "food" ? "food" : "grocery";
  if (subCategory !== undefined) product.subCategory = subCategory;
  if (image !== undefined) product.image = image;
  if (stock !== undefined) {
    inventory[id] = Math.max(0, Number(stock));
  }

  pushNotification("promo", "Product Updated 🛒", `${product.name} product mapping and parameters updated.`);
  res.json({ success: true, product, menuItems, inventory });
});

// Admin: Delete product / menu item
app.post("/api/admin/product/delete", (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Product ID is required for deletion." });
  }

  const idx = menuItems.findIndex(m => m.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Product not found." });
  }

  const name = menuItems[idx].name;
  menuItems.splice(idx, 1);
  delete inventory[id];

  pushNotification("promo", "Product Removed", `${name} was deleted from store catalog and stock logs.`);
  res.json({ success: true, menuItems, inventory });
});

// Admin: Create Promotional Banner / Coupon
app.post("/api/admin/banner/create", (req, res) => {
  const { title, desc, bg, code, discountType, discountValue, minCartValue, comboItems, isActive } = req.body;
  if (!title || !desc || !code || !discountType) {
    return res.status(400).json({ error: "Title, desc, code, and discountType are required fields." });
  }

  const newBanner: PromoBanner = {
    id: `b_${Date.now()}`,
    title,
    desc,
    bg: bg || "from-orange-500 to-amber-500",
    code: code.trim().toUpperCase(),
    discountType,
    discountValue: Number(discountValue) || 0,
    minCartValue: Number(minCartValue) || 0,
    comboItems: Array.isArray(comboItems) ? comboItems : undefined,
    isActive: isActive !== false
  };

  banners.push(newBanner);
  pushNotification("promo", "Banner Campaign Created 🏷️", `New promo campaign "${title}" with code "${newBanner.code}" is now live!`);
  res.json({ success: true, banners });
});

// Admin: Update Promotional Banner / Coupon
app.post("/api/admin/banner/update", (req, res) => {
  const { id, title, desc, bg, code, discountType, discountValue, minCartValue, comboItems, isActive } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Banner ID is required." });
  }

  const banner = banners.find(b => b.id === id);
  if (!banner) {
    return res.status(404).json({ error: "Promo banner not found." });
  }

  if (title !== undefined) banner.title = title;
  if (desc !== undefined) banner.desc = desc;
  if (bg !== undefined) banner.bg = bg;
  if (code !== undefined) banner.code = code.trim().toUpperCase();
  if (discountType !== undefined) banner.discountType = discountType;
  if (discountValue !== undefined) banner.discountValue = Number(discountValue);
  if (minCartValue !== undefined) banner.minCartValue = Number(minCartValue);
  if (comboItems !== undefined) banner.comboItems = Array.isArray(comboItems) ? comboItems : undefined;
  if (isActive !== undefined) banner.isActive = !!isActive;

  pushNotification("promo", "Banner Campaign Updated ✏️", `Campaign "${banner.title}" parameters have been modified.`);
  res.json({ success: true, banners });
});

// Admin: Delete Promotional Banner / Coupon
app.post("/api/admin/banner/delete", (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Banner ID is required." });
  }

  const idx = banners.findIndex(b => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Promo banner not found." });
  }

  const title = banners[idx].title;
  banners.splice(idx, 1);

  pushNotification("promo", "Banner Campaign Ended 🛑", `Campaign "${title}" was successfully deleted and taken offline.`);
  res.json({ success: true, banners });
});

// Admin: Update GST Central and State Rates
app.post("/api/admin/gst/update", (req, res) => {
  const { cgstRate, sgstRate } = req.body;
  if (cgstRate === undefined || sgstRate === undefined) {
    return res.status(400).json({ error: "Both cgstRate and sgstRate are required." });
  }

  gstConfig.cgstRate = Math.max(0, Number(cgstRate));
  gstConfig.sgstRate = Math.max(0, Number(sgstRate));

  pushNotification("promo", "GST Rates Configured ⚖️", `Tax slabs updated. Central CGST: ${gstConfig.cgstRate}%, State SGST: ${gstConfig.sgstRate}%.`);
  res.json({ success: true, gstConfig });
});

// Mark messages of an order as read for the recipient
app.post("/api/chat/read", (req, res) => {
  const { orderId, reader } = req.body;
  if (!orderId || !reader) {
    return res.status(400).json({ error: "orderId and reader role are required" });
  }

  let updatedCount = 0;
  chats.forEach(msg => {
    if (msg.orderId === orderId && msg.sender !== reader && msg.status !== "read") {
      msg.status = "read";
      updatedCount++;
    }
  });

  res.json({ success: true, updatedCount });
});

// Confirm assignment by driver
app.post("/api/order/confirm-assignment", (req, res) => {
  const { orderId, driverId } = req.body;
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  if (order.driverId !== driverId) {
    return res.status(400).json({ error: "Order is not offered to this driver." });
  }

  order.assignmentConfirmed = true;
  order.status = OrderStatus.PREPARING;

  pushNotification("order", "Order Confirmed!", `Driver ${order.driverName} has accepted your order. Prep has started!`, true);

  res.json({ success: true, order });
});

// Reject assignment by driver (leads to automatic re-offer to next nearest driver)
app.post("/api/order/reject-assignment", async (req, res) => {
  const { orderId, driverId } = req.body;
  const order = orders.find(o => o.id === orderId);
  const driver = drivers.find(d => d.id === driverId);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (driver) {
    driver.status = "idle"; // Free up this driver
  }

  if (order.driverId === driverId) {
    order.driverId = undefined;
    order.driverName = undefined;
    order.driverPhone = undefined;
    order.driverLocation = undefined;
    order.status = OrderStatus.PENDING;
    order.assignmentConfirmed = false;
    
    if (!order.rejectedDriverIds) {
      order.rejectedDriverIds = [];
    }
    if (!order.rejectedDriverIds.includes(driverId)) {
      order.rejectedDriverIds.push(driverId);
    }

    pushNotification("order", "Finding new rider", "Rider declined the assignment. Finding another delivery partner near the store.", true);

    // Trigger auto-assignment queue to automatically try to find the next nearest driver!
    await runAutoAssignmentQueue();
  }

  const updatedOrder = orders.find(o => o.id === orderId) || order;
  res.json({ success: true, order: updatedOrder });
});

// Toggle driver online/offline status
app.post("/api/driver/toggle-online", async (req, res) => {
  const { driverId, online } = req.body;
  const driver = drivers.find(d => d.id === driverId);
  if (!driver) {
    return res.status(404).json({ error: "Driver not found" });
  }

  if (online) {
    driver.status = "idle";
    pushNotification("marketing", "Rider Online", `Driver ${driver.name} is now online and ready for deliveries.`);
    // Trigger auto-assignment queue immediately so they get assigned the nearest pending order
    await runAutoAssignmentQueue();
  } else {
    // If going offline, let's see if they have any unconfirmed orders
    const unconfirmedOrder = orders.find(o => o.driverId === driverId && !o.assignmentConfirmed);
    if (unconfirmedOrder) {
      unconfirmedOrder.driverId = undefined;
      unconfirmedOrder.driverName = undefined;
      unconfirmedOrder.driverPhone = undefined;
      unconfirmedOrder.driverLocation = undefined;
      unconfirmedOrder.status = OrderStatus.PENDING;
      unconfirmedOrder.assignmentConfirmed = false;
      if (!unconfirmedOrder.rejectedDriverIds) {
        unconfirmedOrder.rejectedDriverIds = [];
      }
      unconfirmedOrder.rejectedDriverIds.push(driverId);
    }
    
    driver.status = "offline";
    pushNotification("marketing", "Rider Offline", `Driver ${driver.name} went offline.`);

    // If we reverted an unconfirmed order, re-run queue for it
    await runAutoAssignmentQueue();
  }

  res.json({ success: true, driver });
});

// Setup Vite integration
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PingZo Engine] Running server on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
