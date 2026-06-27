/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import FruitLoader from "./FruitLoader.js";
import { 
  ShoppingBag, Trash2, CreditCard, ChevronRight, ChevronLeft, CheckCircle2, AlertTriangle, 
  XCircle, Phone, MessageSquare, Star, HelpCircle, FileText, Send, X, Play, Volume2, Sparkles, MapPin, Tag,
  User, BookOpen, Mail, ShieldCheck, Check, Upload, ArrowRight, History, Clock, Home, Bike, Activity, Navigation, BellRing, Zap
} from "lucide-react";
import { AppState, Order, OrderStatus, MenuItem, LatLng, PromoBanner, NotificationLog } from "../types.js";
import SimulatedMap from "./SimulatedMap.js";

interface CustomerProfile {
  name: string;
  phone: string;
  email: string;
  dietPref: string;
  address: string;
  latLng: LatLng;
}

const getRemainingMinutes = (order: Order) => {
  if (!order.routeNodes || order.routeNodes.length === 0 || !order.driverLocation) {
    const parsed = parseInt(order.aiOptimizedEta || "15");
    return isNaN(parsed) ? 15 : parsed;
  }
  
  let minDistance = Infinity;
  let closestIndex = 0;
  for (let i = 0; i < order.routeNodes.length; i++) {
    const node = order.routeNodes[i];
    const dist = Math.sqrt(
      Math.pow(node.lat - order.driverLocation.lat, 2) +
      Math.pow(node.lng - order.driverLocation.lng, 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closestIndex = i;
    }
  }
  
  const totalEtaMinutes = parseInt(order.aiOptimizedEta || "12");
  const baseMinutes = isNaN(totalEtaMinutes) ? 12 : totalEtaMinutes;
  
  if (closestIndex >= order.routeNodes.length - 1) {
    return 1;
  }
  
  const remainingRatio = 1 - (closestIndex / (order.routeNodes.length - 1));
  const remainingMinutes = Math.max(1, Math.ceil(remainingRatio * baseMinutes));
  return remainingMinutes;
};

const getDriverProgressPercentage = (order: Order) => {
  if (!order.routeNodes || order.routeNodes.length === 0 || !order.driverLocation) {
    if (order.status === OrderStatus.DELIVERED) return 100;
    if (order.status === OrderStatus.NEARBY) return 90;
    if (order.status === OrderStatus.OUT_FOR_DELIVERY) return 40;
    return 0;
  }
  
  if (order.status === OrderStatus.DELIVERED) return 100;

  let minDistance = Infinity;
  let closestIndex = 0;
  for (let i = 0; i < order.routeNodes.length; i++) {
    const node = order.routeNodes[i];
    const dist = Math.sqrt(
      Math.pow(node.lat - order.driverLocation.lat, 2) +
      Math.pow(node.lng - order.driverLocation.lng, 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closestIndex = i;
    }
  }

  const percentage = Math.round((closestIndex / (order.routeNodes.length - 1)) * 100);
  return Math.min(98, Math.max(2, percentage));
};

interface CustomerAppProps {
  state: AppState;
  onRefresh: () => void;
  activeDeviceType: "ios" | "android";
}

function CustomerOnboarding({ onComplete }: { onComplete: (profile: CustomerProfile) => void }) {
  const [step, setStep] = useState(0); // 0: Tutorial, 1: Signup Options, 2: Form Details, 3: Map Pin
  const [tutorialIndex, setTutorialIndex] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("sathishkhan27@gmail.com"); // Prefilled!
  const [phone, setPhone] = useState("+1 (555) 789-1234");
  const [dietPref, setDietPref] = useState("None");
  const [address, setAddress] = useState("789 Mission St, San Francisco, CA");
  const [latLng, setLatLng] = useState<LatLng>({ lat: 37.7812, lng: -122.4154 });

  const handleFinishOnboarding = () => {
    onComplete({ name, phone, email, dietPref, address, latLng });
  };

  const tutorials = [
    {
      title: "⚡️ 10-Minute Dark-Store Deliveries",
      desc: "Super fresh groceries and hot culinary dishes sourced locally and delivered directly to your doorstep in 10-15 minutes.",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=240&fit=crop"
    },
    {
      title: "🔮 Gemini-Powered Smart Logistics",
      desc: "Our neural routing engine scans real-time traffic gridlock, predicting and calculating efficient blockage bypass options.",
      image: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=400&h=240&fit=crop"
    },
    {
      title: "🔒 Automated Reversal Settlements",
      desc: "Change your mind? Cancel active preparation instantly and our payment gateway automatically processes instant credit reversals.",
      image: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=400&h=240&fit=crop"
    }
  ];

  const handleNextTutorial = () => {
    if (tutorialIndex < tutorials.length - 1) {
      setTutorialIndex(prev => prev + 1);
    } else {
      setStep(1);
    }
  };

  const handleSocialSignup = (provider: "google" | "apple") => {
    if (provider === "google") {
      setName("Sathish Khan");
      setEmail("sathishkhan27@gmail.com");
    } else {
      setName("Sathish Apple User");
      setEmail("sathishkhan27@icloud.com");
    }
    setStep(2);
  };

  return (
    <div className="flex flex-col h-full bg-white text-slate-800 font-sans select-none relative overflow-y-auto">
      {/* Top Welcome Header */}
      <div className="bg-white border-b border-slate-100 p-4 shrink-0 flex items-center justify-between shadow-xs pt-6">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-orange-600 rounded-full" />
          <h2 className="text-sm font-black tracking-tight text-slate-900 uppercase">PingZo Onboarding</h2>
        </div>
        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full font-mono">STEP {step + 1}/4</span>
      </div>

      <div className="flex-1 p-5 flex flex-col justify-between space-y-6">
        {/* Step 0: Slide Tutorials */}
        {step === 0 && (
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-4 text-center">
              <div className="h-44 rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative">
                <img 
                  src={tutorials[tutorialIndex].image} 
                  alt={tutorials[tutorialIndex].title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{tutorials[tutorialIndex].title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed px-2">{tutorials[tutorialIndex].desc}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Indicator dots */}
              <div className="flex justify-center gap-1.5">
                {tutorials.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === tutorialIndex ? "w-6 bg-orange-600" : "w-1.5 bg-slate-200"}`} 
                  />
                ))}
              </div>

              <button 
                onClick={handleNextTutorial}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Signup Provider screen */}
        {step === 1 && (
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-2 border border-orange-100">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Secure Sign In</h3>
              <p className="text-xs text-slate-400">Join PingZo to access instant food & grocery hubs.</p>
            </div>

            <div className="space-y-2.5">
              <button 
                onClick={() => handleSocialSignup("google")}
                className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.66 0 3.12.57 4.28 1.69l3.11-3.11C17.51 1.93 14.96 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.6 2.8C6.01 7.24 8.79 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.6 2.8c2.1-1.94 3.83-5.17 3.83-8.53z" />
                  <path fill="#FBBC05" d="M5.1 14.7c-.24-.7-.38-1.45-.38-2.2s.14-1.5.38-2.2L1.5 7.5C.54 9.4 0 11.6 0 14s.54 4.6 1.5 6.5l3.6-2.8z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.6-2.8c-1.1.74-2.51 1.18-4.36 1.18-3.21 0-5.99-2.2-6.9-5.26l-3.6 2.8C3.39 20.35 7.35 23 12 23z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button 
                onClick={() => handleSocialSignup("apple")}
                className="w-full py-3 bg-black hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z" />
                </svg>
                <span>Continue with Apple</span>
              </button>

              <div className="relative py-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                <span className="relative bg-white px-2.5 text-[9px] font-bold text-slate-400 uppercase">Or Email Registration</span>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full py-3 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4 text-slate-500" />
                <span>Create with Email</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Form Details screen */}
        {step === 2 && (
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="text-left space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">Profile Creation</h3>
                <p className="text-xs text-slate-400">Complete your profile to customize dietary selections.</p>
              </div>

              <div className="space-y-2.5 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Phone Number</label>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Dietary Preferences</label>
                  <select 
                    value={dietPref} 
                    onChange={(e) => setDietPref(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
                  >
                    <option value="None">None (All food options)</option>
                    <option value="Vegetarian Only">🥦 Vegetarian Only</option>
                    <option value="Vegan Only">🌿 Vegan Only</option>
                    <option value="Organic Enthusiast">🥑 Organic Enthusiast</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                if (!name.trim()) return alert("Name is required");
                if (!phone.trim()) return alert("Phone is required");
                setStep(3);
              }}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>Set Delivery Location</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 3: Map Pin Setup screen */}
        {step === 3 && (
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-2 text-left">
              <h3 className="text-base font-extrabold text-slate-900">Pin Delivery Spot</h3>
              <p className="text-xs text-slate-400">Tap on the live simulation map to set your default shipping destination.</p>
              
              <div className="h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
                <SimulatedMap 
                  customerLocation={latLng}
                  restaurantLocation={{ lat: 37.7765, lng: -122.4102 }}
                  driverLocation={{ lat: 37.773, lng: -122.422 }}
                  routeNodes={[]}
                  interactive={true}
                  height="h-full"
                />
                <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] px-2 py-1 rounded font-bold font-mono">
                  TAP MAP TO RE-PIN
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Delivery Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-orange-600" />
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter delivery address"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleFinishOnboarding}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Complete Setup & Start Shopping</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const MENU_ITEMS: MenuItem[] = [
  // Food (Available for the future)
  { id: "m_1", name: "Premium Truffle Burger", price: 299, oldPrice: 399, weight: "1 pc", description: "Aged beef patty, black truffle aioli, wild mushrooms, swiss cheese.", category: "food", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&fit=crop", gstRate: 5 },
  { id: "m_2", name: "Neapolitan Burrata Pizza", price: 399, oldPrice: 499, weight: "1 pc", description: "San Marzano tomatoes, fresh burrata, aromatic basil, cold-pressed olive oil.", category: "food", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&fit=crop", gstRate: 5 },
  { id: "m_3", name: "Spicy Salmon Crunch Roll", price: 499, oldPrice: 599, weight: "8 pcs", description: "8 pieces of sushi grade salmon, dynamic crunch crisp, spicy sriracha glaze.", category: "food", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&fit=crop", gstRate: 5 },
  
  // Grocery - Vegetables (Exempt / 0% GST)
  { id: "g_veg_1", name: "Coriander Leaves (Kothtmilli)", price: 10, oldPrice: 21, weight: "80 - 100 g", description: "Freshly cut, highly aromatic coriander leaves, perfect for garnishing.", category: "grocery", subCategory: "Vegetables", image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&fit=crop", gstRate: 0 },
  { id: "g_veg_2", name: "Tomato Local (Naattu Thakkali)", price: 19, oldPrice: 55, weight: "500 g", description: "Vine-ripened, sour-sweet local tomatoes, farm-sourced.", category: "grocery", subCategory: "Vegetables", image: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&fit=crop", gstRate: 0 },
  { id: "g_veg_3", name: "Onion (Vengayam)", price: 36, oldPrice: 86, weight: "900 g - 1 kg", description: "High-quality pink onions, essential daily vegetable.", category: "grocery", subCategory: "Vegetables", image: "https://images.unsplash.com/photo-1508747705-3df207a84c6f?w=400&fit=crop", gstRate: 0 },
  { id: "g_veg_4", name: "Mint Leaves (Pudhina)", price: 11, oldPrice: 21, weight: "100 g", description: "Zesty green mint leaves, ideal for chutneys and coolers.", category: "grocery", subCategory: "Vegetables", image: "https://images.unsplash.com/photo-1515252814826-6a84f3316279?w=400&fit=crop", gstRate: 0 },
  { id: "g_veg_5", name: "Sweet Orange Carrots", price: 39, oldPrice: 65, weight: "1 kg", description: "Crispy, sweet orange carrots, packed with Vitamin A.", category: "grocery", subCategory: "Vegetables", image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&fit=crop", gstRate: 0 },
  
  // Grocery - Fruits (Exempt / 0% GST)
  { id: "g_fr_1", name: "Fresh Banana (Robusta)", price: 49, oldPrice: 80, weight: "1 kg (5-6 pcs)", description: "Premium Robusta yellow bananas, high in energy.", category: "grocery", subCategory: "Fruits", image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&fit=crop", gstRate: 0 },
  { id: "g_fr_2", name: "Shimla Red Apples", price: 149, oldPrice: 220, weight: "4 pcs (approx. 500-600g)", description: "Crisp and juicy sweet red apples from Himachal.", category: "grocery", subCategory: "Fruits", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&fit=crop", gstRate: 0 },
  { id: "g_fr_3", name: "Sweet Papaya", price: 39, oldPrice: 65, weight: "1 pc (approx. 800g)", description: "Naturally sweet and healthy semi-ripe papaya.", category: "grocery", subCategory: "Fruits", image: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&fit=crop", gstRate: 0 },

  // Grocery - Blockbuster Deals / Pantry (Varied GST)
  { id: "g_deal_1", name: "Bellavita CEO Man Perfume", price: 485, oldPrice: 899, weight: "1 pc (100 ml)", description: "Aromatic luxury perfume with long lasting masculine fragrance notes.", category: "grocery", subCategory: "Pantry", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&fit=crop", gstRate: 18 },
  { id: "g_deal_2", name: "Plum Green Tea Face Wash", price: 145, oldPrice: 199, weight: "1 pc (50 ml)", description: "Gentle soap-free foaming gel face wash, rich in antioxidant green tea extracts.", category: "grocery", subCategory: "Pantry", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&fit=crop", gstRate: 18 },
  { id: "g_deal_3", name: "Special Atta Premium Pack", price: 84, oldPrice: 97.2, weight: "1 pack (45 pcs)", description: "Finely milled whole wheat chapatis mix for everyday cooking.", category: "grocery", subCategory: "Pantry", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&fit=crop", gstRate: 5 }
];

export default function CustomerApp({ state, onRefresh, activeDeviceType }: CustomerAppProps) {
  const currentMenuItems = state.menuItems && state.menuItems.length > 0 ? state.menuItems : MENU_ITEMS;
  
  // Load customer profile from local storage
  const [profile, setProfile] = useState<CustomerProfile | null>(() => {
    try {
      const saved = localStorage.getItem("pz_customer_profile");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Navigation & Category states
  const [activeTab, setActiveTab] = useState<"browse" | "cart" | "tracking" | "support" | "history" | "profile">("browse");
  
  // Dynamic Categories from API
  const availableCategories = Array.from(new Set(currentMenuItems.map(m => m.category === "food" ? "Food" : "Fresh")));
  const [mainTab, setMainTab] = useState<string>("Fresh");
  
  const [foodCategory, setFoodCategory] = useState<"food" | "grocery">("grocery");
  
  // Dynamic Subcategories for current category
  const availableSubCategories = Array.from(new Set(currentMenuItems
    .filter(m => (mainTab === "Food" ? m.category === "food" : m.category === "grocery"))
    .map(m => m.subCategory || "General")
  ));
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("All");

  // New states for splash, map overlay, search, and nested profile subviews
  const [searchQuery, setSearchQuery] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const [showMapSelectionPage, setShowMapSelectionPage] = useState(false);
  const [profileSubView, setProfileSubView] = useState<"none" | "orders" | "help" | "notifications">("none");

  // New States for expanded Profile, Orders, and Help
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile?.name || "");
  const [editPhone, setEditPhone] = useState(profile?.phone || "");
  const [editEmail, setEditEmail] = useState(profile?.email || "");
  const [editDiet, setEditDiet] = useState(profile?.dietPref || "None");

  useEffect(() => {
    if (profile) {
      setEditName(profile.name);
      setEditPhone(profile.phone);
      setEditEmail(profile.email);
      setEditDiet(profile.dietPref || "None");
    }
  }, [profile]);

  const handleSaveProfile = () => {
    if (!profile) return;
    const updated: CustomerProfile = {
      ...profile,
      name: editName,
      phone: editPhone,
      email: editEmail,
      dietPref: editDiet,
    };
    localStorage.setItem("pz_customer_profile", JSON.stringify(updated));
    setProfile(updated);
    setIsEditingProfile(false);
  };
  
  // Cart
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  
  // Custom Address selection
  const [selectedLatLng, setSelectedLatLng] = useState<LatLng>(profile ? profile.latLng : { lat: 37.7812, lng: -122.4154 });
  const [deliveryAddress, setDeliveryAddress] = useState(profile ? profile.address : "456 Market St, San Francisco, CA");
  
  // Checkout & Secure Payment Gateway simulation
  const [checkoutStep, setCheckoutStep] = useState<"cart_review" | "payment" | "processing" | "success">("cart_review");
  const [cardName, setCardName] = useState(profile ? profile.name : "Jane Doe");
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("321");
  const [paymentTx, setPaymentTx] = useState("");

  // Rating & Review popup
  const [showRatingId, setShowRatingId] = useState<string | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState("");

  // Support Chat
  const [chatInput, setChatInput] = useState("");
  const [supportMessages, setSupportMessages] = useState<Array<{ sender: "user" | "bot", text: string, time: string }>>([
    { sender: "bot", text: "Hello! I am PingZo's AI Assistant. How can I help you with your order, refund, or routing today?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);

  // Driver chat
  const [driverChatText, setDriverChatText] = useState("");

  // Promo Banner Carousel
  const [promoIndex, setPromoIndex] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  // Coupon states
  const [enteredPromo, setEnteredPromo] = useState("");
  const [activePromo, setActivePromo] = useState<string | null>(null);
  const [promoMsg, setPromoMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [showCouponsPage, setShowCouponsPage] = useState(false);
  const [promoFilterCode, setPromoFilterCode] = useState<string | null>(null);

  // Auto live driver simulation state
  const [trackingNodeIndex, setTrackingNodeIndex] = useState<number>(0);
  const [simulatedOrderId, setSimulatedOrderId] = useState<string | null>(null);

  const promos = (state.banners && state.banners.length > 0
    ? state.banners.filter(b => b.isActive)
    : [
        { id: "b_1", title: "⚡️ WEEKEND BLITZ", desc: "Get ₹50 Off on orders above ₹199 with code PINGZO50", bg: "from-amber-500 to-rose-600", code: "PINGZO50", discountType: "flat_amount", discountValue: 50, minCartValue: 199, isActive: true, comboItems: [] },
        { id: "b_2", title: "🥑 ORGANIC FESTIVAL", desc: "Free delivery on all groceries above ₹150! Code: FREESHIP", bg: "from-emerald-500 to-cyan-600", code: "FREESHIP", discountType: "flat_amount", discountValue: 39, minCartValue: 150, isActive: true, comboItems: [] }
      ]) as PromoBanner[];

  // Splash screen transition timer (2 seconds)
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    if (promos.length === 0) return;
    const timer = setInterval(() => {
      setPromoIndex(prev => (prev + 1) % promos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [promos.length]);

  // Sound effects
  const playNotificationSound = () => {
    try {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => console.warn("Audio play blocked:", e));
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  // Tracking for visual toast
  const [showToast, setShowToast] = useState(false);
  const [activeToastNotif, setActiveToastNotif] = useState<NotificationLog | null>(null);
  const [lastNotifId, setLastNotifId] = useState<string | null>(state.notifications[0]?.id || null);

  useEffect(() => {
    const latestNotif = state.notifications[0];
    if (latestNotif && latestNotif.id !== lastNotifId) {
      setLastNotifId(latestNotif.id);
      
      // Always show visual toast for new notifications
      setActiveToastNotif(latestNotif);
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 5000);

      // Only play sound if requested
      if (latestNotif.playSound) {
        playNotificationSound();
      }

      return () => clearTimeout(timer);
    }
  }, [state.notifications, lastNotifId]);

  // Sync state & handle delivered pops
  const activeOrders = state.orders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED);
  const latestOrder = activeOrders[0] || state.orders[0]; // Track latest active order preferred, fallback to absolute latest
  const showActiveTracking = latestOrder && latestOrder.status !== OrderStatus.DELIVERED && latestOrder.status !== OrderStatus.CANCELLED;
  const activeDriver = latestOrder ? state.drivers.find(d => d.id === latestOrder.driverId) : null;
  const trackingProgressPct = latestOrder ? getDriverProgressPercentage(latestOrder) : 0;
  const trackingRemainingMins = latestOrder ? getRemainingMinutes(latestOrder) : 0;

  // Sync and mark driver chat messages as read on view
  useEffect(() => {
    if (activeTab === "tracking" && latestOrder) {
      fetch("/api/chat/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: latestOrder.id, reader: "customer" })
      }).then(() => onRefresh()).catch(err => console.error("Chat read receipt error:", err));
    }
  }, [activeTab, state.chats.length, latestOrder?.id]);

  // Auto-reset simulated index on new orders
  useEffect(() => {
    if (latestOrder) {
      if (simulatedOrderId !== latestOrder.id) {
        setSimulatedOrderId(latestOrder.id);
        setTrackingNodeIndex(0);
      }
    } else {
      setSimulatedOrderId(null);
      setTrackingNodeIndex(0);
    }
  }, [latestOrder, simulatedOrderId]);

  // Periodic driver movement simulation on the client side
  useEffect(() => {
    if (!latestOrder || !latestOrder.driverId || !latestOrder.routeNodes || latestOrder.routeNodes.length === 0) return;
    
    // Only simulate if the order is in an active tracking status
    const activeStatuses = [OrderStatus.ASSIGNED, OrderStatus.PREPARING, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.NEARBY];
    if (!activeStatuses.includes(latestOrder.status)) return;

    const interval = setInterval(async () => {
      const nodes = latestOrder.routeNodes || [];
      if (trackingNodeIndex < nodes.length) {
        const currentNode = nodes[trackingNodeIndex];
        
        let targetStatus = latestOrder.status;
        if (trackingNodeIndex === 0) {
          targetStatus = OrderStatus.PREPARING;
        } else if (trackingNodeIndex === 1) {
          targetStatus = OrderStatus.OUT_FOR_DELIVERY;
        } else if (trackingNodeIndex === nodes.length - 2) {
          targetStatus = OrderStatus.NEARBY;
        } else if (trackingNodeIndex === nodes.length - 1) {
          targetStatus = OrderStatus.DELIVERED;
        }

        try {
          await fetch("/api/driver/update-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              driverId: latestOrder.driverId,
              orderId: latestOrder.id,
              status: targetStatus,
              lat: currentNode.lat,
              lng: currentNode.lng
            })
          });
          setTrackingNodeIndex(prev => prev + 1);
          onRefresh();
        } catch (err) {
          console.error("Auto tracking simulation error:", err);
        }
      }
    }, 4000); // Progress along nodes every 4 seconds

    return () => clearInterval(interval);
  }, [latestOrder?.id, latestOrder?.status, trackingNodeIndex, latestOrder?.driverId, latestOrder?.routeNodes, onRefresh]);

  // Polling backend for state refresh when tracking is active
  useEffect(() => {
    if (!showActiveTracking) return;
    const interval = setInterval(() => {
      onRefresh();
    }, 3000);
    return () => clearInterval(interval);
  }, [showActiveTracking, onRefresh]);

  const handleSendQuickReply = async (text: string) => {
    if (!latestOrder) return;
    try {
      await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: latestOrder.id,
          sender: "customer",
          text
        })
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const getItemStock = (id: string) => {
    if (state.inventory && state.inventory[id] !== undefined) {
      return state.inventory[id];
    }
    return 99;
  };

  const addToCart = (id: string) => {
    const stock = getItemStock(id);
    const currentQty = cart[id] || 0;
    if (currentQty >= stock) {
      alert(`Insufficient stock. Only ${stock} units are left in the store.`);
      return;
    }
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    if (!cart[id]) return;
    setCart(prev => {
      const copy = { ...prev };
      if (copy[id] === 1) {
        delete copy[id];
      } else {
        copy[id] -= 1;
      }
      return copy;
    });
  };

  const cartItemsCount = Object.keys(cart).reduce((sum, id) => sum + (cart[id] || 0), 0);
  const cartSubtotal = Object.keys(cart).reduce((sum, id) => {
    const item = currentMenuItems.find(m => m.id === id);
    const qty = Number(cart[id]) || 0;
    return sum + (item ? item.price * qty : 0);
  }, 0);
  const deliveryFee = cartSubtotal >= 100 ? 0 : (cartSubtotal > 0 ? 39 : 0);
  
  // Dynamic Central and State GST logic
  const cgstRate = state.gstConfig?.cgstRate ?? 2.5;
  const sgstRate = state.gstConfig?.sgstRate ?? 2.5;

  let appliedPromoDiscount = 0;
  const activePromoDetail = promos.find(p => p.code === activePromo);

  // Discount applies only on orders above ₹100
  if (activePromoDetail && cartSubtotal >= 100) {
    const isMinValMet = cartSubtotal >= (activePromoDetail.minCartValue || 0);
    if (isMinValMet) {
      if (activePromoDetail.discountType === "flat_amount") {
        appliedPromoDiscount = activePromoDetail.discountValue;
      } else if (activePromoDetail.discountType === "flat_percentage") {
        appliedPromoDiscount = Math.round((cartSubtotal * activePromoDetail.discountValue) / 100);
      } else if (activePromoDetail.discountType === "combo") {
        const comboIds = activePromoDetail.comboItems || [];
        const hasAllComboItems = comboIds.length > 0 && comboIds.every(id => cart[id] && cart[id] > 0);
        if (hasAllComboItems) {
          appliedPromoDiscount = activePromoDetail.discountValue;
        }
      }
    }
  }

  // Cap discount to subtotal
  appliedPromoDiscount = Math.min(appliedPromoDiscount, cartSubtotal);

  // Per-item GST calculation logic for Indian GST (CGST + SGST)
  // GST is calculated on the discounted value of each item proportionally
  const discountRatio = cartSubtotal > 0 ? (cartSubtotal - appliedPromoDiscount) / cartSubtotal : 0;

  let totalCgst = 0;
  let totalSgst = 0;

  Object.keys(cart).forEach(id => {
    const item = currentMenuItems.find(m => m.id === id);
    if (!item) return;
    const qty = cart[id] || 0;
    const itemSubtotal = item.price * qty;
    const discountedItemSubtotal = itemSubtotal * discountRatio;
    
    // Indian GST is usually split 50/50 between CGST and SGST
    const itemGstRate = item.gstRate ?? 5; // Default 5% if not specified
    const itemTotalGstPercent = itemGstRate / 100;
    const itemTotalGstAmount = discountedItemSubtotal * itemTotalGstPercent;
    
    totalCgst += itemTotalGstAmount / 2;
    totalSgst += itemTotalGstAmount / 2;
  });

  const cgstAmount = totalCgst;
  const sgstAmount = totalSgst;
  const totalGstAmount = cgstAmount + sgstAmount;
  const subtotalAfterDiscount = Math.max(0, cartSubtotal - appliedPromoDiscount);

  const cartTotal = Math.max(0, subtotalAfterDiscount + deliveryFee + totalGstAmount);

  const getMatchedPromoItems = () => {
    if (!promoFilterCode) return currentMenuItems;
    const cp = promos.find(p => p.code === promoFilterCode);
    if (!cp) return currentMenuItems;
    if (cp.discountType === "combo") {
      const comboIds = cp.comboItems || [];
      return currentMenuItems.filter(m => comboIds.includes(m.id));
    }
    const matched = currentMenuItems.filter(m => m.price >= cp.minCartValue);
    if (matched.length > 0) return matched;
    // Fallback: items that are >= 100 to meet the GST & ₹100 rule
    return currentMenuItems.filter(m => m.price >= 100);
  };

  const handleApplyPromo = (codeToApply?: string) => {
    const code = (codeToApply || enteredPromo).trim().toUpperCase();
    if (!code) return;

    if (cartSubtotal < 100) {
      setPromoMsg({ text: "Coupon discounts are only applicable on orders above ₹100", isError: true });
      return;
    }

    const foundPromo = promos.find(p => p.code === code);
    if (!foundPromo) {
      setPromoMsg({ text: "Invalid coupon code", isError: true });
      return;
    }

    if (cartSubtotal < foundPromo.minCartValue) {
      setPromoMsg({ 
        text: `Code ${foundPromo.code} is valid on orders above ₹${foundPromo.minCartValue}`, 
        isError: true 
      });
      return;
    }

    if (foundPromo.discountType === "combo") {
      const comboIds = foundPromo.comboItems || [];
      const hasAllComboItems = comboIds.every(id => cart[id] && cart[id] > 0);
      if (!hasAllComboItems) {
        const missingNames = comboIds
          .filter(id => !cart[id])
          .map(id => currentMenuItems.find(m => m.id === id)?.name || id)
          .join(" & ");
        setPromoMsg({ 
          text: `Add ${missingNames} to your cart to unlock this combo offer!`, 
          isError: true 
        });
        return;
      }
    }

    setActivePromo(foundPromo.code);
    let successMsg = `Promo ${foundPromo.code} applied! `;
    if (foundPromo.discountType === "flat_amount") {
      successMsg += `₹${foundPromo.discountValue} OFF`;
    } else if (foundPromo.discountType === "flat_percentage") {
      successMsg += `${foundPromo.discountValue}% OFF`;
    } else {
      successMsg += `Combo Discount ₹${foundPromo.discountValue} applied!`;
    }
    setPromoMsg({ text: successMsg, isError: false });
  };

  const handleRemovePromo = () => {
    setActivePromo(null);
    setEnteredPromo("");
    setPromoMsg(null);
  };

  // Checkout process trigger
  const handlePlaceOrder = async () => {
    setCheckoutStep("processing");
    
    // Simulate payment gateway handshakes
    setTimeout(async () => {
      const orderData = {
        customerName: profile?.name || "Jane Doe",
        customerPhone: profile?.phone || "+1 (555) 789-1234",
        deliveryLocation: selectedLatLng,
        deliveryAddress: deliveryAddress,
        restaurantName: foodCategory === "food" ? "The Gourmet Burger Hub" : "Soma Organic Grocers",
        restaurantLocation: foodCategory === "food" ? { lat: 37.7765, lng: -122.4102 } : { lat: 37.7712, lng: -122.4205 },
        items: Object.entries(cart).map(([id, qty]) => ({
          menuItem: currentMenuItems.find(m => m.id === id)!,
          quantity: qty
        })),
        totalPrice: cartTotal,
        cgstRate,
        sgstRate,
        cgstAmount,
        sgstAmount,
        discountAmount: appliedPromoDiscount,
        appliedPromo: activePromo || undefined,
        payment: {
          cardNumber: `**** **** **** ${cardNumber.slice(-4)}`,
          cardName: cardName
        }
      };

      try {
        const res = await fetch("/api/order/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData)
        });
        const parsed = await res.json();
        setPaymentTx(parsed.order?.payment?.transactionId || "tx_sim_991823");
        setCheckoutStep("success");
        setCart({});
        onRefresh();
      } catch (err) {
        setCheckoutStep("cart_review");
        alert("Payment Gateway timed out. Please try again.");
      }
    }, 1800);
  };

  // Automated Cancel Order with instant refund reversal
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to cancel this order? It will trigger an instant automated refund.")) return;
    try {
      const res = await fetch("/api/order/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (res.ok) {
        onRefresh();
      } else {
        alert(data.error || "Failed to cancel order. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please check your connection.");
    }
  };

  // Submit Rating Feedback
  const handleRateOrder = async () => {
    if (!showRatingId) return;
    try {
      await fetch("/api/order/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: showRatingId,
          rating: ratingStars,
          feedback: ratingComment
        })
      });
      setShowRatingId(null);
      setRatingStars(5);
      setRatingComment("");
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Customer Chat with Driver
  const handleSendDriverChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverChatText.trim() || !latestOrder) return;

    try {
      await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: latestOrder.id,
          sender: "customer",
          text: driverChatText
        })
      });
      setDriverChatText("");
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Help Section support chatbot simulation
  const handleSendSupportChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSupportMessages(prev => [...prev, { sender: "user", text: userMsg, time: timeNow }]);
    setChatInput("");

    // AI Troubleshooting Response Engine
    setTimeout(() => {
      let botResponse = "I have received your query. Our operations manager is looking into your account status.";
      const lower = userMsg.toLowerCase();

      if (lower.includes("cancel") || lower.includes("refund")) {
        botResponse = "If your order has not been picked up yet, you can cancel it instantly in the 'Tracking' screen for a 100% instant refund through our secure payment gateway.";
      } else if (lower.includes("delay") || lower.includes("where") || lower.includes("driver")) {
        botResponse = latestOrder && latestOrder.status !== OrderStatus.DELIVERED
          ? `Your order status is currently "${latestOrder.status}". Our AI Routing Engine predicts an ETA of ${latestOrder.aiOptimizedEta || '15 mins'} due to ${latestOrder.trafficDelayMinutes || 3} mins traffic delay.`
          : "You don't have any active delivery in progress right now. You can order fresh food or groceries in the main tab!";
      } else if (lower.includes("payment") || lower.includes("card")) {
        botResponse = "PingZo uses encrypted tokenization to execute transactions. We support instant reversals on cancellations with direct notifications.";
      } else if (lower.includes("routing") || lower.includes("ai")) {
        botResponse = "PingZo utilizes Gemini models to calculate real-time route nodes, predicting local congestion patterns to offer the fastest delivery routes.";
      }

      setSupportMessages(prev => [...prev, { sender: "bot", text: botResponse, time: timeNow }]);
    }, 1000);
  };

  if (showSplash) {
    return <FruitLoader />;
  }

  if (showMapSelectionPage) {
    return (
      <div className="flex flex-col h-full bg-white text-slate-800 font-sans relative">
        <div className="bg-white px-4 pt-6 pb-3 border-b border-slate-200 shrink-0 flex items-center gap-3 shadow-xs">
          <button 
            onClick={() => setShowMapSelectionPage(false)}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
          <div className="text-left">
            <h1 className="text-sm font-bold tracking-tight text-slate-800 font-display">Select Delivery Spot</h1>
            <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold animate-pulse">Interactive Simulation Map</p>
          </div>
        </div>

        <div className="flex-1 relative">
          <SimulatedMap 
            customerLocation={selectedLatLng}
            interactive={true}
            onSelectLocation={(loc, addr) => {
              setSelectedLatLng(loc);
              setDeliveryAddress(addr);
            }}
            height="h-full"
          />
          <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-xs text-white text-[9px] px-2.5 py-1.5 rounded-xl font-bold font-mono tracking-wider shadow-md">
            📍 TAP MAP TO SET MARKER
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-150 space-y-3 shrink-0">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 text-left">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Selected Location Address</span>
            <p className="text-xs font-bold text-slate-800 mt-1 leading-relaxed">{deliveryAddress}</p>
            <p className="text-[9px] text-orange-600 font-mono mt-1 font-bold">COORDS: {selectedLatLng.lat.toFixed(5)}, {selectedLatLng.lng.toFixed(5)}</p>
          </div>

          <button 
            onClick={() => {
              if (profile) {
                const updated = { ...profile, address: deliveryAddress, latLng: selectedLatLng };
                setProfile(updated);
                localStorage.setItem("pz_customer_profile", JSON.stringify(updated));
              }
              setShowMapSelectionPage(false);
              setActiveTab("browse");
            }}
            className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Confirm & Set Delivery Spot</span>
          </button>
        </div>
      </div>
    );
  }

  if (showCouponsPage) {
    return (
      <div className="flex flex-col h-full bg-slate-50 text-slate-800 font-sans select-none relative">
        {/* Header */}
        <div className="bg-[#FCF9F6] px-4 py-4 border-b border-slate-150 shrink-0 flex items-center gap-3 shadow-xs">
          <button 
            onClick={() => {
              setShowCouponsPage(false);
              setActiveTab("cart");
            }}
            className="p-1.5 hover:bg-slate-150 rounded-full transition-colors flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div className="text-left">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Apply Coupon</h3>
            <p className="text-[10px] text-slate-400 font-bold -mt-0.5 uppercase tracking-wide">
              Best deals & discounts for you
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Coupon Input Box */}
          <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-xs space-y-3 text-left">
            <p className="text-xs font-black text-slate-800">Have a coupon code?</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={enteredPromo}
                onChange={(e) => setEnteredPromo(e.target.value)}
                placeholder="Enter coupon code (e.g. PINGZO50)"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white uppercase"
                disabled={!!activePromo}
              />
              <button 
                onClick={() => {
                  handleApplyPromo(enteredPromo);
                  if (activePromo || enteredPromo.trim()) {
                    setTimeout(() => {
                      setShowCouponsPage(false);
                      setActiveTab("cart");
                    }, 800);
                  }
                }}
                disabled={!!activePromo || !enteredPromo.trim()}
                className={`px-5 py-2 rounded-xl font-bold text-xs transition-all ${
                  activePromo || !enteredPromo.trim()
                    ? "bg-slate-100 text-slate-400" 
                    : "bg-purple-600 hover:bg-purple-500 text-white shadow-xs"
                }`}
              >
                Apply
              </button>
            </div>
            {promoMsg && (
              <p className={`text-[10px] font-bold ${promoMsg.isError ? "text-red-600" : "text-emerald-600"}`}>
                {promoMsg.text}
              </p>
            )}
            {activePromo && (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
                <div className="text-left">
                  <span className="text-[9px] font-extrabold text-emerald-800 uppercase block">Active Code</span>
                  <span className="text-xs font-black text-emerald-700 font-mono">{activePromo}</span>
                </div>
                <button 
                  onClick={() => {
                    handleRemovePromo();
                    setEnteredPromo("");
                  }} 
                  className="text-xs font-black text-rose-600 hover:text-rose-700"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* List of Coupons */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide text-left">Available Coupons</p>
            {promos.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-150 text-center text-slate-500 text-xs">
                No active coupons available at this time.
              </div>
            ) : (
              <div className="space-y-3">
                {promos.map((cp) => {
                  let isEligible = cartSubtotal >= cp.minCartValue && cartSubtotal >= 100;
                  if (cp.discountType === "combo") {
                    const comboIds = cp.comboItems || [];
                    isEligible = isEligible && comboIds.length > 0 && comboIds.every(id => cart[id] && cart[id] > 0);
                  }

                  let cpDesc = cp.desc;
                  if (cp.discountType === "flat_amount") {
                    cpDesc = `Get Flat ₹${cp.discountValue} OFF on orders above ₹${cp.minCartValue}`;
                  } else if (cp.discountType === "flat_percentage") {
                    cpDesc = `Get ${cp.discountValue}% OFF on orders above ₹${cp.minCartValue}`;
                  } else if (cp.discountType === "combo") {
                    cpDesc = `Save ₹${cp.discountValue} when you buy the combo bundle!`;
                  }

                  const isApplied = activePromo === cp.code;

                  return (
                    <div 
                      key={cp.id || cp.code}
                      className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col relative text-left shadow-xs ${
                        isApplied 
                          ? "border-purple-500 ring-2 ring-purple-100" 
                          : !isEligible
                            ? "border-slate-150 opacity-80"
                            : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {/* Ticket top border / notch indicators */}
                      <div className="absolute top-1/2 -left-2 w-4 h-4 bg-slate-50 border-r border-slate-200 rounded-full -translate-y-1/2 z-10" />
                      <div className="absolute top-1/2 -right-2 w-4 h-4 bg-slate-50 border-l border-slate-200 rounded-full -translate-y-1/2 z-10" />

                      <div className="p-4 flex gap-3 items-start">
                        {/* Coupon Icon Badge */}
                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 text-white font-black text-xs bg-gradient-to-br ${cp.bg || 'from-purple-500 to-indigo-600'}`}>
                          <Tag className="w-5 h-5 text-white/95" />
                        </div>

                        {/* Coupon Meta */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="bg-purple-100 text-purple-800 text-[10px] font-black tracking-wider font-mono px-2 py-0.5 rounded-md uppercase">
                              {cp.code}
                            </span>
                            {isApplied && (
                              <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                                Applied
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-black text-slate-800 mt-1.5">{cp.title}</h4>
                          <p className="text-[10px] text-slate-500 leading-normal mt-0.5">{cpDesc}</p>
                          
                          {/* Specific combo list or validations */}
                          {cp.discountType === "combo" && cp.comboItems && cp.comboItems.length > 0 && (
                            <div className="mt-1.5 text-[8px] bg-purple-50 text-purple-700 px-2 py-1 rounded-lg">
                              <span className="font-bold">Required items: </span>
                              {cp.comboItems.map(id => {
                                const m = currentMenuItems.find(it => it.id === id);
                                return m ? m.name : id;
                              }).join(", ")}
                            </div>
                          )}

                          {/* Order subtotal too low warning */}
                          {cartSubtotal < 100 && (
                            <p className="text-[9px] text-red-600 font-bold mt-1">
                              ⚠️ Minimum order of ₹100 required to use coupons.
                            </p>
                          )}
                          {cartSubtotal >= 100 && cartSubtotal < cp.minCartValue && (
                            <p className="text-[9px] text-amber-600 font-bold mt-1">
                              🛒 Add items worth ₹{cp.minCartValue - cartSubtotal} more to unlock.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Coupon Action Footer */}
                      <div className="bg-slate-50 px-4 py-2 flex items-center justify-between border-t border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400">
                          {cp.discountType === "flat_percentage" ? `Discount: ${cp.discountValue}%` : `Discount: ₹${cp.discountValue}`}
                        </span>
                        
                        {isApplied ? (
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePromo();
                            }}
                            className="text-[10px] font-extrabold text-rose-600 hover:text-rose-700 uppercase"
                          >
                            Remove
                          </button>
                        ) : (
                          <button 
                            type="button"
                            disabled={!isEligible}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEnteredPromo(cp.code);
                              handleApplyPromo(cp.code);
                              setTimeout(() => {
                                setShowCouponsPage(false);
                                setActiveTab("cart");
                              }, 800);
                            }}
                            className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg transition-colors ${
                              isEligible
                                ? "bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            Apply Code
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <CustomerOnboarding 
        onComplete={(prof) => {
          setProfile(prof);
          localStorage.setItem("pz_customer_profile", JSON.stringify(prof));
          setCardName(prof.name);
          setDeliveryAddress(prof.address);
          setSelectedLatLng(prof.latLng);
        }} 
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 font-sans select-none relative">
      
      {/* Real-time Notification Toast Popup */}
      {showToast && activeToastNotif && (
        <div className="absolute top-4 left-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-900/20">
              <BellRing className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h4 className="text-xs font-black tracking-tight text-white flex items-center justify-between">
                <span>{activeToastNotif.title}</span>
                <span className="text-[9px] font-mono opacity-50 uppercase">Now</span>
              </h4>
              <p className="text-[10px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed font-medium">
                {activeToastNotif.body}
              </p>
            </div>
            <button 
              onClick={() => setShowToast(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* Custom Zepto-style Premium App Bar */}
      {state.isTrialMode && (
        <div className="bg-emerald-600 text-white py-1 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-center flex items-center justify-center gap-2 shrink-0">
          <Zap className="w-2.5 h-2.5 fill-white animate-pulse" />
          <span>Trial Version • UAT Environment</span>
          <Zap className="w-2.5 h-2.5 fill-white animate-pulse" />
        </div>
      )}
      <div className="bg-[#FCF9F6] px-4 pt-5 pb-3 border-b border-slate-150 shrink-0 flex items-center justify-between shadow-xs">
        <div className="flex flex-col items-start min-w-0 text-left">
          {/* Delivery ETA header */}
          <div className="flex items-center gap-1">
            <span className="text-[13px] font-black text-slate-900 tracking-tight flex items-center gap-0.5">
              <span className="text-amber-500">⚡️</span> 10 minutes
            </span>
            <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded-full uppercase">Instant</span>
          </div>
          {/* Clickable Location selection row */}
          <button 
            onClick={() => setShowMapSelectionPage(true)}
            className="flex items-center gap-0.5 text-slate-500 hover:text-slate-800 transition-colors mt-0.5 group min-w-0"
          >
            <span className="text-[11px] font-bold text-slate-800 truncate max-w-[170px] group-hover:underline">
              Home - {deliveryAddress}
            </span>
            <ChevronRight className="w-3.5 h-3.5 rotate-90 text-slate-400 group-hover:text-slate-600 transition-transform shrink-0" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Profile Circle Button */}
          <button 
            onClick={() => { setActiveTab("profile"); setProfileSubView("none"); }} 
            className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all shrink-0 bg-white flex items-center justify-center ${activeTab === "profile" ? "border-orange-500 scale-105" : "border-slate-200 hover:border-slate-400"}`}
          >
            {profile?.avatar ? (
              <img src={profile.avatar} alt="User" className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 pb-20 space-y-4">
        
        {/* Promotional Slide and Video Banner / Trending UI Storefront */}
        {activeTab === "browse" && (
          <div className="space-y-4">
            {/* Active Order details card */}
            {showActiveTracking && (
              <div 
                onClick={() => setActiveTab("tracking")}
                className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-xs hover:shadow-md group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 relative">
                    <Clock className="w-5 h-5 animate-pulse" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white animate-ping" />
                  </div>
                  <div className="min-w-0 text-left">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span>Order In Progress</span>
                      <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded-full font-extrabold uppercase animate-pulse">Live</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                      Status: <span className="font-bold text-orange-600 capitalize">{latestOrder.status.toLowerCase().replace(/_/g, " ")}</span>
                    </p>
                    <p className="text-[9px] text-slate-400">
                      {latestOrder.restaurantName} • Est: {latestOrder.aiOptimizedEta || "12 mins"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-orange-600 shrink-0">
                  <span className="text-[10px] font-extrabold">Track Live</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            )}

            {/* Trending Storefront Search & Promotional Badge Section */}
            <div className="flex items-center gap-2">
              {/* Search Bar Input */}
              <div className="flex-1 relative">
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Search for "atta & more"'
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white shadow-xs"
                />
                <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2.5 p-0.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* PingZO Brand Badge Card */}
              <div className="w-[120px] h-[40px] rounded-2xl overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500 border border-orange-400 flex items-center justify-between shrink-0 relative shadow-xs p-1">
                <div className="text-left leading-tight pl-1.5 z-10 flex flex-col justify-center text-white">
                  <span className="text-[7px] font-black tracking-wide opacity-90 uppercase">SUPERFAST</span>
                  <span className="text-[10px] font-black uppercase tracking-tight flex items-center gap-0.5">
                    PINGZO <span className="text-[7px] bg-white/20 px-1 rounded-sm">GO</span>
                  </span>
                </div>
                <Bike className="w-5 h-5 text-white mr-1.5 z-10 animate-bounce" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-0 bg-white/5 mix-blend-overlay" />
              </div>
            </div>

            {/* Dynamic Banner Carousel for Mobile Home Page */}
            {promos.length > 0 && (
              <div 
                onClick={() => setPromoFilterCode(promos[promoIndex].code)}
                className="relative group overflow-hidden rounded-2xl bg-gradient-to-r shadow-xs hover:shadow-md transition-all border border-slate-100 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className={`p-4 bg-gradient-to-r ${promos[promoIndex]?.bg || 'from-purple-600 to-indigo-700'} text-white space-y-2 relative transition-all duration-500 text-left`}>
                  {/* Notch-like accent to simulate ticket */}
                  <div className="absolute top-1/2 -left-1.5 w-3 h-3 bg-[#FCF9F6] border-r border-black/10 rounded-full -translate-y-1/2" />
                  <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-[#FCF9F6] border-l border-black/10 rounded-full -translate-y-1/2" />

                  <div className="flex justify-between items-start">
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wider font-mono uppercase">
                      {promos[promoIndex]?.discountType?.replace("_", " ") || "COUPON"}
                    </span>
                    <span className="bg-white text-slate-900 px-2.5 py-0.5 rounded-md text-[9px] font-black tracking-widest font-mono flex items-center gap-1">
                      🎟️ {promos[promoIndex]?.code}
                    </span>
                  </div>

                  <div className="pr-12">
                    <h4 className="text-sm font-extrabold tracking-tight">
                      {promos[promoIndex]?.title}
                    </h4>
                    <p className="text-[10px] text-white/90 leading-snug mt-0.5">{promos[promoIndex]?.desc}</p>
                    <p className="text-[8px] text-white/80 font-bold mt-1 animate-pulse">👉 Click banner to view matched products instantly!</p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/10 mt-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1">
                      {promos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPromoIndex(idx);
                          }}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${idx === promoIndex ? "bg-white w-3.5" : "bg-white/40 hover:bg-white/70"}`}
                        />
                      ))}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPromoFilterCode(promos[promoIndex].code);
                      }}
                      className="bg-white text-slate-900 hover:bg-slate-100 px-2.5 py-1 rounded-lg text-[9px] font-black transition-all shadow-xs uppercase tracking-wider"
                    >
                      Show Products
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Category Tabs: Dynamic from API */}
            <div className="flex border-b border-slate-150 overflow-x-auto scrollbar-none gap-4">
              {["All", ...availableCategories].map((tab) => {
                const isActive = mainTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setMainTab(tab);
                      if (tab === "Food") {
                        setFoodCategory("food");
                        setSelectedSubCategory("All");
                      } else if (tab === "Fresh" || tab === "All") {
                        setFoodCategory("grocery");
                        setSelectedSubCategory("All");
                      }
                    }}
                    className={`pb-2 pt-1 font-extrabold text-xs tracking-tight shrink-0 transition-all relative ${
                      isActive ? "text-slate-900 border-b-2 border-purple-700" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Coupon Filter Matched Section */}
            {promoFilterCode && (
              <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-200 text-left space-y-3 shadow-xs">
                <div className="flex justify-between items-center pb-2 border-b border-purple-150">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🎁</span>
                    <div>
                      <h3 className="text-xs font-black text-purple-900 tracking-tight uppercase">
                        Matched Products ({promoFilterCode})
                      </h3>
                      <p className="text-[9px] text-purple-700 font-bold -mt-0.5">
                        Click product to auto-apply code & go to payment page!
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPromoFilterCode(null)}
                    className="text-[9px] bg-white hover:bg-purple-100 border border-purple-200 text-purple-800 font-extrabold px-2.5 py-1 rounded-lg transition-all"
                  >
                    Clear Filter
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {getMatchedPromoItems().map((item) => {
                    const itemQty = cart[item.id] || 0;
                    const discountAmt = item.oldPrice ? item.oldPrice - item.price : 0;
                    const stock = getItemStock(item.id);
                    const isOutOfStock = stock === 0;

                    const handleBuyAndCheckout = () => {
                      if (isOutOfStock) return;
                      const cp = promos.find(p => p.code === promoFilterCode);
                      if (cp) {
                        if (cp.discountType === "combo") {
                          const updatedCart = { ...cart };
                          const comboIds = cp.comboItems || [];
                          comboIds.forEach(id => {
                            updatedCart[id] = 1;
                          });
                          setCart(updatedCart);
                        } else {
                          // Make sure price is above minCartValue if it's a flat code
                          const qtyNeeded = Math.ceil(cp.minCartValue / item.price);
                          setCart({ ...cart, [item.id]: Math.max(1, qtyNeeded) });
                        }
                        setActivePromo(cp.code);
                        setEnteredPromo(cp.code);
                        setPromoMsg({ text: `Code ${cp.code} applied successfully!`, isError: false });
                      } else {
                        setCart({ ...cart, [item.id]: 1 });
                      }
                      setActiveTab("cart");
                      setCheckoutStep("cart_review");
                    };

                    return (
                      <div 
                        key={item.id} 
                        onClick={handleBuyAndCheckout}
                        className="bg-white hover:border-purple-400 border border-slate-200 p-2 rounded-2xl flex flex-col justify-between shadow-xs relative text-left transition-all cursor-pointer group hover:scale-[1.02]"
                      >
                        <div className="bg-slate-50/50 rounded-xl aspect-square flex items-center justify-center p-1.5 relative mb-1.5 overflow-hidden border border-slate-100/50">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                          <div className="absolute top-1 right-1 bg-purple-600 text-white font-black text-[7px] px-1 rounded-md uppercase tracking-wide">
                            MATCH
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="bg-purple-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm">
                              ₹{item.price}
                            </span>
                            {item.oldPrice && (
                              <div className="flex flex-col">
                                <span className="text-[8px] text-slate-400 line-through font-bold leading-none">
                                  ₹{item.oldPrice}
                                </span>
                                <span className="text-[8px] text-emerald-600 font-black leading-none mt-0.5">
                                  {Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)}% OFF
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="border-t border-dashed border-slate-200 my-1.5" />
                          <h5 className="text-[10px] font-bold text-slate-800 line-clamp-2 leading-tight tracking-tight min-h-6">
                            {item.name}
                          </h5>
                          <p className="text-[8px] text-purple-700 font-extrabold mt-1 group-hover:translate-x-0.5 transition-all flex items-center gap-0.5">
                            Buy & Pay ➔
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fresh Handpicked section */}
            {(mainTab === "Fresh" || mainTab === "All") && (
              <div className="space-y-3.5">
                {/* Heading */}
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-3xl font-black text-[#1F5E37] tracking-tight font-display flex items-center">
                      Fresh<span className="text-emerald-500 text-lg ml-0.5">🌱</span>
                    </h2>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold -mt-0.5 uppercase tracking-wide">
                    Handpicked daily essentials
                  </p>
                </div>

                {/* Dynamic Subcategories Scroll Row */}
                <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                  {["All", ...availableSubCategories].map((subCat, i) => {
                    const isActive = selectedSubCategory === subCat;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedSubCategory(subCat);
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all border shrink-0 ${
                          isActive 
                            ? "border-emerald-600 bg-emerald-50 text-emerald-800" 
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {subCat}
                      </button>
                    );
                  })}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {currentMenuItems.filter(m => {
                    // Category check
                    if (mainTab !== "All") {
                      const targetCategory = mainTab === "Food" ? "food" : "grocery";
                      if (m.category !== targetCategory) return false;
                    }
                    
                    // Exclude blockbuster pantry deals from the default grid if on "All" or "Fresh"
                    if (m.id.includes("g_deal") && mainTab !== "Food") return false;
                    
                    if (selectedSubCategory !== "All") {
                      if (m.subCategory !== selectedSubCategory) return false;
                    }
                    if (searchQuery) {
                      const query = searchQuery.toLowerCase();
                      return m.name.toLowerCase().includes(query) || m.description.toLowerCase().includes(query);
                    }
                    return true;
                  }).map((item) => {
                    const itemQty = cart[item.id] || 0;
                    const discountAmt = item.oldPrice ? item.oldPrice - item.price : 0;
                    const stock = getItemStock(item.id);
                    const isOutOfStock = stock === 0;
                    return (
                      <div 
                        key={item.id} 
                        className={`bg-white rounded-2xl border border-slate-100 p-2 flex flex-col justify-between shadow-xs relative text-left hover:border-slate-200 transition-all ${isOutOfStock ? "opacity-75" : ""}`}
                      >
                        {/* Image Frame */}
                        <div className="bg-slate-50/50 rounded-xl aspect-square flex items-center justify-center p-1.5 relative mb-1.5 overflow-hidden border border-slate-100/50">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className={`w-full h-full object-contain mix-blend-multiply ${isOutOfStock ? "grayscale" : ""}`}
                          />

                          {/* Stock Badges */}
                          {isOutOfStock ? (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <span className="text-[8px] font-black text-white bg-red-600 px-1.5 py-0.5 rounded uppercase tracking-wider">SOLD OUT</span>
                            </div>
                          ) : stock <= 5 ? (
                            <div className="absolute top-1 left-1 bg-amber-500 text-white font-black text-[7px] px-1 rounded-sm animate-pulse">
                              {stock} LEFT
                            </div>
                          ) : null}
                          
                          {/* Absolute Plus Button / Slider inside image */}
                          <div className="absolute bottom-1 right-1">
                            {isOutOfStock ? (
                              <button 
                                disabled
                                className="px-1 py-0.5 bg-slate-100 border border-slate-200 text-[8px] font-bold text-slate-400 rounded cursor-not-allowed"
                              >
                                OUT
                              </button>
                            ) : itemQty > 0 ? (
                              <div className="bg-[#E01460] text-white rounded-lg flex items-center h-6 px-1 shadow-sm text-[10px] font-black gap-1.5">
                                <button onClick={() => removeFromCart(item.id)} className="font-extrabold hover:text-rose-100 px-1 text-[11px]">-</button>
                                <span>{itemQty}</span>
                                <button onClick={() => addToCart(item.id)} className="font-extrabold hover:text-rose-100 px-1 text-[11px]">+</button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => addToCart(item.id)} 
                                className="w-6 h-6 bg-white border border-[#E01460] rounded-lg font-black text-sm flex items-center justify-center text-[#E01460] shadow-xs hover:scale-110 active:scale-95 transition-all"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Badges / Pricing */}
                        <div className="px-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm">
                              ₹{item.price}
                            </span>
                            {item.oldPrice && (
                              <div className="flex flex-col">
                                <span className="text-[8px] text-slate-400 line-through font-bold leading-none">
                                  ₹{item.oldPrice}
                                </span>
                                <span className="text-[8px] text-emerald-600 font-black leading-none mt-0.5">
                                  {Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)}% OFF
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Dashed line spacer */}
                          <div className="border-t border-dashed border-slate-200 my-1.5" />

                          {/* Product Title */}
                          <h5 className="text-[10px] font-bold text-slate-800 line-clamp-2 leading-tight tracking-tight min-h-6">
                            {item.name}
                          </h5>

                          {/* Weight */}
                          <p className="text-[8px] text-slate-400 font-bold mt-0.5">
                            {item.weight || "100 g"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* See All Pill Button */}
                <button 
                  onClick={() => {
                    setFoodCategory("grocery");
                    setSelectedSubCategory("All");
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 rounded-xl font-bold text-[11px] text-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>See All</span>
                  <span className="text-[9px]">▸</span>
                </button>
              </div>
            )}

            {/* Blockbuster Deals Section */}
            {(mainTab === "Fresh" || mainTab === "All") && (
              <div className="space-y-2 pt-1">
                <div className="text-left">
                  <h4 className="text-sm font-black text-slate-850 tracking-tight font-display uppercase">
                    ⚡️ Blockbuster Deals
                  </h4>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {currentMenuItems.filter(m => m.id.includes("g_deal") || m.subCategory === "Pantry").map((item) => {
                    const itemQty = cart[item.id] || 0;
                    const discountAmt = item.oldPrice ? item.oldPrice - item.price : 0;
                    const stock = getItemStock(item.id);
                    const isOutOfStock = stock === 0;
                    return (
                      <div 
                        key={item.id} 
                        className={`bg-white rounded-2xl border border-slate-100 p-2 flex flex-col justify-between shadow-xs relative text-left hover:border-slate-200 transition-all ${isOutOfStock ? "opacity-75" : ""}`}
                      >
                        {/* Image Frame */}
                        <div className="bg-slate-50/50 rounded-xl aspect-square flex items-center justify-center p-1.5 relative mb-1.5 overflow-hidden border border-slate-100/50">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className={`w-full h-full object-contain mix-blend-multiply ${isOutOfStock ? "grayscale" : ""}`}
                          />
                          
                          {/* Heart Outline/Fav Icon in top right of deal item */}
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-xs cursor-pointer text-[10px]">
                            ❤️
                          </div>

                          {/* Stock Badges */}
                          {isOutOfStock ? (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <span className="text-[8px] font-black text-white bg-red-600 px-1.5 py-0.5 rounded uppercase tracking-wider">SOLD OUT</span>
                            </div>
                          ) : stock <= 5 ? (
                            <div className="absolute top-1 left-1 bg-amber-500 text-white font-black text-[7px] px-1 rounded-sm animate-pulse">
                              {stock} LEFT
                            </div>
                          ) : null}

                          {/* Absolute Plus Button / Slider inside image */}
                          <div className="absolute bottom-1 right-1">
                            {isOutOfStock ? (
                              <button 
                                disabled
                                className="px-1 py-0.5 bg-slate-100 border border-slate-200 text-[8px] font-bold text-slate-400 rounded cursor-not-allowed"
                              >
                                OUT
                              </button>
                            ) : itemQty > 0 ? (
                              <div className="bg-[#E01460] text-white rounded-lg flex items-center h-6 px-1 shadow-sm text-[10px] font-black gap-1.5">
                                <button onClick={() => removeFromCart(item.id)} className="font-extrabold hover:text-rose-100 px-1 text-[11px]">-</button>
                                <span>{itemQty}</span>
                                <button onClick={() => addToCart(item.id)} className="font-extrabold hover:text-rose-100 px-1 text-[11px]">+</button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => addToCart(item.id)} 
                                className="w-6 h-6 bg-white border border-[#E01460] rounded-lg font-black text-sm flex items-center justify-center text-[#E01460] shadow-xs hover:scale-110 active:scale-95 transition-all"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Badges / Pricing */}
                        <div className="px-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm">
                              ₹{item.price}
                            </span>
                            {item.oldPrice && (
                              <div className="flex flex-col">
                                <span className="text-[8px] text-slate-400 line-through font-bold leading-none">
                                  ₹{item.oldPrice}
                                </span>
                                <span className="text-[8px] text-emerald-600 font-black leading-none mt-0.5">
                                  {Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)}% OFF
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Dashed line spacer */}
                          <div className="border-t border-dashed border-slate-200 my-1.5" />

                          {/* Product Title */}
                          <h5 className="text-[10px] font-bold text-slate-800 line-clamp-2 leading-tight tracking-tight min-h-6">
                            {item.name}
                          </h5>

                          {/* Weight */}
                          <p className="text-[8px] text-slate-400 font-bold mt-0.5">
                            {item.weight || "100 g"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Secure Checkout / Cart Tab */}
        {activeTab === "cart" && (
          <div className="space-y-4">
            {checkoutStep === "cart_review" && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-orange-600" /> Cart Review
                </h3>

                {cartItemsCount === 0 ? (
                  <div className="text-center py-8 text-slate-400 space-y-2">
                    <ShoppingBag className="w-12 h-12 mx-auto opacity-30" />
                    <p className="text-xs">Your cart is currently empty.</p>
                    <button onClick={() => setActiveTab("browse")} className="text-xs text-orange-600 underline font-bold mt-2 block mx-auto">Browse menu items</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.keys(cart).map((id) => {
                      const item = currentMenuItems.find(m => m.id === id)!;
                      const qty = Number(cart[id]) || 0;
                      return (
                        <div key={id} className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-slate-800 truncate block">{item.name}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">{qty} x ₹{item.price.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-800">₹{(item.price * qty).toFixed(2)}</span>
                            <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    <div className="pt-3 space-y-1.5 text-xs text-slate-500">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="text-slate-700 font-medium">₹{cartSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span className="text-slate-700 font-medium">₹{deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-100 pt-1.5">
                        <span>Central GST (CGST @ {cgstRate}%)</span>
                        <span className="text-slate-700 font-medium">₹{cgstAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pb-1.5">
                        <span>State GST (SGST @ {sgstRate}%)</span>
                        <span className="text-slate-700 font-medium">₹{sgstAmount.toFixed(2)}</span>
                      </div>
                      {appliedPromoDiscount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-bold">
                          <span>Promo Discount ({activePromo})</span>
                          <span>-₹{appliedPromoDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-800 text-sm">
                        <span>Grand Total</span>
                        <span className="text-orange-600">₹{cartTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setCheckoutStep("payment")} 
                      className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1"
                    >
                      Secure checkout <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Secure Payment Gateway Mockup Form */}
            {checkoutStep === "payment" && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-orange-600" /> PingZo Pay Gateway
                  </h3>
                  <span className="text-[9px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100 font-bold font-sans">SECURE</span>
                </div>

                <div className="p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl space-y-4 text-white shadow-xs relative overflow-hidden">
                  <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                    <CreditCard className="w-24 h-24" />
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono tracking-widest uppercase">Secure Token Transaction</span>
                    <span className="text-sm font-extrabold tracking-tight">PingZo Gold</span>
                  </div>
                  <div className="font-mono text-sm tracking-widest pt-2">
                    {cardNumber || "**** **** **** ****"}
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <div>
                      <p className="opacity-60 text-[8px]">CARDHOLDER</p>
                      <p className="uppercase font-medium">{cardName || "Jane Doe"}</p>
                    </div>
                    <div>
                      <p className="opacity-60 text-[8px]">EXPIRY</p>
                      <p>{cardExpiry || "MM/YY"}</p>
                    </div>
                  </div>
                </div>

                {state.isTrialMode && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    <span className="text-[10px] font-bold text-emerald-800 text-left">
                      UAT Trial Mode Active: Payments are simulated. No real money will be charged.
                    </span>
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-semibold">Cardholder Name</label>
                    <input 
                      type="text" 
                      value={cardName} 
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 font-semibold">Card Number</label>
                    <input 
                      type="text" 
                      value={cardNumber} 
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-500 font-semibold">Expiry</label>
                      <input 
                        type="text" 
                        value={cardExpiry} 
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono text-center focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 font-semibold">CVV</label>
                      <input 
                        type="password" 
                        value={cardCvv} 
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="***"
                        maxLength={3}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono text-center focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Coupon Code Section */}
                <div className="border-t border-slate-100 pt-3 text-xs space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      🏷️ Coupon Discount
                    </span>
                    {activePromo && (
                      <button 
                        onClick={handleRemovePromo}
                        className="text-[10px] text-red-600 hover:underline font-extrabold"
                      >
                        REMOVE COUPON
                      </button>
                    )}
                  </div>

                  {/* Prominent separate page offer card button */}
                  <button
                    type="button"
                    onClick={() => setShowCouponsPage(true)}
                    className="w-full bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-200 rounded-xl p-2.5 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-2 text-left">
                      <span className="text-lg">🎟️</span>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">View All Available Coupons</h4>
                        <p className="text-[9px] text-purple-700 font-bold leading-tight">Click to see details & apply discounts</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-purple-600 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={enteredPromo}
                      onChange={(e) => setEnteredPromo(e.target.value)}
                      placeholder="e.g. PINGZO50"
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-slate-800 focus:outline-none focus:border-orange-500 uppercase"
                      disabled={!!activePromo}
                    />
                    <button 
                      onClick={() => handleApplyPromo()}
                      disabled={!!activePromo}
                      className={`px-4 py-1.5 rounded-xl font-bold transition-all ${activePromo ? "bg-slate-100 text-slate-400" : "bg-purple-600 hover:bg-purple-500 text-white"}`}
                    >
                      Apply
                    </button>
                  </div>

                  {promoMsg && (
                    <p className={`text-[10px] font-bold ${promoMsg.isError ? "text-red-600" : "text-emerald-600"}`}>
                      {promoMsg.text}
                    </p>
                  )}
                </div>

                {/* Secure Payment Breakdown: Products, GST, discount and grand total */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3 text-left">
                  <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/60 pb-1.5">
                    🛍️ Order & Billing Summary
                  </h4>
                  
                  {/* Ordered Product Details list */}
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {Object.keys(cart).map((id) => {
                      const item = currentMenuItems.find(m => m.id === id);
                      if (!item) return null;
                      const qty = Number(cart[id]) || 0;
                      return (
                        <div key={id} className="flex justify-between items-center text-[11px] text-slate-700">
                          <span className="font-semibold truncate max-w-[70%]">
                            {item.name} <span className="text-slate-400 font-bold">x{qty}</span>
                          </span>
                          <span className="font-mono font-bold">₹{(item.price * qty).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-dashed border-slate-200 pt-2 space-y-1.5 text-[11px] text-slate-500 font-medium">
                    <div className="flex justify-between">
                      <span>Gross Subtotal</span>
                      <span className="text-slate-700">₹{cartSubtotal.toFixed(2)}</span>
                    </div>
                    {appliedPromoDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Discount ({activePromo})</span>
                        <span>-₹{appliedPromoDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Central GST (CGST @ {cgstRate}%)</span>
                      <span className="text-slate-700">₹{cgstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>State GST (SGST @ {sgstRate}%)</span>
                      <span className="text-slate-700">₹{sgstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span className="text-slate-700">₹{deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 text-xs font-black text-slate-800">
                      <span>Total Gross Payable</span>
                      <span className="text-orange-600 font-mono">₹{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handlePlaceOrder} 
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  Pay & Authorize ₹{cartTotal.toFixed(2)}
                </button>
              </div>
            )}

            {/* Payment Gateway Processing Spinner */}
            {checkoutStep === "processing" && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-4 shadow-xs">
                <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Processing Direct Payment</h4>
                  <p className="text-xs text-slate-400 mt-1">Interfacing with secure bank nodes. Creating token vault...</p>
                </div>
              </div>
            )}

            {/* Payment Gateway Success Panel */}
            {checkoutStep === "success" && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-4 shadow-xs">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-100">
                  <CheckCircle2 className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Payment Authorization Success!</h3>
                  <p className="text-xs text-slate-400 mt-1">PingZo has generated order ticket. AI route optimizing is running.</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-left">
                  <p className="text-[10px] font-mono text-slate-400">TRANSACTION ID:</p>
                  <p className="text-xs font-mono text-orange-600 mt-0.5">{paymentTx}</p>
                </div>
                <button 
                  onClick={() => { setActiveTab("tracking"); setCheckoutStep("cart_review"); }} 
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                >
                  Track Order
                </button>
              </div>
            )}
          </div>
        )}

        {/* Real-time Delivery Tracker Tab */}
        {activeTab === "tracking" && (
          <div className="space-y-4">
            {!latestOrder ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-4 shadow-xs">
                <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 animate-bounce" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">No active orders placed yet.</p>
                  <p className="text-xs text-slate-400">Place an order from the shop, or run a live real-time simulation immediately to test the routing engine!</p>
                </div>
                
                <div className="pt-2 flex flex-col gap-2.5">
                  <button 
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/order/create-demo", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            customerName: profile?.name || "Sathish Khan",
                            customerPhone: profile?.phone || "+1 (555) 789-1234",
                            deliveryLocation: selectedLatLng,
                            deliveryAddress: deliveryAddress
                          })
                        });
                        if (res.ok) {
                          onRefresh();
                        }
                      } catch (err) {
                        console.error("Failed to start demo:", err);
                      }
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-pulse" /> Launch Live Tracking Demo
                  </button>

                  <button 
                    onClick={() => setActiveTab("browse")} 
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                  >
                    Browse Product Catalog
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Active Tracking Header */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">ACTIVE TRACKING</span>
                    <h3 className="text-xs font-bold text-slate-800 mt-0.5">Order ID: #{latestOrder.id}</h3>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    latestOrder.status === OrderStatus.DELIVERED ? "bg-green-50 text-green-700 border-green-100" :
                    latestOrder.status === OrderStatus.CANCELLED ? "bg-red-50 text-red-700 border-red-100" :
                    "bg-orange-50 text-orange-700 border-orange-100 animate-pulse"
                  }`}>
                    {latestOrder.status}
                  </span>
                </div>

                {/* Dynamic Rider In-Transit Tracking Panel */}
                {(latestOrder.status === OrderStatus.OUT_FOR_DELIVERY || latestOrder.status === OrderStatus.NEARBY) && (
                  <div id="rider-in-transit-panel" className="bg-gradient-to-br from-orange-600 to-red-600 text-white p-5 rounded-2xl space-y-4 shadow-md relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                      <Bike className="w-32 h-32" />
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase bg-white/20 px-2.5 py-0.5 rounded-full font-mono font-bold tracking-wider">
                          Live Courier Status
                        </span>
                        <h3 className="text-xl font-extrabold font-sans mt-2 flex items-center gap-1.5">
                          {latestOrder.status === OrderStatus.NEARBY ? (
                            <span className="animate-pulse text-yellow-300">Arriving in under 1 min!</span>
                          ) : (
                            <span>Delivery within {trackingRemainingMins} mins</span>
                          )}
                        </h3>
                        <p className="text-xs text-orange-100 font-medium mt-1">
                          {latestOrder.status === OrderStatus.NEARBY 
                            ? `${latestOrder.driverName || "Our partner"} has reached your gate!`
                            : `${latestOrder.driverName || "Our partner"} is fast-tracking your organic package.`}
                        </p>
                      </div>
                      <div className="bg-white/10 p-2.5 rounded-xl text-center backdrop-blur-xs min-w-[75px] border border-white/10">
                        <Clock className="w-5 h-5 mx-auto mb-1 text-yellow-200 animate-pulse" />
                        <span className="text-[9px] font-mono block text-orange-100 uppercase">Remaining</span>
                        <span className="text-xs font-bold block font-mono">
                          {latestOrder.status === OrderStatus.NEARBY ? "1 MIN" : `${trackingRemainingMins} MINS`}
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Graphic Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="relative h-2.5 bg-white/15 rounded-full overflow-visible">
                        {/* Shimmering active fill */}
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-300 to-amber-300 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${trackingProgressPct}%` }}
                        />
                        {/* Moving e-bike / vehicle indicator */}
                        <div 
                          className="absolute -top-2.5 -ml-4 bg-white text-orange-600 p-1.5 rounded-full shadow-lg border border-orange-100 transition-all duration-1000 ease-out flex items-center justify-center"
                          style={{ left: `${trackingProgressPct}%` }}
                        >
                          <Bike className="w-3.5 h-3.5 animate-bounce" />
                        </div>
                      </div>
                      <div className="flex justify-between text-[10px] text-orange-100 font-mono font-semibold px-0.5">
                        <span className="flex items-center gap-0.5">🏪 SOMA Store ({Math.round(100 - trackingProgressPct)}% away)</span>
                        <span className="flex items-center gap-0.5">🏠 Your Home</span>
                      </div>
                    </div>

                    {/* Speedometer & Traffic Indicator */}
                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/10">
                      <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
                        <Activity className="w-4 h-4 text-yellow-200 shrink-0" />
                        <div>
                          <span className="text-[9px] text-orange-200 block">ROUTING PATTERN</span>
                          <span className="text-xs font-bold block truncate">AI Bypass Active</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
                        <Navigation className="w-4 h-4 text-yellow-200 shrink-0" />
                        <div>
                          <span className="text-[9px] text-orange-200 block">TRAFFIC FLOW</span>
                          <span className="text-xs font-bold block">
                            {latestOrder.trafficDelayMinutes && latestOrder.trafficDelayMinutes > 4 ? "Heavy (+5m delay)" : "Smooth Corridor"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulated Live Tracking Map */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-700">Live Driver Navigation Map</h4>
                  <SimulatedMap 
                    customerLocation={latestOrder.deliveryLocation}
                    restaurantLocation={latestOrder.restaurantLocation}
                    driverLocation={latestOrder.driverLocation}
                    routeNodes={latestOrder.routeNodes}
                    interactive={false}
                    height="h-44"
                  />
                  
                  {/* AI routing insights display */}
                  {latestOrder.status !== OrderStatus.DELIVERED && latestOrder.status !== OrderStatus.CANCELLED && (
                    <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100 space-y-1">
                      <div className="flex items-center gap-1.5 text-orange-700 font-sans font-bold text-[10px]">
                        <Sparkles className="w-3.5 h-3.5" /> AI ROUTING ENGINE INSIGHTS
                      </div>
                      <p className="text-xs text-orange-950">
                        <span className="font-bold">ETA:</span> {latestOrder.aiOptimizedEta || "15 mins"} 
                        <span className="mx-2 text-slate-300">|</span> 
                        <span className="font-bold">Traffic Congestion:</span> +{latestOrder.trafficDelayMinutes || 2} mins
                      </p>
                      <p className="text-[10px] text-slate-500 leading-normal italic mt-1 font-sans">
                        "{latestOrder.aiRouteExplanation || 'Recalculating real-time node bypass routes...'}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress Tracking Bar */}
                {latestOrder.status !== OrderStatus.CANCELLED && (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-700">Automated Status Updates</h4>
                    
                    <div className="relative pl-6 space-y-4 text-xs">
                      {/* Vertical connector */}
                      <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-slate-200" />

                      {/* Pending Step */}
                      <div className="relative flex items-center gap-3">
                        <div className="absolute -left-6 w-3.5 h-3.5 rounded-full border-2 bg-orange-600 border-orange-400" />
                        <div>
                          <p className="font-bold text-slate-800">Order Received</p>
                          <p className="text-[10px] text-slate-400">Secure card transaction authorized</p>
                        </div>
                      </div>

                      {/* Assigned Step */}
                      <div className="relative flex items-center gap-3">
                        <div className={`absolute -left-6 w-3.5 h-3.5 rounded-full border-2 ${
                          latestOrder.status !== OrderStatus.PENDING ? "bg-orange-600 border-orange-400" : "bg-white border-slate-300"
                        }`} />
                        <div>
                          <p className="font-bold text-slate-800">Driver Assigned</p>
                          <p className="text-[10px] text-slate-400">{latestOrder.driverName || "Assigning partner..."}</p>
                        </div>
                      </div>

                      {/* Prep Step */}
                      <div className="relative flex items-center gap-3">
                        <div className={`absolute -left-6 w-3.5 h-3.5 rounded-full border-2 ${
                          [OrderStatus.PREPARING, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.NEARBY, OrderStatus.DELIVERED].includes(latestOrder.status)
                            ? "bg-orange-600 border-orange-400" : "bg-white border-slate-300"
                        }`} />
                        <div>
                          <p className="font-bold text-slate-800">Preparing Items</p>
                          <p className="text-[10px] text-slate-400">Restaurant is boxing up fresh ingredients</p>
                        </div>
                      </div>

                      {/* Transit Step */}
                      <div className="relative flex items-center gap-3">
                        <div className={`absolute -left-6 w-3.5 h-3.5 rounded-full border-2 ${
                          [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.NEARBY, OrderStatus.DELIVERED].includes(latestOrder.status)
                            ? "bg-orange-600 border-orange-400" : "bg-white border-slate-300"
                        }`} />
                        <div>
                          <p className="font-bold text-slate-800">Out for Delivery</p>
                          <p className="text-[10px] text-slate-400">Driver in-transit. Dynamic routing enabled</p>
                        </div>
                      </div>

                      {/* Delivered Step */}
                      <div className="relative flex items-center gap-3">
                        <div className={`absolute -left-6 w-3.5 h-3.5 rounded-full border-2 ${
                          latestOrder.status === OrderStatus.DELIVERED ? "bg-green-600 border-green-400" : "bg-white border-slate-300"
                        }`} />
                        <div>
                          <p className="font-bold text-slate-800">Delivered</p>
                          <p className="text-[10px] text-slate-400">Arrived at your door step!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Driver Contact & Direct Chat panel - available after PICKED UP */}
                {latestOrder.driverId && latestOrder.status !== OrderStatus.CANCELLED && (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-slate-800">{latestOrder.driverName}</h4>
                        <p className="text-[10px] text-slate-400">PingZo Professional Delivery Rider</p>
                      </div>
                      
                      {/* Driver phone contact display available after picking up product */}
                      {latestOrder.status !== OrderStatus.PENDING && latestOrder.status !== OrderStatus.ASSIGNED && (
                        <a 
                          href={`tel:${latestOrder.driverPhone}`}
                          className="p-2 bg-green-50 text-green-700 rounded-full hover:bg-green-100 border border-green-100 transition-colors"
                          title="Call Driver"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    {/* Chat Messages Log */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Troubleshooting Chat Room</p>
                      
                      <div className="h-32 overflow-y-auto bg-slate-50 rounded-xl p-2.5 space-y-2 border border-slate-100">
                        {state.chats.filter(c => c.orderId === latestOrder.id).length === 0 ? (
                          <p className="text-[10px] text-slate-400 italic text-center py-8">No chat messages yet. Type below to send.</p>
                        ) : (
                          state.chats.filter(c => c.orderId === latestOrder.id).map(msg => (
                            <div key={msg.id} className={`flex flex-col ${msg.sender === "customer" ? "items-end" : "items-start"}`}>
                              <span className="text-[9px] text-slate-400 mb-0.5 font-sans font-medium">{msg.sender === "customer" ? "You" : "Rider"}</span>
                              <div className={`px-2.5 py-1.5 rounded-xl text-xs max-w-[85%] ${
                                msg.sender === "customer" ? "bg-orange-600 text-white rounded-tr-none font-semibold" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                              }`}>
                                {msg.text}
                              </div>
                              {msg.sender === "customer" && (
                                <span className="text-[8px] text-slate-400 mt-0.5 select-none font-medium">
                                  {msg.status === "read" ? "Seen 👁" : msg.status === "delivered" ? "Delivered ✔✔" : "Sent ✔"}
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Quick Predefined Reply Chips */}
                      <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin select-none">
                        {[
                          "Leave at my door",
                          "Call when outside",
                          "Stuck in lift?",
                          "Beware of dog",
                          "Thank you! 👍"
                        ].map(chip => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => handleSendQuickReply(chip)}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full px-2.5 py-1 text-slate-600 shrink-0 font-bold transition-colors"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>

                      <form onSubmit={handleSendDriverChat} className="flex gap-2">
                        <input 
                          type="text" 
                          value={driverChatText}
                          onChange={(e) => setDriverChatText(e.target.value)}
                          placeholder="Type chat troubleshooting..."
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                        <button type="submit" className="p-2 bg-orange-600 text-white rounded-xl hover:bg-orange-500 shadow-xs transition-colors">
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Cancel Feature with Automated Reversal Trigger */}
                {(latestOrder.status === OrderStatus.PENDING || latestOrder.status === OrderStatus.ASSIGNED) && (
                  <button 
                    onClick={() => handleCancelOrder(latestOrder.id)}
                    className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-100 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Cancel Order (Instant Refund)
                  </button>
                )}

                {/* Refund Reversal Transaction Invoice Indicator */}
                {latestOrder.status === OrderStatus.CANCELLED && (
                  <div className="bg-red-50/50 border border-red-100 p-3 rounded-2xl space-y-2 shadow-xs">
                    <div className="flex items-center gap-1 text-red-700 font-sans font-bold text-xs">
                      <AlertTriangle className="w-4 h-4" /> REVERSAL SETTLED
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">The automatic order cancellation triggered an instant transaction reversal workflow safely.</p>
                    <div className="p-2.5 bg-white rounded-xl border border-red-100/30 text-[10px] font-mono text-red-700 space-y-1">
                      <p>REFUND STATUS: SUCCESS</p>
                      <p>REVERSAL ID: {latestOrder.payment.refundId || "ref_sim_384729"}</p>
                      <p>REFUNDED AT: {latestOrder.payment.refundedAt ? new Date(latestOrder.payment.refundedAt).toLocaleString() : new Date().toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {/* Invoice Generation Display (Available after delivery) */}
                {latestOrder.status === OrderStatus.DELIVERED && (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <FileText className="w-4 h-4 text-orange-600" /> Invoice Settled
                      </span>
                      <span className="text-[9px] bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded font-bold">PAID</span>
                    </div>

                    <div className="text-xs font-mono space-y-1 text-slate-600 leading-normal">
                      <p className="text-slate-400 font-sans font-bold uppercase text-[9px] tracking-wider">PingZo Metropolis Ltd.</p>
                      <p>DATE: {new Date(latestOrder.createdAt).toLocaleDateString()}</p>
                      <p>ORDER ID: {latestOrder.id}</p>
                      <p className="border-t border-dashed border-slate-100 pt-1.5 mt-1.5 text-[10px] font-bold">ITEMS SOLD:</p>
                      {latestOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[10px]">
                          <span>{item.menuItem.name} (x{item.quantity})</span>
                          <span>₹{(item.menuItem.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t border-dashed border-slate-100 pt-1.5 space-y-0.5 text-[9px]">
                        {latestOrder.discountAmount ? (
                          <div className="flex justify-between text-emerald-600 font-bold">
                            <span>Promo Discount</span>
                            <span>-₹{latestOrder.discountAmount.toFixed(2)}</span>
                          </div>
                        ) : null}
                        <div className="flex justify-between">
                          <span>Central GST (CGST)</span>
                          <span>₹{latestOrder.cgstAmount?.toFixed(2) || "0.00"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>State GST (SGST)</span>
                          <span>₹{latestOrder.sgstAmount?.toFixed(2) || "0.00"}</span>
                        </div>
                      </div>
                      <div className="border-t border-dashed border-slate-100 pt-1.5 flex justify-between font-bold text-orange-600 text-xs">
                        <span>TOTAL CHARGED</span>
                        <span>₹{latestOrder.totalPrice.toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 pt-2 text-center font-sans">Thank you for ordering on PingZo!</p>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => alert("Invoice PDF download simulated successfully!")} 
                        className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        Download PDF
                      </button>
                      
                      {!latestOrder.rating && (
                        <button 
                          onClick={() => setShowRatingId(latestOrder.id)} 
                          className="flex-1 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-all"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" /> Rate Order
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Consolidated Profile View with Sub-menus */}
        {activeTab === "profile" && (
          <div className="space-y-4 text-left">
            
            {/* 1. Sub-View: Orders History */}
            {profileSubView === "orders" && (
              <div className="space-y-3">
                <button 
                  onClick={() => setProfileSubView("none")} 
                  className="flex items-center gap-1.5 text-xs text-orange-600 font-extrabold hover:underline mb-2 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-xs max-w-max"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to My Profile
                </button>
                
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <History className="w-4 h-4 text-orange-600" /> My Orders History
                  </h3>

                  {state.orders.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-150 p-8 rounded-2xl text-center space-y-2">
                      <p className="text-xs font-bold text-slate-600">No Orders Placed Yet</p>
                      <p className="text-[10px] text-slate-400">Your shopping bag is empty of past records. Fill it with organic veggies now!</p>
                      <button
                        onClick={() => { setActiveTab("browse"); setProfileSubView("none"); }}
                        className="mt-3 px-4 py-1.5 bg-orange-600 text-white rounded-xl text-[10px] font-bold hover:bg-orange-500 transition-colors shadow-sm"
                      >
                        Go Shop
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {state.orders.map((ord) => (
                        <div key={ord.id} className="bg-slate-50/50 rounded-2xl border border-slate-150 p-3.5 space-y-3 shadow-xs">
                          <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                            <div>
                              <p className="text-[10px] font-mono font-bold text-slate-500">#{ord.id}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">{new Date(ord.createdAt).toLocaleString()}</p>
                            </div>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              ord.status === OrderStatus.DELIVERED 
                                ? "bg-green-50 text-green-700 border border-green-100" 
                                : ord.status === OrderStatus.CANCELLED
                                ? "bg-red-50 text-red-700 border border-red-100"
                                : "bg-orange-50 text-orange-700 border border-orange-100 animate-pulse"
                            }`}>
                              {ord.status.toLowerCase().replace(/_/g, " ")}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {ord.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-[11px] text-slate-600">
                                <span>{item.menuItem.name} <span className="text-slate-400 font-bold">x{item.quantity}</span></span>
                                <span className="font-semibold">₹{(item.menuItem.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                            <span className="text-slate-500 font-medium">Total Paid:</span>
                            <span className="font-extrabold text-orange-600">₹{ord.totalPrice.toFixed(2)}</span>
                          </div>

                          <div className="flex gap-2 pt-1">
                            {ord.status !== OrderStatus.DELIVERED && ord.status !== OrderStatus.CANCELLED ? (
                              <button
                                onClick={() => setActiveTab("tracking")}
                                className="w-full py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-[10px] font-bold transition-all shadow-xs"
                              >
                                Track Order Live
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  const newCart = { ...cart };
                                  ord.items.forEach(i => {
                                    newCart[i.menuItem.id] = (newCart[i.menuItem.id] || 0) + i.quantity;
                                  });
                                  setCart(newCart);
                                  setActiveTab("cart");
                                  setCheckoutStep("cart_review");
                                }}
                                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold transition-all shadow-xs"
                              >
                                Reorder All Items
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Sub-View: Smart Help & Support Chat */}
            {profileSubView === "help" && (
              <div className="space-y-3">
                <button 
                  onClick={() => setProfileSubView("none")} 
                  className="flex items-center gap-1.5 text-xs text-orange-600 font-extrabold hover:underline mb-2 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-xs max-w-max"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to My Profile
                </button>
                
                <div className="bg-white p-4 rounded-2xl border border-slate-250 shadow-xs space-y-4 text-left">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-orange-600" /> PingZo Smart Support Hub
                  </h3>

                  {/* Collapsible FAQ Accordion Section */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">📘 Frequently Asked Questions</h4>
                    <div className="divide-y divide-slate-100 border border-slate-150 rounded-xl overflow-hidden bg-slate-50/50">
                      {[
                        {
                          q: "🥕 Sourcing: Are vegetables fresh & organic?",
                          a: "Absolutely! We partner with local bio-certified farms to bring tomatoes, avocados, and fresh greens directly to our dark-stores within 6 hours of harvest. Quality is 100% guaranteed."
                        },
                        {
                          q: "⚡ Delivery: How does PingZo deliver in 15 mins?",
                          a: "PingZo uses advanced automated routing algorithms that assign your nearest available driver immediately. Real-time traffic checks ensure the fastest roads are chosen automatically."
                        },
                        {
                          q: "🔄 Refunds: Can I cancel or get a refund?",
                          a: "Yes! If you cancel before the driver starts delivering, we issue an instant, automatic credit reversal back to your card. No questions asked."
                        },
                        {
                          q: "🍔 Food: When will restaurant food options launch?",
                          a: "Our food restaurant expansion is scheduled for early next month! We are onboarding local gourmet kitchens right now to ensure rapid 15-minute delivery."
                        }
                      ].map((faq, index) => {
                        const isOpen = activeFaq === index;
                        return (
                          <div key={index} className="px-3 py-2.5 bg-white">
                            <button
                              type="button"
                              onClick={() => setActiveFaq(isOpen ? null : index)}
                              className="w-full flex justify-between items-center text-left text-xs font-bold text-slate-700 hover:text-orange-600 transition-colors"
                            >
                              <span>{faq.q}</span>
                              <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-90 text-orange-600" : ""}`} />
                            </button>
                            {isOpen && (
                              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                {faq.a}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Helper FAQ Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button 
                      onClick={() => { setChatInput("How do I cancel my order?"); }}
                      className="text-[10px] bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 border border-slate-200 transition-colors"
                    >
                      Cancel order & Refund?
                    </button>
                    <button 
                      onClick={() => { setChatInput("Where is my driver right now?"); }}
                      className="text-[10px] bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 border border-slate-200 transition-colors"
                    >
                      Track live driver?
                    </button>
                    <button 
                      onClick={() => { setChatInput("How does AI-driven routing work?"); }}
                      className="text-[10px] bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 border border-slate-200 transition-colors"
                    >
                      AI routing explanation?
                    </button>
                  </div>

                  {/* Chatbot Interface */}
                  <div className="h-44 overflow-y-auto bg-slate-50 rounded-xl p-3 space-y-3 border border-slate-100">
                    {supportMessages.map((msg, idx) => (
                      <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                        <span className="text-[9px] text-slate-400 mb-0.5 font-sans font-medium">{msg.sender === "user" ? "You" : "AI Assistant"}</span>
                        <div className={`px-3 py-2 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                          msg.sender === "user" ? "bg-orange-600 text-white rounded-tr-none font-semibold" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs"
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendSupportChat} className="flex gap-2">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask support bot..."
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                    <button type="submit" className="px-3 bg-orange-600 text-white font-bold text-xs rounded-xl hover:bg-orange-500 shadow-xs transition-colors">
                      Send
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* 3. Sub-View: Notifications & Marketing Alerts */}
            {profileSubView === "notifications" && (
              <div className="space-y-3">
                <button 
                  onClick={() => setProfileSubView("none")} 
                  className="flex items-center gap-1.5 text-xs text-orange-600 font-extrabold hover:underline mb-2 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-xs max-w-max"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to My Profile
                </button>
                
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-orange-600" /> Notifications Center
                  </h3>

                  {state.notifications.filter(n => n.type === "marketing" || n.type === "promo").length === 0 ? (
                    <div className="bg-slate-50 border border-slate-150 p-8 rounded-2xl text-center space-y-2">
                      <p className="text-xs font-bold text-slate-600">No Notifications Yet</p>
                      <p className="text-[10px] text-slate-400">We'll notify you about the latest organic deals and fresh arrivals here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {state.notifications
                        .filter(n => n.type === "marketing" || n.type === "promo")
                        .map((notif) => (
                        <div key={notif.id} className="bg-slate-50/50 rounded-2xl border border-slate-150 p-3.5 space-y-2 shadow-xs">
                          <div className="flex justify-between items-start">
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                              notif.type === "promo" ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            }`}>
                              {notif.type}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h4 className="text-xs font-extrabold text-slate-800 leading-tight">{notif.title}</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{notif.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Primary Profile Details & Sub-Menus Panel */}
            {profileSubView === "none" && (
              <div className="space-y-4">
                {/* Premium Interactive Sub-menus Row */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">⚡️ Interactive Sub-Menus</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Sub-menu 1: Orders History */}
                    <button 
                      onClick={() => setProfileSubView("orders")}
                      className="bg-white border border-slate-150 hover:border-orange-500 rounded-2xl p-4 flex flex-col items-start gap-2.5 text-left transition-all hover:shadow-md hover:scale-102 group relative overflow-hidden"
                    >
                      <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <History className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-black text-slate-800 block">Orders History</span>
                        <span className="text-[9px] text-slate-400 mt-0.5 block">{state.orders.length} past purchases</span>
                      </div>
                      <div className="absolute right-3.5 bottom-3.5 text-slate-300 group-hover:text-orange-500 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>

                    {/* Sub-menu 2: Help & Support */}
                    <button 
                      onClick={() => setProfileSubView("help")}
                      className="bg-white border border-slate-150 hover:border-purple-500 rounded-2xl p-4 flex flex-col items-start gap-2.5 text-left transition-all hover:shadow-md hover:scale-102 group relative overflow-hidden"
                    >
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <HelpCircle className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-black text-slate-800 block">Help Section</span>
                        <span className="text-[9px] text-slate-400 mt-0.5 block">FAQ & Smart chatbot</span>
                      </div>
                      <div className="absolute right-3.5 bottom-3.5 text-slate-300 group-hover:text-purple-500 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>

                    {/* Sub-menu 3: Notifications & Alerts */}
                    <button 
                      onClick={() => setProfileSubView("notifications")}
                      className="bg-white border border-slate-150 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-start gap-2.5 text-left transition-all hover:shadow-md hover:scale-102 group relative overflow-hidden"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BellRing className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-black text-slate-800 block">Alerts & Promo</span>
                        <span className="text-[9px] text-slate-400 mt-0.5 block">Marketing notifications</span>
                      </div>
                      <div className="absolute right-3.5 bottom-3.5 text-slate-300 group-hover:text-emerald-500 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-600" /> My Delivery Profile
                  </h3>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-2xl text-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Orders</span>
                      <span className="text-sm font-extrabold text-slate-800 mt-1 block">{state.orders.length}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-2xl text-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Spent</span>
                      <span className="text-sm font-extrabold text-orange-600 mt-1 block">
                        ₹{state.orders.reduce((acc, curr) => acc + (curr.status !== OrderStatus.CANCELLED ? curr.totalPrice : 0), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-2xl text-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Locations</span>
                      <span className="text-sm font-extrabold text-emerald-600 mt-1 block">1 Saved</span>
                    </div>
                  </div>

                  {!isEditingProfile ? (
                    <div className="space-y-3.5 text-xs bg-slate-50/50 p-3.5 rounded-2xl border border-slate-150">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider">Contact Cards</span>
                        <button 
                          onClick={() => setIsEditingProfile(true)}
                          className="text-[10px] text-orange-600 font-extrabold hover:underline"
                        >
                          Edit Details
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Full Name</span>
                          <span className="font-bold text-slate-800">{profile?.name || "Jane Doe"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Email Address</span>
                          <span className="font-bold text-slate-800">{profile?.email || "jane.doe@gmail.com"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Phone Number</span>
                          <span className="font-bold text-slate-800">{profile?.phone || "+1 (555) 019-2834"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Diet Preference</span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 text-[9px]">{profile?.dietPref || "None"}</span>
                        </div>
                        <div className="flex justify-between items-start gap-2 pt-1 border-t border-slate-100">
                          <span className="text-slate-400 shrink-0">Saved Address</span>
                          <span className="font-bold text-slate-800 truncate text-right max-w-[70%]">{profile?.address || "456 Market St, San Francisco, CA"}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-150">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">Full Name</label>
                        <input 
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">Email Address</label>
                        <input 
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</label>
                        <input 
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">Dietary Preference</label>
                        <select
                          value={editDiet}
                          onChange={(e) => setEditDiet(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                        >
                          <option value="None">None (Standard)</option>
                          <option value="Organic Only">Organic Only</option>
                          <option value="Vegetarian">Vegetarian</option>
                          <option value="Vegan">Vegan</option>
                          <option value="Gluten Free">Gluten Free</option>
                        </select>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => setIsEditingProfile(false)}
                          className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          className="flex-1 py-1.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="bg-red-50/50 p-3.5 rounded-2xl border border-red-100 text-left space-y-2">
                    <p className="text-[10px] font-bold text-red-700 uppercase">App Cache Control</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Clearing your local profile details instantly logs you out and restarts the interactive onboarding tutorial workflow.</p>
                    <button
                      onClick={() => {
                        if (window.confirm("Do you want to reset your profile and re-trigger onboarding?")) {
                          localStorage.removeItem("pz_customer_profile");
                          setProfile(null);
                        }
                      }}
                      className="w-full py-1.5 bg-white hover:bg-red-50 text-red-600 text-[10px] font-bold rounded-xl transition-colors border border-red-250"
                    >
                      Clear Cached Profile & Re-Onboard
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Dynamic Rating / Feedback Popup Overlay */}
      {showRatingId && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-5 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Rate & Review Driver</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Please share your experience with PingZo</p>
              </div>
              <button onClick={() => setShowRatingId(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="flex justify-center gap-1.5 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setRatingStars(star)}
                  className="p-star hover:scale-110 transition-transform"
                >
                  <Star className={`w-7 h-7 ${star <= ratingStars ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-500 font-semibold">Comments & Feedback</label>
              <textarea 
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Write a quick comment..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-orange-500 h-20 resize-none"
              />
            </div>

            <button 
              onClick={handleRateOrder}
              className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Submit Review
            </button>
          </div>
        </div>
      )}

      {/* Zepto-style Floating Cart Bar Overlay */}
      {activeTab === "browse" && cartItemsCount > 0 && (() => {
        const firstCartItemId = Object.keys(cart)[0];
        const firstCartItem = currentMenuItems.find(m => m.id === firstCartItemId);
        return (
          <div className="absolute bottom-16 left-4 right-4 bg-[#1C2025] text-white rounded-2xl p-2.5 flex items-center justify-between shadow-xl z-30 border border-slate-800 animate-bounce" style={{ animationDuration: "4s" }}>
            <div className="flex items-center gap-2.5 pl-1 text-left min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-base shrink-0">
                🚴
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black tracking-wide text-emerald-400 uppercase">Unlock free delivery</span>
                <span className="text-[9px] text-slate-300 font-bold truncate">
                  {cartSubtotal >= 150 ? "You've unlocked FREE Delivery!" : `Shop for ₹${(150 - cartSubtotal).toFixed(0)} more`}
                </span>
              </div>
            </div>
            <button 
              onClick={() => { setActiveTab("cart"); setCheckoutStep("cart_review"); }}
              className="bg-[#E01460] hover:bg-[#C21053] text-white pl-2.5 pr-4 py-1.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all shrink-0 shadow-lg hover:scale-105 active:scale-95"
            >
              {firstCartItem && (
                <img 
                  src={firstCartItem.image} 
                  alt="Preview" 
                  className="w-5 h-7 object-cover rounded-md border border-white/25"
                />
              )}
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] uppercase font-black tracking-wider">Cart</span>
                <span className="text-[8px] font-bold text-rose-100">{cartItemsCount} {cartItemsCount === 1 ? "item" : "items"}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 ml-1 text-white" />
            </button>
          </div>
        );
      })()}

      {/* Footer Navigation Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 py-1 flex items-center justify-around shrink-0 z-10 shadow-xs">
        <button 
          onClick={() => setActiveTab("browse")}
          className={`flex flex-col items-center p-1.5 transition-colors ${activeTab === "browse" ? "text-orange-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[9px] font-bold mt-0.5">Home</span>
        </button>

        <button 
          onClick={() => setActiveTab("tracking")}
          className={`flex flex-col items-center p-1.5 transition-colors ${activeTab === "tracking" ? "text-orange-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          <div className="relative">
            <MapPin className="w-4 h-4" />
            {showActiveTracking && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />}
          </div>
          <span className="text-[9px] font-bold mt-0.5">Track</span>
        </button>

        <button 
          onClick={() => { setActiveTab("profile"); setProfileSubView("none"); }}
          className={`flex flex-col items-center p-1.5 transition-colors ${activeTab === "profile" ? "text-orange-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          <User className="w-4 h-4" />
          <span className="text-[9px] font-bold mt-0.5">Profile</span>
        </button>
      </div>

    </div>
  );
}
