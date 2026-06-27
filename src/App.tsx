/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AppState } from "./types.js";
import DevicePreview from "./components/DevicePreview.js";
import CustomerApp from "./components/CustomerApp.js";
import DriverApp from "./components/DriverApp.js";
import AdminDashboard from "./components/AdminDashboard.js";
import { 
  Sparkles, Smartphone, Layers, ShieldAlert, Zap, Cpu, Bell, ExternalLink, Info
} from "lucide-react";

export default function App() {
  // Mobile frame simulator controls
  const [mobileRole, setMobileRole] = useState<"customer" | "driver">("customer");
  const [deviceOS, setDeviceOS] = useState<"ios" | "android">("ios");

  // Server state pool
  const [state, setState] = useState<AppState>({
    orders: [],
    drivers: [],
    chats: [],
    notifications: [],
    autoAssignment: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Poll state function
  const fetchState = async () => {
    try {
      const res = await fetch("/api/state");
      if (!res.ok) throw new Error("Connection lost to PingZo central engine.");
      const data = await res.json();
      setState(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sync with logistics service.");
    } finally {
      setLoading(false);
    }
  };

  // Poll intervals
  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 1500); // Fast sync for active simulation tracking
    return () => clearInterval(interval);
  }, []);

  const handleReset = async () => {
    if (!window.confirm("This will erase all current orders and revert drivers. Proceed?")) return;
    try {
      const res = await fetch("/api/admin/reset", { method: "POST" });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* Top Main Navigation Header bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black italic text-lg shadow-sm shrink-0">PZ</div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-800">PingZo <span className="text-orange-600">Control</span></h1>
              <span className="text-[10px] bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">Full-Stack Demo Workspace</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Multimodal Delivery Logistics Orchestration Ecosystem</p>
          </div>
        </div>

        {/* Global Connection Health Indicators */}
        <div className="flex items-center gap-4 text-xs font-mono">
          {error ? (
            <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 font-semibold">
              <ShieldAlert className="w-4 h-4" />
              <span>Offline</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100 font-semibold">
              <Cpu className="w-4 h-4 text-green-600 animate-pulse" />
              <span>LOGISTICS NODE ONLINE</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Split Interface Area */}
      <main className="flex-1 p-6 flex flex-col xl:flex-row gap-6 overflow-hidden">
        
        {/* Left column: Visual Mobile Simulator frame container */}
        <div className="w-full xl:w-[380px] flex flex-col shrink-0">
          <DevicePreview
            activeRole={mobileRole}
            onRoleChange={setMobileRole}
            deviceType={deviceOS}
            onDeviceTypeChange={setDeviceOS}
          >
            {mobileRole === "customer" ? (
              <CustomerApp 
                state={state} 
                onRefresh={fetchState} 
                activeDeviceType={deviceOS}
              />
            ) : (
              <DriverApp 
                state={state} 
                onRefresh={fetchState} 
                activeDeviceType={deviceOS}
              />
            )}
          </DevicePreview>
        </div>

        {/* Right column: Massive Fleet & Logistics Web Portal Dashboard */}
        <div className="flex-1 bg-transparent rounded-2xl overflow-hidden flex flex-col">
          <AdminDashboard 
            state={state} 
            onRefresh={fetchState} 
            onReset={handleReset}
          />
        </div>

      </main>

      {/* Interactive Floating Quick Tips Section */}
      <footer className="bg-white border-t border-slate-200 px-6 py-2.5 shrink-0 flex flex-col md:flex-row md:items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-orange-600 shrink-0" />
          <span>
            <span className="font-bold text-slate-400">Logistics Simulator Tutorial:</span> Place an order in the Customer app (Left phone). Switch phone to Driver App to accept and click 'Start GPS Route' to trigger real-time vehicle movement. Observe instant synchronization in the Fleet Console.
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span className="font-mono">Engine: Gemini-3.5-Flash</span>
          <span>•</span>
          <span className="font-mono">Ports: 3000 Ingress</span>
        </div>
      </footer>

    </div>
  );
}
