/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Monitor, ToggleLeft, ToggleRight, Info, Smartphone } from "lucide-react";

interface DevicePreviewProps {
  children: React.ReactNode;
  activeRole: "customer" | "driver";
  onRoleChange: (role: "customer" | "driver") => void;
  deviceType: "ios" | "android";
  onDeviceTypeChange: (type: "ios" | "android") => void;
}

export default function DevicePreview({
  children,
  activeRole,
  onRoleChange,
  deviceType,
  onDeviceTypeChange,
}: DevicePreviewProps) {
  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
      
      {/* Shell Controls */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-orange-600" />
          <span className="text-xs font-bold text-slate-800">Device Simulator Framework</span>
        </div>

        {/* OS Platform Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
          <button 
            onClick={() => onDeviceTypeChange("ios")}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${deviceType === "ios" ? "bg-white text-orange-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
          >
            Apple iOS
          </button>
          <button 
            onClick={() => onDeviceTypeChange("android")}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${deviceType === "android" ? "bg-white text-orange-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
          >
            Google Android
          </button>
        </div>
      </div>

      {/* Role Toggle Switch inside Mobile Space */}
      <div className="p-3 bg-slate-50/50 border-b border-slate-200 flex items-center justify-center gap-2 shrink-0">
        <span className="text-[10px] text-slate-500 font-medium">View App Profile:</span>
        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
          <button 
            onClick={() => onRoleChange("customer")}
            className={`px-3 py-1 text-[10px] font-extrabold rounded-lg transition-all ${activeRole === "customer" ? "bg-orange-600 text-white shadow" : "text-slate-500 hover:text-slate-800"}`}
          >
            Customer App
          </button>
          <button 
            onClick={() => onRoleChange("driver")}
            className={`px-3 py-1 text-[10px] font-extrabold rounded-lg transition-all ${activeRole === "driver" ? "bg-slate-800 text-white shadow" : "text-slate-500 hover:text-slate-800"}`}
          >
            Driver App
          </button>
        </div>
      </div>

      {/* Realistic Mobile Device Mockup Frame */}
      <div className="flex-1 bg-slate-100 flex items-center justify-center p-4 overflow-hidden relative">
        
        {/* iOS Phone Chassis */}
        {deviceType === "ios" ? (
          <div className="w-[330px] h-[580px] bg-slate-900 rounded-[48px] border-[8px] border-slate-800 shadow-2xl relative flex flex-col overflow-hidden outline outline-2 outline-slate-700/50">
            {/* iOS Status Bar Notch / Dynamic Island */}
            <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-slate-900 rounded-full absolute right-3" />
              <div className="w-1.5 h-1.5 bg-blue-900/20 rounded-full absolute right-3 animate-pulse" />
              <span className="text-[7px] text-orange-400/80 font-mono scale-90">PingZo IoT</span>
            </div>

            {/* iOS top clock speaker line */}
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-slate-800 rounded-full z-40" />

            {/* Simulated iOS Status Details */}
            <div className="absolute top-1.5 left-6 right-6 flex justify-between items-center text-[9px] text-slate-400 font-medium z-40 select-none">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <span>5G</span>
                <div className="w-4 h-2 bg-slate-400 rounded-sm p-0.5 flex items-center">
                  <div className="w-full h-full bg-slate-950 rounded-xs" />
                </div>
              </div>
            </div>

            {/* Simulated iOS bottom home indicator */}
            <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-slate-300 rounded-full z-40" />

            {/* Core Application Frame */}
            <div className="flex-1 w-full h-full pt-4 rounded-[40px] overflow-hidden">
              {children}
            </div>
          </div>
        ) : (
          /* Android Phone Chassis */
          <div className="w-[330px] h-[580px] bg-slate-900 rounded-[28px] border-[6px] border-slate-800 shadow-2xl relative flex flex-col overflow-hidden outline outline-2 outline-slate-700/30">
            {/* Android Camera Pinhole */}
            <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-black rounded-full z-50 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-blue-950 rounded-full" />
            </div>

            {/* Simulated Android Status Details */}
            <div className="absolute top-1.5 left-4 right-4 flex justify-between items-center text-[9px] text-slate-400 font-mono z-40 select-none">
              <span className="font-bold">14:42</span>
              <div className="flex items-center gap-1">
                <span className="text-[8px] border border-slate-600 px-0.5 rounded text-emerald-400 font-sans font-bold">LTE</span>
                <span>📶 98%</span>
              </div>
            </div>

            {/* Core Application Frame */}
            <div className="flex-1 w-full h-full pt-4 rounded-[22px] overflow-hidden">
              {children}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
