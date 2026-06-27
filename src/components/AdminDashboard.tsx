/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Users, BarChart3, Settings, BellRing, Compass, Layers, 
  MapPin, ShieldAlert, Sparkles, Sliders, CheckCircle2, XCircle, 
  RefreshCw, Star, Clock, PlusCircle, Trash2, Edit3, Save, Check, Play, Bike, ArrowRight, Layers3, ArrowUpRight, Activity, Zap
} from "lucide-react";
import { AppState, Order, OrderStatus, Driver, NotificationLog, MenuItem, PromoBanner, GSTConfig } from "../types.js";
import SimulatedMap from "./SimulatedMap.js";

interface AdminDashboardProps {
  state: AppState;
  onRefresh: () => void;
  onReset: () => void;
}

export default function AdminDashboard({ state, onRefresh, onReset }: AdminDashboardProps) {
  // Navigation tabs for stand-alone panel
  const [activeTab, setActiveTab] = useState<"orders" | "partners" | "products" | "stocks" | "analytics" | "promotions">("orders");
  const [fullscreenMode, setFullscreenMode] = useState<boolean>(false);

  // Fallback for dynamic menu items from state
  const currentMenuItems = state.menuItems && state.menuItems.length > 0 ? state.menuItems : [];

  // Banner CRUD & GST states
  const [showAddBannerModal, setShowAddBannerModal] = useState(false);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerDesc, setBannerDesc] = useState("");
  const [bannerBg, setBannerBg] = useState("from-amber-500 to-rose-600");
  const [bannerCode, setBannerCode] = useState("");
  const [bannerDiscountType, setBannerDiscountType] = useState<"flat_percentage" | "flat_amount" | "combo">("flat_amount");
  const [bannerDiscountValue, setBannerDiscountValue] = useState("");
  const [bannerMinCartValue, setBannerMinCartValue] = useState("");
  const [bannerComboItems, setBannerComboItems] = useState<string[]>([]);
  const [bannerIsActive, setBannerIsActive] = useState(true);

  // Editing banner state
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [editBannerTitle, setEditBannerTitle] = useState("");
  const [editBannerDesc, setEditBannerDesc] = useState("");
  const [editBannerBg, setEditBannerBg] = useState("");
  const [editBannerCode, setEditBannerCode] = useState("");
  const [editBannerDiscountType, setEditBannerDiscountType] = useState<"flat_percentage" | "flat_amount" | "combo">("flat_amount");
  const [editBannerDiscountValue, setEditBannerDiscountValue] = useState("");
  const [editBannerMinCartValue, setEditBannerMinCartValue] = useState("");
  const [editBannerComboItems, setEditBannerComboItems] = useState<string[]>([]);
  const [editBannerIsActive, setEditBannerIsActive] = useState(true);

  // GST rates state
  const [cgstRateInput, setCgstRateInput] = useState((state.gstConfig?.cgstRate ?? 2.5).toString());
  const [sgstRateInput, setSgstRateInput] = useState((state.gstConfig?.sgstRate ?? 2.5).toString());
  const [isUpdatingGST, setIsUpdatingGST] = useState(false);

  React.useEffect(() => {
    if (state.gstConfig) {
      setCgstRateInput(state.gstConfig.cgstRate.toString());
      setSgstRateInput(state.gstConfig.sgstRate.toString());
    }
  }, [state.gstConfig]);

  // Manual Assignment selection state
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  // Campaign form state
  const [campaignTitle, setCampaignTitle] = useState("⚡️ PingZo Premium Rush!");
  const [campaignBody, setCampaignBody] = useState("Organic veggies directly from green farms to your home in under 15 mins. Check now!");
  const [isDispatchingCampaign, setIsDispatchingCampaign] = useState(false);

  // Driver CRUD form states
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [partnerVehicle, setPartnerVehicle] = useState("E-Bike (Eco-Express)");
  const [partnerPlate, setPartnerPlate] = useState("");
  const [partnerStatus, setPartnerStatus] = useState<"idle" | "offline">("offline");
  const [partnerRating, setPartnerRating] = useState("5.0");

  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [editPartnerName, setEditPartnerName] = useState("");
  const [editPartnerPhone, setEditPartnerPhone] = useState("");
  const [editPartnerVehicle, setEditPartnerVehicle] = useState("");
  const [editPartnerPlate, setEditPartnerPlate] = useState("");
  const [editPartnerStatus, setEditPartnerStatus] = useState<"idle" | "offline">("offline");
  const [editPartnerRating, setEditPartnerRating] = useState("5.0");

  // Product CRUD form states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodOldPrice, setProdOldPrice] = useState("");
  const [prodWeight, setProdWeight] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodCategory, setProdCategory] = useState<"food" | "grocery">("grocery");
  const [prodSubCategory, setProdSubCategory] = useState("Vegetables");
  const [prodImage, setProdImage] = useState("");
  const [prodStock, setProdStock] = useState("20");
  const [prodGstRate, setProdGstRate] = useState("5"); // Default GST Rate

  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [editProdName, setEditProdName] = useState("");
  const [editProdPrice, setEditProdPrice] = useState("");
  const [editProdOldPrice, setEditProdOldPrice] = useState("");
  const [editProdWeight, setEditProdWeight] = useState("");
  const [editProdDesc, setEditProdDesc] = useState("");
  const [editProdCategory, setEditProdCategory] = useState<"food" | "grocery">("grocery");
  const [editProdSubCategory, setEditProdSubCategory] = useState("");
  const [editProdImage, setEditProdImage] = useState("");
  const [editProdStock, setEditProdStock] = useState("");
  const [editProdGstRate, setEditProdGstRate] = useState("");

  // Auto assignment toggler
  const handleToggleAutoAssign = async (enabled: boolean) => {
    try {
      const res = await fetch("/api/admin/toggle-auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled })
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTrial = async () => {
    try {
      const res = await fetch("/api/admin/toggle-trial", { method: "POST" });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Manual Driver Assignment Trigger
  const handleManualAssign = async () => {
    if (!assigningOrderId || !selectedDriverId) return;
    try {
      const res = await fetch("/api/admin/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: assigningOrderId, driverId: selectedDriverId })
      });
      if (res.ok) {
        setAssigningOrderId(null);
        setSelectedDriverId("");
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Rider Partner Call
  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName || !partnerPhone) return;

    try {
      const res = await fetch("/api/admin/driver/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: partnerName,
          phone: partnerPhone,
          vehicle: partnerVehicle,
          plateNumber: partnerPlate,
          status: partnerStatus,
          rating: Number(partnerRating) || 5.0,
          backgroundStatus: "approved"
        })
      });

      if (res.ok) {
        setShowAddPartnerModal(false);
        setPartnerName("");
        setPartnerPhone("");
        setPartnerPlate("");
        onRefresh();
      }
    } catch (err) {
      console.error("Error creating partner", err);
    }
  };

  // Update Rider Partner Call
  const handleUpdatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartnerId) return;

    try {
      const res = await fetch("/api/admin/driver/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPartnerId,
          name: editPartnerName,
          phone: editPartnerPhone,
          vehicle: editPartnerVehicle,
          plateNumber: editPartnerPlate,
          status: editPartnerStatus,
          rating: Number(editPartnerRating) || 5.0
        })
      });

      if (res.ok) {
        setEditingPartnerId(null);
        onRefresh();
      }
    } catch (err) {
      console.error("Error updating partner", err);
    }
  };

  // Delete Rider Partner Call
  const handleDeletePartner = async (driverId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to dismiss and delete delivery partner ${name}?`)) return;

    try {
      const res = await fetch("/api/admin/driver/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: driverId })
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error("Error deleting partner", err);
    }
  };

  // Admin Cancel Order
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm(`Are you sure you want to cancel order #${orderId}? This will trigger an instant refund.`)) return;

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
        alert(data.error || "Failed to cancel order.");
      }
    } catch (err) {
      console.error("Error cancelling order", err);
      alert("Network error while cancelling order.");
    }
  };

  // Create Dynamic Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice) return;

    try {
      const res = await fetch("/api/admin/product/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: prodName,
          price: Number(prodPrice),
          oldPrice: prodOldPrice ? Number(prodOldPrice) : undefined,
          weight: prodWeight || "1 unit",
          description: prodDesc,
          category: prodCategory,
          subCategory: prodSubCategory,
          image: prodImage,
          stock: Number(prodStock) || 20,
          gstRate: Number(prodGstRate) || 5
        })
      });

      if (res.ok) {
        setShowAddProductModal(false);
        setProdName("");
        setProdPrice("");
        setProdOldPrice("");
        setProdWeight("");
        setProdDesc("");
        setProdImage("");
        setProdStock("20");
        setProdGstRate("5");
        onRefresh();
      }
    } catch (err) {
      console.error("Error creating product", err);
    }
  };

  // Update Product Map / Category Controls
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProdId) return;

    try {
      const res = await fetch("/api/admin/product/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProdId,
          name: editProdName,
          price: Number(editProdPrice),
          oldPrice: editProdOldPrice ? Number(editProdOldPrice) : undefined,
          weight: editProdWeight,
          description: editProdDesc,
          category: editProdCategory,
          subCategory: editProdSubCategory,
          image: editProdImage,
          stock: Number(editProdStock),
          gstRate: Number(editProdGstRate)
        })
      });

      if (res.ok) {
        setEditingProdId(null);
        onRefresh();
      }
    } catch (err) {
      console.error("Error updating product", err);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (prodId: string, name: string) => {
    if (!window.confirm(`Remove ${name} from the active store catalog and inventory counts?`)) return;

    try {
      const res = await fetch("/api/admin/product/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prodId })
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error("Error deleting product", err);
    }
  };

  // Edit stock directly
  const handleUpdateStockQuantity = async (itemId: string, newQty: number) => {
    try {
      await fetch("/api/admin/update-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: newQty })
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Create Promo Banner Campaign
  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle || !bannerCode) return;

    try {
      const res = await fetch("/api/admin/banner/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: bannerTitle,
          desc: bannerDesc,
          bg: bannerBg,
          code: bannerCode.trim().toUpperCase(),
          discountType: bannerDiscountType,
          discountValue: Number(bannerDiscountValue) || 0,
          minCartValue: Number(bannerMinCartValue) || 0,
          comboItems: bannerDiscountType === "combo" ? bannerComboItems : [],
          isActive: bannerIsActive
        })
      });

      if (res.ok) {
        setShowAddBannerModal(false);
        setBannerTitle("");
        setBannerDesc("");
        setBannerBg("from-amber-500 to-rose-600");
        setBannerCode("");
        setBannerDiscountType("flat_amount");
        setBannerDiscountValue("");
        setBannerMinCartValue("");
        setBannerComboItems([]);
        setBannerIsActive(true);
        onRefresh();
      }
    } catch (err) {
      console.error("Error creating banner", err);
    }
  };

  // Update Promo Banner Campaign
  const handleUpdateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBannerId) return;

    try {
      const res = await fetch("/api/admin/banner/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingBannerId,
          title: editBannerTitle,
          desc: editBannerDesc,
          bg: editBannerBg,
          code: editBannerCode.trim().toUpperCase(),
          discountType: editBannerDiscountType,
          discountValue: Number(editBannerDiscountValue) || 0,
          minCartValue: Number(editBannerMinCartValue) || 0,
          comboItems: editBannerDiscountType === "combo" ? editBannerComboItems : [],
          isActive: editBannerIsActive
        })
      });

      if (res.ok) {
        setEditingBannerId(null);
        onRefresh();
      }
    } catch (err) {
      console.error("Error updating banner", err);
    }
  };

  // Delete Promo Banner Campaign
  const handleDeleteBanner = async (id: string, code: string) => {
    if (!window.confirm(`Delete promotion code ${code}?`)) return;

    try {
      const res = await fetch("/api/admin/banner/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error("Error deleting banner", err);
    }
  };

  // Update GST rates
  const handleUpdateGST = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingGST(true);

    try {
      const res = await fetch("/api/admin/gst/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cgstRate: Number(cgstRateInput) || 0,
          sgstRate: Number(sgstRateInput) || 0
        })
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error("Error updating GST configuration", err);
    } finally {
      setIsUpdatingGST(false);
    }
  };

  // Dispatch Marketing Promo notification
  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDispatchingCampaign(true);
    try {
      const res = await fetch("/api/marketing/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: campaignTitle, body: campaignBody })
      });
      if (res.ok) {
        setCampaignTitle("");
        setCampaignBody("");
        setTimeout(() => {
          setIsDispatchingCampaign(false);
          onRefresh();
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setIsDispatchingCampaign(false);
    }
  };

  // Calculate statistics for Analytics
  const totalOrdersCount = state.orders.length;
  const fulfilledOrders = state.orders.filter(o => o.status === OrderStatus.DELIVERED);
  const cancelledOrders = state.orders.filter(o => o.status === OrderStatus.CANCELLED);
  
  const totalRevenue = fulfilledOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalRefunded = cancelledOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  
  const fulfillmentRate = totalOrdersCount > 0 ? (fulfilledOrders.length / totalOrdersCount) * 100 : 100;
  const cancellationRate = totalOrdersCount > 0 ? (cancelledOrders.length / totalOrdersCount) * 100 : 0;

  // Extract list of all categories dynamically from menu items
  const categoriesList = Array.from(new Set(currentMenuItems.map(m => m.subCategory || (m.category === "food" ? "Food" : "Organic Mix"))));

  return (
    <div className={`flex flex-col h-full bg-white text-slate-800 font-sans border border-slate-200 rounded-3xl shadow-xs overflow-hidden transition-all ${
      fullscreenMode ? "fixed inset-4 z-40 bg-white border-2 border-slate-300 shadow-2xl" : ""
    }`} id="admin-web-panel-main">
      
      {/* Stand-alone Admin Web Panel Header */}
      <div className="bg-slate-950 text-white px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 pointer-events-none opacity-5">
          <Sparkles className="w-96 h-96 text-orange-500" />
        </div>
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black italic text-lg shadow-md animate-pulse">PZ</div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight flex items-center gap-1.5 text-white font-sans">
                PingZo Admin Control Tower <span className="text-orange-500 font-bold font-mono text-xs">v3.5 Enterprise</span>
              </h1>
              <span className="text-[9px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider font-bold">API Backend Live</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Real-time driver CRUD, stock mapping controllers, manual/auto dispatcher queue.</p>
          </div>
        </div>

        {/* Header CTA Tools */}
        <div className="flex items-center gap-3 z-10 text-xs">
          <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800">
            <button 
              onClick={() => handleToggleAutoAssign(true)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${state.autoAssignment ? "bg-orange-600 text-white shadow-xs" : "text-slate-400 hover:text-white"}`}
            >
              Auto AI Assist
            </button>
            <button 
              onClick={() => handleToggleAutoAssign(false)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${!state.autoAssignment ? "bg-slate-800 text-white shadow-xs" : "text-slate-400 hover:text-white"}`}
            >
              Manual Override
            </button>
          </div>

          <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800">
            <button 
              onClick={handleToggleTrial}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${state.isTrialMode ? "bg-emerald-600 text-white shadow-xs" : "text-slate-400 hover:text-white"}`}
            >
              <Zap className={`w-3 h-3 ${state.isTrialMode ? "fill-white" : ""}`} />
              <span>{state.isTrialMode ? "Trial Live" : "Production"}</span>
            </button>
          </div>

          <button 
            onClick={() => setFullscreenMode(!fullscreenMode)}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-300 font-bold font-mono flex items-center gap-1.5 transition-all text-[10px]"
            title="Toggle Standalone Fullscreen View"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-orange-400" />
            <span>{fullscreenMode ? "Exit Fullscreen" : "Standalone Web Panel"}</span>
          </button>

          <button 
            onClick={onReset}
            title="Reset system database"
            className="p-2 bg-rose-950/40 hover:bg-rose-900 text-rose-450 border border-rose-900/40 rounded-xl transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab Bar Subnavigation */}
      <div className="flex border-b border-slate-200 px-6 bg-slate-50 gap-2 shrink-0">
        {[
          { id: "orders", label: "Real-time Assigning", icon: Compass },
          { id: "partners", label: "Delivery Partners (CRUD)", icon: Users },
          { id: "products", label: "Product & Category Catalog", icon: Layers3 },
          { id: "stocks", label: "Stock Control", icon: Layers },
          { id: "promotions", label: "Dynamic Banners & GST", icon: Sliders },
          { id: "analytics", label: "Enterprise Analytics", icon: BarChart3 }
        ].map((tab) => {
          const IconComp = tab.icon;
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all relative ${
                activeTab === tab.id 
                  ? "border-orange-600 text-orange-600 font-extrabold" 
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === "partners" && state.drivers.filter(d => d.backgroundStatus === "pending").length > 0 && (
                <span className="absolute top-2 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">

        {/* System Backend Node Info (Conceptual java/mongo for enterprise feel) */}
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700/50 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/30 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <h3 className="text-xs font-black text-slate-200 tracking-wider uppercase">PingZo Backend Infrastructure</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono text-slate-500 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700 tracking-tighter">NODE_ID: PZO-SEA-01</span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/30">STABLE_PRODUCTION</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/40 p-3 rounded-xl flex items-center gap-3 group hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 bg-emerald-950/40 text-emerald-400 rounded-lg flex items-center justify-center border border-emerald-900/30 group-hover:scale-110 transition-transform">
                <Layers3 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Logic Engine</p>
                <h4 className="text-[11px] font-bold text-slate-200">Java Spring Boot</h4>
                <p className="text-[8px] text-emerald-400/80 font-mono mt-0.5 flex items-center gap-1">
                  <Check className="w-2 h-2" /> Microservices OK
                </p>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/40 p-3 rounded-xl flex items-center gap-3 group hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 bg-emerald-950/40 text-emerald-400 rounded-lg flex items-center justify-center border border-emerald-900/30 group-hover:scale-110 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Persistence</p>
                <h4 className="text-[11px] font-bold text-slate-200">MongoDB Atlas</h4>
                <p className="text-[8px] text-emerald-400/80 font-mono mt-0.5 flex items-center gap-1">
                  <Check className="w-2 h-2" /> Sharded Cluster
                </p>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/40 p-3 rounded-xl flex items-center gap-3 group hover:border-orange-500/30 transition-all">
              <div className="w-10 h-10 bg-orange-950/40 text-orange-400 rounded-lg flex items-center justify-center border border-orange-900/30 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">System Load</p>
                <h4 className="text-[11px] font-bold text-slate-200">CPU 14% | RAM 2GB</h4>
                <p className="text-[8px] text-orange-400/80 font-mono mt-0.5 flex items-center gap-1">
                  <Clock className="w-2 h-2" /> Response: 42ms
                </p>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/40 p-3 rounded-xl flex items-center gap-3 group hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 bg-emerald-950/40 text-emerald-400 rounded-lg flex items-center justify-center border border-emerald-900/30 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Security Node</p>
                <h4 className="text-[11px] font-bold text-slate-200">AES-256 Active</h4>
                <p className="text-[8px] text-emerald-400/80 font-mono mt-0.5 flex items-center gap-1">
                  <Check className="w-2 h-2" /> Zero Leaks
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 1: REAL-TIME ORDERS ASSIGNING */}
        {activeTab === "orders" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Live Telemetry Map & Orders table */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-orange-600" /> Active Dispatch Tracking Map
                  </h3>
                  <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-500 rounded-full" /> SOMA Store</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full" /> Home</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" /> Delivery Rider</span>
                  </div>
                </div>

                <SimulatedMap 
                  customerLocation={state.orders.find(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED)?.deliveryLocation}
                  restaurantLocation={state.orders.find(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED)?.restaurantLocation}
                  driverLocation={state.drivers.find(d => d.status === "delivering")?.currentLocation}
                  routeNodes={state.orders.find(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED)?.routeNodes}
                  height="h-64"
                />
              </div>

              {/* Real-time Order dispatch Queue */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-orange-600" /> Orders Assigning Board ({state.orders.length} in Queue)
                  </h3>
                  <span className="text-[10px] bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full border border-green-150 font-bold">LIVE SOCKET</span>
                </div>

                {state.orders.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-2 bg-white">
                    <ShieldAlert className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-xs font-bold text-slate-500">Logistics dispatch board is clear.</p>
                    <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Place an order from the client phone (left column) to populate the dispatcher queue.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[9px] border-b border-slate-200">
                        <tr>
                          <th className="p-4">Order Ref</th>
                          <th className="p-4">Customer Details</th>
                          <th className="p-4">Sourced From & To</th>
                          <th className="p-4">Billing Amount</th>
                          <th className="p-4">Assignee Partner</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Logistics Command</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {state.orders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-mono font-bold text-orange-600">#{order.id}</td>
                            <td className="p-4 font-sans">
                              <p className="font-extrabold text-slate-800">{order.customerName}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{order.customerPhone}</p>
                            </td>
                            <td className="p-4 text-[11px] max-w-[155px] truncate">
                              <p className="text-rose-600 font-bold truncate">🏪 {order.restaurantName}</p>
                              <p className="text-emerald-600 truncate mt-0.5">📍 {order.deliveryAddress}</p>
                            </td>
                            <td className="p-4 font-mono font-black text-slate-800">₹{order.totalPrice.toFixed(2)}</td>
                            <td className="p-4">
                              {order.driverName ? (
                                <div className="flex items-center gap-1.5">
                                  <Bike className="w-3.5 h-3.5 text-slate-500" />
                                  <span className="font-bold text-slate-700">{order.driverName}</span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 border border-amber-100 rounded font-black animate-pulse">Awaiting Assignment</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                                order.status === OrderStatus.DELIVERED ? "bg-green-50 text-green-700 border-green-150" :
                                order.status === OrderStatus.CANCELLED ? "bg-red-50 text-red-700 border-red-150" :
                                "bg-orange-50 text-orange-700 border-orange-150"
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-4">
                              {!state.autoAssignment && order.status === OrderStatus.PENDING && (
                                <button 
                                  onClick={() => setAssigningOrderId(order.id)}
                                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-[10px] rounded-xl transition-all shadow-xs flex items-center gap-1"
                                >
                                  <Sliders className="w-3 h-3" />
                                  <span>Assign Rider</span>
                                </button>
                              )}
                              {order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED && (
                                <button 
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="mt-1 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[9px] rounded-lg border border-red-100 transition-all flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3" />
                                  <span>Cancel</span>
                                </button>
                              )}
                              {order.status === OrderStatus.DELIVERED && order.rating && (
                                <div className="flex items-center gap-1 text-amber-500">
                                  <Star className="w-3 h-3 fill-amber-500" />
                                  <span className="font-bold text-[11px]">{order.rating} Stars</span>
                                </div>
                              )}
                              {order.status === OrderStatus.CANCELLED && (
                                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">Refunded</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Alerts & Onboarding Mini Panel */}
            <div className="space-y-6">
              
              {/* Dispatch notification center */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3 shadow-xs">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-orange-600 animate-bounce" /> Control Tower Alert Feed
                </h3>

                <div className="h-56 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {state.notifications.map((log) => (
                    <div key={log.id} className={`p-3 rounded-2xl border leading-relaxed ${
                      log.type === "order" ? "bg-orange-50/30 border-orange-100 text-orange-950" :
                      log.type === "marketing" ? "bg-indigo-50/30 border-indigo-100 text-indigo-950" :
                      "bg-amber-50/30 border-amber-100 text-amber-950"
                    }`}>
                      <div className="flex justify-between items-center font-bold text-[9px] border-b border-black/5 pb-1">
                        <span className="uppercase tracking-wider">[{log.type}] {log.title}</span>
                        <span className="text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="mt-1 text-slate-600 text-[10px] leading-relaxed font-medium">{log.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Onboarding mini verify */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-orange-600" /> Onboarding Inbox
                  </h3>
                  <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">Fast-track verification requests from delivery applicants.</p>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {state.drivers.filter(d => d.backgroundStatus === "pending").length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 space-y-2">
                      <CheckCircle2 className="w-8 h-8 mx-auto text-green-600" />
                      <p className="text-[10px] font-bold text-slate-700">All partners cleared!</p>
                      <p className="text-[9px] leading-snug">Register new delivery partners in the Onboarding tab.</p>
                    </div>
                  ) : (
                    state.drivers.filter(d => d.backgroundStatus === "pending").map((driver) => (
                      <div key={driver.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-150 space-y-2">
                        <div className="flex items-center gap-2">
                          <img src={driver.avatar} className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold text-slate-800 truncate">{driver.name}</p>
                            <p className="text-[9px] text-slate-400 font-mono truncate">{driver.phone}</p>
                          </div>
                        </div>
                        <div className="text-[9px] text-slate-500 font-medium">
                          Vehicle: <span className="text-slate-800 font-bold">{driver.vehicle}</span>
                        </div>
                        <button 
                          onClick={async () => {
                            try {
                              const res = await fetch("/api/admin/approve-driver", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ driverId: driver.id })
                              });
                              if (res.ok) onRefresh();
                            } catch (e) { console.error(e); }
                          }}
                          className="w-full py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-[9px] font-black transition-colors"
                        >
                          Approve Partner Shift
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: DELIVERY PARTNERS CRUD */}
        {activeTab === "partners" && (
          <div className="space-y-6 text-left">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-orange-600" /> Fleet Logistics Partners Management (CRUD)
                </h2>
                <p className="text-xs text-slate-400 mt-1">Register, modify, query, and terminate active and pending delivery personnel profiles.</p>
              </div>
              <button 
                onClick={() => setShowAddPartnerModal(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Onboard New Partner</span>
              </button>
            </div>

            {/* List of Registered Partners */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.drivers.map((driver) => {
                const isEditing = editingPartnerId === driver.id;
                return (
                  <div key={driver.id} className={`bg-white rounded-3xl border p-5 space-y-4 shadow-xs relative transition-all ${
                    isEditing ? "border-orange-500 ring-2 ring-orange-500/20" : "border-slate-200 hover:border-slate-300"
                  }`}>
                    {/* Badge status */}
                    <div className="absolute right-4 top-4 flex gap-1.5 items-center">
                      <span className={`text-[8px] font-mono font-extrabold px-2 py-0.5 rounded-full border uppercase ${
                        driver.backgroundStatus === "pending" ? "bg-amber-50 text-amber-700 border-amber-150 animate-pulse" : "bg-green-50 text-green-700 border-green-150"
                      }`}>
                        {driver.backgroundStatus === "pending" ? "Pending Approval" : "Approved"}
                      </span>
                      <span className={`text-[8px] font-mono font-extrabold px-2 py-0.5 rounded-full border uppercase ${
                        driver.status === "idle" ? "bg-green-50 text-green-700 border-green-150" : 
                        driver.status === "delivering" ? "bg-orange-50 text-orange-700 border-orange-150" :
                        "bg-slate-100 text-slate-500 border-slate-200"
                      }`}>
                        {driver.status}
                      </span>
                    </div>

                    {isEditing ? (
                      <form onSubmit={handleUpdatePartner} className="space-y-3 pt-4 text-xs font-medium">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-bold uppercase text-[8px]">Rider Name</label>
                          <input 
                            type="text" 
                            value={editPartnerName}
                            onChange={(e) => setEditPartnerName(e.target.value)}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 font-bold uppercase text-[8px]">Phone Number</label>
                          <input 
                            type="text" 
                            value={editPartnerPhone}
                            onChange={(e) => setEditPartnerPhone(e.target.value)}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-slate-400 font-bold uppercase text-[8px]">Vehicle</label>
                            <select 
                              value={editPartnerVehicle}
                              onChange={(e) => setEditPartnerVehicle(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800"
                            >
                              <option>E-Bike (Eco-Express)</option>
                              <option>Electric Sedan (Bolt)</option>
                              <option>Motorcycle (Pulsar)</option>
                              <option>Heavy Van (Eco-Truck)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-400 font-bold uppercase text-[8px]">Plate</label>
                            <input 
                              type="text" 
                              value={editPartnerPlate}
                              onChange={(e) => setEditPartnerPlate(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-slate-400 font-bold uppercase text-[8px]">Status</label>
                            <select 
                              value={editPartnerStatus}
                              onChange={(e) => setEditPartnerStatus(e.target.value as any)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800"
                            >
                              <option value="idle">Idle</option>
                              <option value="offline">Offline</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-400 font-bold uppercase text-[8px]">Rating</label>
                            <input 
                              type="number" 
                              step="0.1" 
                              min="1" 
                              max="5"
                              value={editPartnerRating}
                              onChange={(e) => setEditPartnerRating(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 text-[10px]">
                          <button 
                            type="button" 
                            onClick={() => setEditingPartnerId(null)}
                            className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            className="flex-1 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold flex items-center justify-center gap-1"
                          >
                            <Save className="w-3.5 h-3.5" /> Save Partner
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                            <img src={driver.avatar} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-extrabold text-slate-800 truncate">{driver.name}</h4>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{driver.phone}</p>
                            <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-[10px] font-bold">
                              <span>★ {driver.rating} Rating</span>
                              <span>•</span>
                              <span>{driver.completedDeliveries || 0} Deliveries</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 text-[10px] text-slate-600 space-y-1 font-mono">
                          <div><span className="font-bold text-slate-400">VEHICLE CLASS:</span> {driver.vehicle}</div>
                          <div><span className="font-bold text-slate-400">LICENSE PLATE:</span> {driver.plateNumber || "PZ-VERIFIED"}</div>
                          <div><span className="font-bold text-slate-400">PARTNER ID:</span> {driver.id}</div>
                        </div>

                        {/* Actions row */}
                        <div className="flex justify-between items-center pt-2 text-xs border-t border-slate-100">
                          <button 
                            onClick={() => {
                              setEditingPartnerId(driver.id);
                              setEditPartnerName(driver.name);
                              setEditPartnerPhone(driver.phone);
                              setEditPartnerVehicle(driver.vehicle);
                              setEditPartnerPlate(driver.plateNumber || "");
                              setEditPartnerStatus(driver.status === "delivering" ? "idle" : driver.status);
                              setEditPartnerRating(String(driver.rating));
                            }}
                            className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                          </button>
                          
                          <button 
                            onClick={() => handleDeletePartner(driver.id, driver.name)}
                            className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove Partner
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS & CATEGORY CATALOG MANAGER */}
        {activeTab === "products" && (
          <div className="space-y-6 text-left">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Layers3 className="w-4 h-4 text-orange-600" /> Product Inventory & Dynamic Category Mapping (CRUD)
                </h2>
                <p className="text-xs text-slate-400 mt-1">Configure organic packages, map catalog nodes dynamically, and edit category structures.</p>
              </div>
              <button 
                onClick={() => setShowAddProductModal(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publish New Product</span>
              </button>
            </div>

            {/* List of Dynamic Catalog Products */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-150 flex justify-between items-center bg-slate-50/50">
                <span className="text-xs font-black uppercase text-slate-600 tracking-wider">Store Catalog Inventory Items ({currentMenuItems.length})</span>
                <span className="text-[10px] text-slate-400 font-mono font-semibold">EDIT DIRECTLY IN THE TABLE</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[9px] border-b border-slate-200">
                    <tr>
                      <th className="p-4">Visual</th>
                      <th className="p-4">Product ID / Item Name</th>
                      <th className="p-4">Retail Price</th>
                      <th className="p-4">Listing Specs</th>
                      <th className="p-4">Category Node Mapping</th>
                      <th className="p-4">GST Configuration</th>
                      <th className="p-4">Stock Level</th>
                      <th className="p-4">Logistics Management</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {currentMenuItems.map((prod) => {
                      const isEditing = editingProdId === prod.id;
                      const stock = state.inventory?.[prod.id] ?? 0;
                      return (
                        <tr key={prod.id} className={`hover:bg-slate-50/30 transition-colors ${
                          isEditing ? "bg-orange-50/20" : ""
                        }`}>
                          <td className="p-4">
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200/80 shadow-xs bg-slate-50 flex items-center justify-center">
                              <img src={prod.image} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="p-4">
                            {isEditing ? (
                              <div className="space-y-1.5 max-w-xs">
                                <input 
                                  type="text" 
                                  value={editProdName}
                                  onChange={(e) => setEditProdName(e.target.value)}
                                  className="w-full border border-slate-200 bg-white rounded px-2 py-1 text-xs text-slate-850 font-bold"
                                />
                                <input 
                                  type="text" 
                                  value={editProdDesc}
                                  onChange={(e) => setEditProdDesc(e.target.value)}
                                  className="w-full border border-slate-200 bg-white rounded px-2 py-0.5 text-[10px] text-slate-500"
                                  placeholder="Description"
                                />
                              </div>
                            ) : (
                              <div>
                                <h4 className="font-extrabold text-slate-800 text-xs">{prod.name}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5 max-w-xs truncate" title={prod.description}>{prod.description}</p>
                                <span className="text-[9px] font-mono text-orange-600 font-bold mt-1 block">ID: {prod.id}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-4 font-mono">
                            {isEditing ? (
                              <div className="space-y-1.5 w-20">
                                <input 
                                  type="number" 
                                  value={editProdPrice}
                                  onChange={(e) => setEditProdPrice(e.target.value)}
                                  className="w-full border border-slate-200 bg-white rounded px-1.5 py-0.5 text-xs text-slate-850"
                                />
                                <input 
                                  type="number" 
                                  value={editProdOldPrice}
                                  onChange={(e) => setEditProdOldPrice(e.target.value)}
                                  placeholder="Old price"
                                  className="w-full border border-slate-200 bg-white rounded px-1.5 py-0.5 text-[10px] text-slate-400"
                                />
                              </div>
                            ) : (
                              <div>
                                <span className="font-extrabold text-slate-800">₹{prod.price}</span>
                                {prod.oldPrice && (
                                  <span className="text-[10px] text-slate-400 line-through block mt-0.5">₹{prod.oldPrice}</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            {isEditing ? (
                              <input 
                                type="text" 
                                value={editProdWeight}
                                onChange={(e) => setEditProdWeight(e.target.value)}
                                className="w-20 border border-slate-200 bg-white rounded px-2 py-0.5 text-xs text-slate-850"
                              />
                            ) : (
                              <span className="font-semibold text-slate-600">{prod.weight || "1 unit"}</span>
                            )}
                          </td>
                          <td className="p-4">
                            {isEditing ? (
                              <div className="space-y-1.5 w-28">
                                <select 
                                  value={editProdCategory}
                                  onChange={(e) => setEditProdCategory(e.target.value as any)}
                                  className="w-full border border-slate-200 bg-white rounded px-2 py-0.5 text-xs text-slate-850"
                                >
                                  <option value="grocery">Grocery Catalog</option>
                                  <option value="food">Restaurant Food</option>
                                </select>
                                <input 
                                  type="text" 
                                  value={editProdSubCategory}
                                  onChange={(e) => setEditProdSubCategory(e.target.value)}
                                  placeholder="Subcategory/Category"
                                  className="w-full border border-slate-200 bg-white rounded px-2 py-0.5 text-[10px] text-slate-850"
                                />
                              </div>
                            ) : (
                              <div>
                                <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full block text-center truncate">
                                  {prod.category === "grocery" ? "Grocery" : "Food Menu"}
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold block mt-1.5 text-center truncate">
                                  📂 {prod.subCategory || "General"}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            {isEditing ? (
                              <div className="space-y-1.5 w-16">
                                <label className="text-[8px] text-slate-400 font-bold uppercase">GST %</label>
                                <input 
                                  type="number" 
                                  value={editProdGstRate}
                                  onChange={(e) => setEditProdGstRate(e.target.value)}
                                  className="w-full border border-slate-200 bg-white rounded px-2 py-0.5 text-xs text-slate-850 font-bold"
                                />
                              </div>
                            ) : (
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                (prod.gstRate || 0) === 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-purple-50 text-purple-600 border-purple-100"
                              }`}>
                                {prod.gstRate || 0}%
                              </span>
                            )}
                          </td>
                          <td className="p-4 font-mono font-bold">
                            {isEditing ? (
                              <input 
                                type="number" 
                                value={editProdStock}
                                onChange={(e) => setEditProdStock(e.target.value)}
                                className="w-16 border border-slate-200 bg-white rounded px-2 py-0.5 text-xs text-slate-850"
                              />
                            ) : (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                stock === 0 ? "bg-rose-50 text-rose-600 border border-rose-100" :
                                stock <= 5 ? "bg-amber-50 text-amber-600 border border-amber-100 animate-pulse" :
                                "bg-green-50 text-green-700 border border-green-100"
                              }`}>
                                {stock} units
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {isEditing ? (
                              <div className="flex gap-1">
                                <button 
                                  onClick={handleUpdateProduct}
                                  className="p-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                                  title="Save Changes"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => setEditingProdId(null)}
                                  className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg transition-colors"
                                  title="Cancel Editing"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    setEditingProdId(prod.id);
                                    setEditProdName(prod.name);
                                    setEditProdDesc(prod.description);
                                    setEditProdPrice(String(prod.price));
                                    setEditProdOldPrice(prod.oldPrice ? String(prod.oldPrice) : "");
                                    setEditProdWeight(prod.weight || "");
                                    setEditProdCategory(prod.category);
                                    setEditProdSubCategory(prod.subCategory || "General");
                                    setEditProdImage(prod.image);
                                    setEditProdStock(String(stock));
                                    setEditProdGstRate(String(prod.gstRate || 0));
                                  }}
                                  className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                  className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STOCK CONTROL GRID */}
        {activeTab === "stocks" && (
          <div className="space-y-6 text-left">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-orange-600" /> Granular Stock Control Panel
              </h2>
              <p className="text-xs text-slate-400 mt-1">Audit current on-hand quantities, adjust mapping thresholds, and run stock bulk changes.</p>
            </div>

            {/* Organize products by Category */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {categoriesList.map((category) => {
                const categoryItems = currentMenuItems.filter(item => 
                  item.subCategory === category || (!item.subCategory && category === "General")
                );

                if (categoryItems.length === 0) return null;

                return (
                  <div key={category} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">📂 {category}</h3>
                      <span className="text-[10px] text-slate-400 font-bold">{categoryItems.length} Products Mapped</span>
                    </div>

                    <div className="space-y-3">
                      {categoryItems.map((item) => {
                        const stock = state.inventory?.[item.id] ?? 0;
                        return (
                          <div key={item.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-150 flex items-center justify-between text-xs transition-all hover:bg-slate-100/50">
                            <div className="flex-1 min-w-0 pr-4">
                              <h4 className="font-extrabold text-slate-800 truncate">{item.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                {stock === 0 ? (
                                  <span className="text-[8px] bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded font-black uppercase">OUT OF STOCK</span>
                                ) : stock <= 5 ? (
                                  <span className="text-[8px] bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.2 rounded font-black uppercase animate-pulse">ONLY {stock} LEFT</span>
                                ) : (
                                  <span className="text-[8px] bg-green-50 text-green-700 border border-green-150 px-1.5 py-0.2 rounded font-bold uppercase">{stock} STOCKED</span>
                                )}
                              </div>
                            </div>

                            {/* Stock increment/decrement inline tools */}
                            <div className="flex items-center gap-2 shrink-0">
                              <button 
                                onClick={() => handleUpdateStockQuantity(item.id, Math.max(0, stock - 1))}
                                className="w-7 h-7 bg-white hover:bg-slate-200 rounded-lg text-slate-600 border border-slate-200 font-extrabold flex items-center justify-center transition-all"
                              >
                                -
                              </button>
                              
                              <input 
                                type="number" 
                                min="0" 
                                value={stock}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  if (!isNaN(val) && val >= 0) {
                                    handleUpdateStockQuantity(item.id, val);
                                  }
                                }}
                                className="w-12 text-center bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-xs font-black text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                              />

                              <button 
                                onClick={() => handleUpdateStockQuantity(item.id, stock + 1)}
                                className="w-7 h-7 bg-white hover:bg-slate-200 rounded-lg text-slate-600 border border-slate-200 font-extrabold flex items-center justify-center transition-all"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: REPORTS & ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            
            {/* Key performance metrics cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Sales Revenue</p>
                <p className="text-2xl font-black text-green-700 mt-2">₹{totalRevenue.toFixed(2)}</p>
                <div className="text-[9px] text-slate-400 mt-1">From {fulfilledOrders.length} settled deliveries</div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Automated Refunds Out</p>
                <p className="text-2xl font-black text-rose-600 mt-2">₹{totalRefunded.toFixed(2)}</p>
                <div className="text-[9px] text-slate-400 mt-1">From {cancelledOrders.length} cancellations</div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Dispatch Time</p>
                <p className="text-2xl font-black text-orange-600 mt-2">11.8 Mins</p>
                <div className="text-[9px] text-green-600 font-semibold mt-1">AI Fast-Tracking Active!</div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fulfillment Rate</p>
                <p className="text-2xl font-black text-slate-800 mt-2">{fulfillmentRate.toFixed(1)}%</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-200">
                  <div className="bg-orange-600 h-full rounded-full" style={{ width: `${fulfillmentRate}%` }} />
                </div>
              </div>
            </div>

            {/* Marketing push creator */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
              
              {/* Promo Creator Form */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3">
                  <BellRing className="w-4 h-4 text-orange-600 animate-pulse" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">Blast Marketing Promo Notification</h3>
                </div>

                <form onSubmit={handleSendCampaign} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-semibold">Notification Title</label>
                    <input 
                      type="text" 
                      value={campaignTitle}
                      onChange={(e) => setCampaignTitle(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-semibold">Message Body</label>
                    <textarea 
                      value={campaignBody}
                      onChange={(e) => setCampaignBody(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-orange-500 h-20 resize-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isDispatchingCampaign}
                    className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    {isDispatchingCampaign ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>🚀 Push to Customers' Lockscreen</>
                    )}
                  </button>
                </form>
              </div>

              {/* simulated lock screen visualizer */}
              <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4 shadow-md">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-orange-400">Lockscreen Preview Mockup</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Live visualization of broadcast push notification on active customer mobile screens.</p>
                </div>

                <div className="p-4 bg-white/10 rounded-2xl border border-white/10 text-white space-y-2 max-w-sm mx-auto shadow-sm relative overflow-hidden backdrop-blur-md">
                  <div className="flex justify-between items-center text-[8px] text-slate-300">
                    <span className="flex items-center gap-1">🔔 <span className="font-bold">PINGZO DISPATCH</span></span>
                    <span>now</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{campaignTitle || "Promo Alert!"}</h4>
                  <p className="text-[10px] text-slate-200 leading-normal">{campaignBody || "Notification body text."}</p>
                </div>

                <p className="text-[9px] text-slate-400 text-center">Alert notifications automatically logs in user dashboard under Marketing alerts.</p>
              </div>

            </div>

          </div>
        )}

        {/* TAB 6: DYNAMIC PROMOTIONS & GST CONTROL PANEL */}
        {activeTab === "promotions" && (
          <div className="space-y-6 text-left">
            
            {/* GST Rates configuration */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-orange-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Tax Configurations (GST)</h3>
                    <p className="text-[10px] text-slate-400 leading-tight">Define Central and State Tax Rates applied to orders during checkout.</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100 font-extrabold">LIVE</span>
              </div>

              <form onSubmit={handleUpdateGST} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold">Central GST (CGST %)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.05"
                      min="0"
                      max="50"
                      value={cgstRateInput}
                      onChange={(e) => setCgstRateInput(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-orange-500 font-mono"
                    />
                    <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold">State GST (SGST %)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.05"
                      min="0"
                      max="50"
                      value={sgstRateInput}
                      onChange={(e) => setSgstRateInput(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-orange-500 font-mono"
                    />
                    <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isUpdatingGST}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  {isUpdatingGST ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save GST Configurations
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Promo Campaign Manager */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Dynamic Campaign Banners & Coupons</h3>
                  <p className="text-[10px] text-slate-400">Manage interactive banners, flat rates, percentages, and combo discounts.</p>
                </div>
                <button
                  onClick={() => setShowAddBannerModal(true)}
                  className="py-1.5 px-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" /> Add Campaign Banner
                </button>
              </div>

              {/* Banners List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {(state.banners && state.banners.length > 0 ? state.banners : []).map((banner) => {
                  const isCombo = banner.discountType === "combo";
                  return (
                    <div key={banner.id} className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between shadow-xs space-y-4 relative overflow-hidden">
                      {/* Quick Banner Preview Area */}
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${banner.bg} text-white space-y-2 relative shadow-xs`}>
                        <div className="flex justify-between items-start">
                          <span className="bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider font-mono uppercase">{banner.discountType.replace("_", " ")}</span>
                          <span className="bg-white text-slate-900 px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest font-mono">{banner.code}</span>
                        </div>
                        <h4 className="text-xs font-extrabold">{banner.title}</h4>
                        <p className="text-[9px] opacity-90 leading-relaxed">{banner.desc}</p>
                      </div>

                      {/* Campaign Detail Indicators */}
                      <div className="grid grid-cols-3 gap-2 text-[10px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block font-semibold">Min Cart Value</span>
                          <span className="font-bold text-slate-700">₹{banner.minCartValue}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold">Discount value</span>
                          <span className="font-bold text-slate-700">
                            {banner.discountType === "flat_percentage" ? `${banner.discountValue}%` : `₹${banner.discountValue}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold">Status</span>
                          <span className={`font-bold ${banner.isActive ? "text-emerald-600" : "text-slate-400"}`}>
                            {banner.isActive ? "● Active" : "○ Paused"}
                          </span>
                        </div>
                      </div>

                      {isCombo && banner.comboItems && banner.comboItems.length > 0 && (
                        <div className="text-[9px] bg-purple-50/75 border border-purple-100 rounded-xl p-2.5">
                          <span className="text-purple-600 font-bold block mb-1">Required Combo Items:</span>
                          <div className="flex flex-wrap gap-1">
                            {banner.comboItems.map(itemId => {
                              const match = currentMenuItems.find(m => m.id === itemId);
                              return (
                                <span key={itemId} className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-md font-medium">
                                  {match ? match.name : itemId}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Management Controls */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-[8px] text-slate-400 font-mono uppercase">ID: {banner.id}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingBannerId(banner.id);
                              setEditBannerTitle(banner.title);
                              setEditBannerDesc(banner.desc);
                              setEditBannerBg(banner.bg);
                              setEditBannerCode(banner.code);
                              setEditBannerDiscountType(banner.discountType);
                              setEditBannerDiscountValue(banner.discountValue.toString());
                              setEditBannerMinCartValue(banner.minCartValue.toString());
                              setEditBannerComboItems(banner.comboItems || []);
                              setEditBannerIsActive(banner.isActive);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100"
                            title="Edit Campaign Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(banner.id, banner.code)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-slate-100"
                            title="Delete Campaign Code"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* MODAL 1: ADD NEW PARTNER (CRUD Create) */}
      {showAddPartnerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl text-left text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1"><Users className="w-4 h-4 text-orange-600" /> Onboard Fleet Partner</h4>
              <button onClick={() => setShowAddPartnerModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleCreatePartner} className="space-y-3 font-medium">
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold">Rider Full Name</label>
                <input 
                  type="text" 
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="e.g. John Miller"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-semibold">Rider Phone Connection</label>
                <input 
                  type="text" 
                  value={partnerPhone}
                  onChange={(e) => setPartnerPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 111-2222"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-semibold">Vehicle Transport Class</label>
                <select 
                  value={partnerVehicle} 
                  onChange={(e) => setPartnerVehicle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                >
                  <option>E-Bike (Eco-Express)</option>
                  <option>Electric Sedan (Bolt)</option>
                  <option>Motorcycle (Pulsar)</option>
                  <option>Heavy Van (Eco-Truck)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-semibold">License Plate Number</label>
                <input 
                  type="text" 
                  value={partnerPlate}
                  onChange={(e) => setPartnerPlate(e.target.value)}
                  placeholder="e.g. PZ-8761"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddPartnerModal(false)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-bold text-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-center"
                >
                  Onboard Rider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW PRODUCT (Catalog Dynamic adding) */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl text-left text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1"><Layers3 className="w-4 h-4 text-orange-600" /> Launch New Product</h4>
              <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 font-medium">
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold">Product Name</label>
                <input 
                  type="text" 
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Organic Strawberries"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Retail Price (₹)</label>
                  <input 
                    type="number" 
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="99"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Old/Strike Price (₹)</label>
                  <input 
                    type="number" 
                    value={prodOldPrice}
                    onChange={(e) => setProdOldPrice(e.target.value)}
                    placeholder="120"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Weight/Pack Spec</label>
                  <input 
                    type="text" 
                    value={prodWeight}
                    onChange={(e) => setProdWeight(e.target.value)}
                    placeholder="250 g"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Initial Stock Level</label>
                  <input 
                    type="number" 
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Major Category</label>
                  <select 
                    value={prodCategory} 
                    onChange={(e) => setProdCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  >
                    <option value="grocery">Grocery Catalog</option>
                    <option value="food">Restaurant Food</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Dynamic SubCategory</label>
                  <input 
                    type="text" 
                    value={prodSubCategory}
                    onChange={(e) => setProdSubCategory(e.target.value)}
                    placeholder="e.g. Fruits, Beverages"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-semibold">Product Description</label>
                <textarea 
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Describe health merits, source details, etc."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none h-14 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Image Asset URL (Optional)</label>
                  <input 
                    type="text" 
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Indian GST Rate (%)</label>
                  <input 
                    type="number" 
                    value={prodGstRate}
                    onChange={(e) => setProdGstRate(e.target.value)}
                    placeholder="5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddProductModal(false)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-bold text-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-center"
                >
                  Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD NEW PROMO BANNER */}
      {showAddBannerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl text-left text-xs font-sans">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1">
                <Sliders className="w-4 h-4 text-orange-600" /> Create Campaign Banner
              </h4>
              <button onClick={() => setShowAddBannerModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateBanner} className="space-y-3 font-medium">
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold">Banner Campaign Title</label>
                <input 
                  type="text" 
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="e.g. ⚡️ PingZo Premium Rush!"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-semibold">Description / Terms</label>
                <input 
                  type="text" 
                  value={bannerDesc}
                  onChange={(e) => setBannerDesc(e.target.value)}
                  placeholder="e.g. Get Flat ₹50 OFF above ₹199"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Coupon Code</label>
                  <input 
                    type="text" 
                    value={bannerCode}
                    onChange={(e) => setBannerCode(e.target.value)}
                    placeholder="e.g. PINGZO50"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none font-mono uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Theme Gradient BG</label>
                  <select 
                    value={bannerBg}
                    onChange={(e) => setBannerBg(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  >
                    <option value="from-amber-500 to-rose-600">Golden Sunset</option>
                    <option value="from-emerald-500 to-cyan-600">Emerald Forest</option>
                    <option value="from-purple-600 to-indigo-700">Cosmic Twilight</option>
                    <option value="from-pink-500 to-red-600">Cherry Rush</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Discount Category</label>
                  <select 
                    value={bannerDiscountType}
                    onChange={(e) => setBannerDiscountType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  >
                    <option value="flat_amount">Flat Rupees (₹) Off</option>
                    <option value="flat_percentage">Flat Percentage (%) Off</option>
                    <option value="combo">Combo Specific Bundle Off</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Discount Val (₹ or %)</label>
                  <input 
                    type="number" 
                    value={bannerDiscountValue}
                    onChange={(e) => setBannerDiscountValue(e.target.value)}
                    placeholder="e.g. 50"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Min. Subtotal Required</label>
                  <input 
                    type="number" 
                    value={bannerMinCartValue}
                    onChange={(e) => setBannerMinCartValue(e.target.value)}
                    placeholder="e.g. 199"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Active Status</label>
                  <select 
                    value={bannerIsActive ? "true" : "false"}
                    onChange={(e) => setBannerIsActive(e.target.value === "true")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  >
                    <option value="true">Active & Visible</option>
                    <option value="false">Paused & Hidden</option>
                  </select>
                </div>
              </div>

              {bannerDiscountType === "combo" && (
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Select Required Combo Items</label>
                  <div className="border border-slate-200 rounded-xl p-2.5 max-h-24 overflow-y-auto space-y-1.5 bg-slate-50">
                    {currentMenuItems.map(item => {
                      const isChecked = bannerComboItems.includes(item.id);
                      return (
                        <label key={item.id} className="flex items-center gap-2 text-[10px] cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setBannerComboItems(bannerComboItems.filter(id => id !== item.id));
                              } else {
                                setBannerComboItems([...bannerComboItems, item.id]);
                              }
                            }}
                            className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                          />
                          <span>{item.name} (₹{item.price})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddBannerModal(false)}
                  className="py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-bold text-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-center"
                >
                  Create Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: EDIT PROMO BANNER */}
      {editingBannerId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl text-left text-xs font-sans">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1">
                <Sliders className="w-4 h-4 text-orange-600" /> Edit Campaign Banner
              </h4>
              <button onClick={() => setEditingBannerId(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleUpdateBanner} className="space-y-3 font-medium">
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold">Banner Campaign Title</label>
                <input 
                  type="text" 
                  value={editBannerTitle}
                  onChange={(e) => setEditBannerTitle(e.target.value)}
                  placeholder="e.g. ⚡️ PingZo Premium Rush!"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-semibold">Description / Terms</label>
                <input 
                  type="text" 
                  value={editBannerDesc}
                  onChange={(e) => setEditBannerDesc(e.target.value)}
                  placeholder="e.g. Get Flat ₹50 OFF above ₹199"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Coupon Code</label>
                  <input 
                    type="text" 
                    value={editBannerCode}
                    onChange={(e) => setEditBannerCode(e.target.value)}
                    placeholder="e.g. PINGZO50"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none font-mono uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Theme Gradient BG</label>
                  <select 
                    value={editBannerBg}
                    onChange={(e) => setEditBannerBg(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  >
                    <option value="from-amber-500 to-rose-600">Golden Sunset</option>
                    <option value="from-emerald-500 to-cyan-600">Emerald Forest</option>
                    <option value="from-purple-600 to-indigo-700">Cosmic Twilight</option>
                    <option value="from-pink-500 to-red-600">Cherry Rush</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Discount Category</label>
                  <select 
                    value={editBannerDiscountType}
                    onChange={(e) => setEditBannerDiscountType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  >
                    <option value="flat_amount">Flat Rupees (₹) Off</option>
                    <option value="flat_percentage">Flat Percentage (%) Off</option>
                    <option value="combo">Combo Specific Bundle Off</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Discount Val (₹ or %)</label>
                  <input 
                    type="number" 
                    value={editBannerDiscountValue}
                    onChange={(e) => setEditBannerDiscountValue(e.target.value)}
                    placeholder="e.g. 50"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Min. Subtotal Required</label>
                  <input 
                    type="number" 
                    value={editBannerMinCartValue}
                    onChange={(e) => setEditBannerMinCartValue(e.target.value)}
                    placeholder="e.g. 199"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Active Status</label>
                  <select 
                    value={editBannerIsActive ? "true" : "false"}
                    onChange={(e) => setEditBannerIsActive(e.target.value === "true")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  >
                    <option value="true">Active & Visible</option>
                    <option value="false">Paused & Hidden</option>
                  </select>
                </div>
              </div>

              {editBannerDiscountType === "combo" && (
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Select Required Combo Items</label>
                  <div className="border border-slate-200 rounded-xl p-2.5 max-h-24 overflow-y-auto space-y-1.5 bg-slate-50">
                    {currentMenuItems.map(item => {
                      const isChecked = editBannerComboItems.includes(item.id);
                      return (
                        <label key={item.id} className="flex items-center gap-2 text-[10px] cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setEditBannerComboItems(editBannerComboItems.filter(id => id !== item.id));
                              } else {
                                setEditBannerComboItems([...editBannerComboItems, item.id]);
                              }
                            }}
                            className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 w-3 h-3"
                          />
                          <span>{item.name} (₹{item.price})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingBannerId(null)}
                  className="py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-bold text-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-center"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Driver Assignment Popup Overlay */}
      {assigningOrderId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl text-xs text-left font-sans">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1"><Sliders className="w-4 h-4 text-orange-600" /> Manual Driver Dispatch</h4>
            <p className="text-slate-500 leading-relaxed">Assign active order <span className="font-mono font-bold text-orange-600">#{assigningOrderId}</span> to an idle delivery partner:</p>

            <div className="space-y-3">
              {state.drivers.filter(d => d.status === "idle" && d.backgroundStatus === "approved").length === 0 ? (
                <p className="text-xs text-rose-600 font-bold text-center py-4 bg-rose-50 rounded-xl border border-rose-100">No approved, idle drivers are currently available. Please free up a driver or toggle Auto AI Assist.</p>
              ) : (
                <div className="space-y-2 text-xs">
                  <label className="text-slate-500 font-semibold">Select Available Rider:</label>
                  <select 
                    value={selectedDriverId} 
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-850 font-bold focus:outline-none"
                  >
                    <option value="">-- Choose Rider --</option>
                    {state.drivers.filter(d => d.status === "idle" && d.backgroundStatus === "approved").map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.vehicle}) - ★{d.rating}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-2 font-bold pt-2">
              <button 
                onClick={() => setAssigningOrderId(null)} 
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleManualAssign} 
                disabled={!selectedDriverId}
                className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:hover:bg-orange-600 text-white rounded-xl transition-colors shadow-xs"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
